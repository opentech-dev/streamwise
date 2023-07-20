import { Resources } from "@app/class/helpers/resources";
import { KeyVal, OperationSchema, SchemaType, OperationFunction } from "@app/types/types";
import { BullWrapper } from "../helpers/component-connection";
import { DriverConfig } from "@app/types/connection";
import { Job } from "bullmq";

export class Operation extends BullWrapper {
  id: number | string;
  name: string;
  code: string = "OP";
  type: SchemaType = 'operation';
  inputChannel: string;
  outputChannel: string;
  options?: KeyVal;
  executor: OperationFunction;

  constructor(schema: OperationSchema, resources: Resources, driverConfig: DriverConfig) {
    super(driverConfig)
    this.id = schema.id;
    this.name = schema.name;
    this.inputChannel = schema.input;
    this.outputChannel = schema.output;
    this.options = schema.options;

    const executor = resources.get('operation', this.name) as OperationFunction;
    if (!executor) {
      throw new Error(`Cannot find ${this.type} "${this.name}" in resources`)
    }
    this.executor = executor
    this.createConnections()
  }

  createConnections() {

    const outputQ = this.createQ('outputQ', this.outputChannel);

    const inputWorker = this.createWorker('input', this.inputChannel, async (job: Job) => {
      let resolvedData;

      const resolve = (D: any) => {
        resolvedData = D
      }

      await this.executor(job.data, resolve, this.options);

      await outputQ.add(`resolved`, resolvedData)

      return resolvedData;
    })

    inputWorker.on('completed', (job: Job, returnvalue: any) => {
      job.remove();
      console.log(`Job ${job.id} - ${job.name} completed!`);
    });
  }

}