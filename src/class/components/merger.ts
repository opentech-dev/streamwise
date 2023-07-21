import { Resources } from "@app/class/core/resources";
import { KeyVal, OperationSchema, SchemaType, OperationFunction, MergerSchema } from "@app/types/types";
import { BullWrapper } from "../core/component-connection";
import { DriverConfig } from "@app/types/connection";
import { Job, Queue } from "bullmq";

export class Merger extends BullWrapper {
  id: number | string;
  name: string;
  code: string = "MRG";
  type: SchemaType = 'merger';
  inputChannels: Array<string> = [];
  outputChannel: string;
  schema: MergerSchema;

  constructor(schema: MergerSchema, driverConfig: DriverConfig) {
    super(driverConfig)
    this.id = schema.id;
    this.name = schema.name;
    this.inputChannels = schema.inputs;
    this.outputChannel = schema.output;
    this.schema = schema;

    this.createConnections()
  }

  createConnections() {
    const outputQ = this.createQ('outputQ', this.outputChannel);

    const listener = async (job: Job) => {
      await outputQ.add(`resolved`, job.data)
      await job.remove();
    }

    this.inputChannels.map((channel, i) => this.createWorker(`input-${i}`, channel, listener))
  }

}