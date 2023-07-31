import { Resources } from "@app/core/resources";
import { KeyVal, SchemaType, OperationFunction, ProcessEventType } from "@app/types";
import { DriverConfig } from "@app/types/connection";
import { Job, Queue } from "bullmq";
import { OperationSchema } from "./operation.schema";
import { Component } from "@app/core/component";
import * as schemaJson from './operation.schema.json'
import { Validation } from "@app/types/component";
import { validator } from "./operation.validator";
import TypedEventEmitter from "typed-emitter";

export class Operation<T> extends Component implements Validation<OperationSchema> {
  id: number | string;
  name: string;
  code: string = "OP";
  type: SchemaType = 'operation';
  inputChannel: string;
  outputChannel?: string;
  options?: KeyVal;
  executor: OperationFunction<T>;
  schema: OperationSchema;
  processEvents: TypedEventEmitter<ProcessEventType<T>>;

  constructor(schema: OperationSchema, resources: Resources<T>, driverConfig: DriverConfig, processEvents: TypedEventEmitter<ProcessEventType<T>>) {
    super(driverConfig)
    
    // Validate schema and schema logic
    this.validate(schema)

    this.id = schema.id;
    this.name = schema.name;
    this.inputChannel = schema.input;
    this.outputChannel = schema.output;
    this.options = schema.options;
    this.schema = schema;
    this.processEvents = processEvents;

    const executor = resources.get('operation', this.name) as OperationFunction<T>;
    if (!executor) {
      throw new Error(`Cannot find ${this.type} "${this.name}" in resources`)
    }
    this.executor = executor
    this.createConnections()
  }

  createConnections() {
    let invocation = false;
    let outputQ: Queue;

    if (this.outputChannel) {
      outputQ = this.createQ('outputQ', this.outputChannel);
    }

    const inputWorker = this.createWorker('input', this.inputChannel, async (job: Job) => {
      let resolvedData;

      const resolve = (D: any) => {
        invocation = true;
        resolvedData = D
      }

      await this.executor(job.data as T, resolve, this.options);

      if (outputQ)  {
        await outputQ.add(`resolved`, resolvedData)
        return resolvedData;
      }

      // if reached here, the executor function did not invoke resolve
      if (!invocation) {
        throw new Error(`${this.type} "${this.name}" did not invoke resolve() method!`)
      }
    })

    inputWorker.on('completed', async (job: Job, returnvalue: any) => {
      await job.remove();
    });

    inputWorker.on('progress', (job: Job, progress: number | object) => {
      const data = job.data as T;
      this.processEvents.emit('progress', this.name, data, progress, job)
    });

    inputWorker.on('failed', (job: Job|undefined, error: Error) => {
      this.processEvents.emit('failed', error, job as Job)
    });

  }

  validate(schema: OperationSchema) {
    this.validateSchema(schema, schemaJson);

    validator(schema);
  }

}