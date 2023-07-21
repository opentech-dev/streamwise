import { Job, Queue } from "bullmq";
import { Resources } from "@app/class/core/resources";
import { FilterSchema, SchemaType, FilterFunction, FilterOutput } from "@app/types/types";
import { BullWrapper } from "../core/component-connection";
import { DriverConfig } from "@app/types/connection";

export class Filter extends BullWrapper {
  id: number | string;
  name: string;
  code: string = "FL"; 
  type: SchemaType = 'filter';
  criteria: any;
  inputChannel: string;
  outputChannels: FilterOutput;
  executor: FilterFunction;  
  schema: FilterSchema;

  constructor(schema: FilterSchema, resources: Resources, driverConfig: DriverConfig) {
    super(driverConfig)
    this.id = schema.id;
    this.name = schema.name;
    this.inputChannel = schema.input;
    this.outputChannels = schema.output;
    this.criteria = schema.criteria;
    this.schema = schema;

    const executor = resources.get('filter', this.name) as FilterFunction;
    if (!executor) {
      throw new Error(`Cannot find ${this.type} "${this.name}" in resources`)
    }
    this.executor = executor;
    this.createConnections()
  }

  createConnections() {
    if (!this.driverConfig) return;
    let passQ: Queue; 
    let rejectQ:Queue;
    
    if (this.outputChannels.resolve) {
      passQ = this.createQ('resolve', this.outputChannels.resolve)
    }

    if (this.outputChannels.reject) {
      rejectQ = this.createQ('reject', this.outputChannels.reject)
    }

    const inputWorker = this.createWorker('input', this.inputChannel, async (job: Job) => {
      let invocation = false;
      let resolvedData, rejectedData;

      const resolve = (D: any) => {
        invocation = true;
        resolvedData = D
      }

      const reject = (D: any) => {
        invocation = true;
        rejectedData = D
      }

      await this.executor(job.data, this.criteria, resolve, reject);

      if (resolvedData && passQ) {
        await passQ.add('resolved', resolvedData)
        return resolvedData;
      }
      
      if (rejectedData && rejectQ) {
        await rejectQ.add('resolved', rejectedData)
        return rejectedData;
      }

      // if reached here, the executor function did not invoke reject or resolve
      if (!invocation) {
        throw new Error(`${this.type} "${this.name}" did not invoke reject() or resolve() methods!`)
      }
    })

    inputWorker.on('completed', (job: Job, returnvalue: any) => {
      job.remove();
      console.log(`Filter ${job.id} - ${job.name} completed!`);
    });
  }
}