import { Component } from "@app/core/component";
import { SchemaType } from "@app/types";
import { MergerSchema } from './merger.schema';
import { DriverConfig } from "@app/types/connection";
import { Job } from "bullmq";
import * as schemaJson from './merger.schema.json';
import { Validation } from "@app/types/component";
import { validator } from "./merger.validator";

export class Merger extends Component implements Validation<MergerSchema> {
  id: number | string;
  name: string;
  code: string = "MRG";
  type: SchemaType = 'merger';
  inputChannels: Array<string> = [];
  outputChannel: string;
  schema: MergerSchema;

  constructor(schema: MergerSchema, driverConfig: DriverConfig) {
    super(driverConfig)
    // validate schema and schema logic
    this.validate(schema)

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

  validate(schema: MergerSchema) {
    this.validateSchema(schema, schemaJson)
    validator(schema)
  }

}