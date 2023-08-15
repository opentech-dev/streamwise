import { Component } from "@app/core/component";
import { ProcessEventType, SchemaType } from "@app/types";
import { MergerSchema } from './merger.schema';
import { DriverConfig } from "@app/types/connection";
import { Job } from "bullmq";
import * as schemaJson from './merger.schema.json';
import { Validation, componentId } from "@app/types/component";
import { validator } from "./merger.validator";
import TypedEventEmitter from "typed-emitter";

export class Merger<T> extends Component implements Validation<MergerSchema> {
  id: componentId;
  name: string;
  code: string = "MRG";
  type: SchemaType = 'merger';
  inputChannels: Array<string> = [];
  outputChannel: string;
  schema: MergerSchema;
  processEvents: TypedEventEmitter<ProcessEventType<T>>;

  constructor(schema: MergerSchema, driverConfig: DriverConfig, processEvents: TypedEventEmitter<ProcessEventType<T>>) {
    super(driverConfig)
    // validate schema and schema logic
    this.validate(schema)

    this.id = schema.id;
    this.name = schema.name;
    this.inputChannels = schema.inputs;
    this.outputChannel = schema.output;
    this.schema = schema;
    this.processEvents = processEvents;

    this.createConnections()
  }

  createConnections() {
    const outputQ = this.createQ('outputQ', this.outputChannel);

    this.processEvents.once('_close', () => {
      if (outputQ) outputQ.close();
    })

    const listener = async (job: Job) => {
      await outputQ.add(`resolved`, job.data)
    }

    this.inputChannels.map((channel, i) => {
      const worker = this.createWorker(`input-${i}`, channel, listener);
      worker.on('completed', async (job: Job) => {
        const data = job.data as T;
        this.processEvents.emit('progress', this.id, data)
        await job.remove();
      });

      worker.on('failed', (job: Job|undefined, error: Error) => {
        this.processEvents.emit('failed', error, job as Job)
      });

      return worker;
    })
  }

  validate(schema: MergerSchema) {
    this.validateSchema(schema, schemaJson)
    validator(schema)
  }

}