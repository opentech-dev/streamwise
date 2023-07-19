import { Job } from "bullmq";
import { Resources } from "@app/class/core/resources";
import { FilterSchema, SchemaType, FilterFunction } from "@app/types";
import { BullWrapper } from "../core/bull-wrapper";
import { DriverConfig } from "@app/types/connection";

export class Filter extends BullWrapper {
  id: number | string;
  name: string;
  code: string = "FL"; 
  type: SchemaType = 'filter';
  criteria: any;
  inputChannel: string;
  outputChannels: [resolved: string, rejected: string];
  executor: FilterFunction;

  constructor(schema: FilterSchema, resources: Resources, driverConfig: DriverConfig) {
    super(driverConfig)
    this.id = schema.id;
    this.name = schema.name;
    this.inputChannel = schema.input;
    this.outputChannels = schema.output;
    this.criteria = schema.criteria;

    const executor = resources.get('filter', this.name) as FilterFunction;
    if (!executor) {
      throw new Error(`Cannot find ${this.type} "${this.name}" in resources`)
    }
    this.executor = executor;
    this.createConnections()
  }

  createConnections() {
    if (!this.driverConfig) return;

    const passQ = this.createQ('resolve', this.outputChannels[0])
    const rejectQ = this.createQ('reject', this.outputChannels[1])

    const inputWorker = this.createWorker('input', this.inputChannel, async (job: Job) => {
      let resolvedData, rejectedData;

      const resolve = (D: any) => {
        resolvedData = D
      }

      const reject = (D: any) => {
        rejectedData = D
      }

      await this.executor(job.data, this.criteria, resolve, reject);

      if (resolvedData) {
        await passQ.add('resolved', resolvedData)
        return resolvedData;
      } 
      
      if (rejectedData) {
        await rejectQ.add('resolved', rejectedData)
        return rejectedData;
      }

      // if reached here, the execution function missed evauation of data
      // TODO :: investigate the case when an execution function failed to filter data
    })

    inputWorker.on('completed', (job: Job, returnvalue: any) => {
      job.remove();
      console.log(`Job ${job.id} - ${job.name} completed!`);
    });
  }
}