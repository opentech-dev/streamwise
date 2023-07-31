import { Job, Queue } from "bullmq";
import { Resources } from "@app/core/resources";
import { FilterSchema, FilterOutput } from "./filter.schema";
import { DriverConfig } from "@app/types/connection";
import { Component } from "@app/core/component";
import * as schemaJson from './filter.schema.json';
import { FilterFunction, ProcessEventType, SchemaType } from "@app/types";
import { Validation } from "@app/types/component";
import { validator } from './fillter.validator'
import { EventEmitter } from "stream";
import TypedEventEmitter from "typed-emitter";

export class Filter<T> extends Component implements Validation<FilterSchema> {
  id: number | string;
  name: string;
  code: string = "FL"; 
  type: SchemaType = 'filter';
  criteria: any;
  inputChannel: string;
  outputChannels: FilterOutput;
  executor: FilterFunction<T>;  
  schema: FilterSchema;
  processEvents: TypedEventEmitter<ProcessEventType<T>>;

  constructor(schema: FilterSchema, resources: Resources<T>, driverConfig: DriverConfig, processEvents: TypedEventEmitter<ProcessEventType<T>>) {
    super(driverConfig)
    this.validate(schema);
    this.id = schema.id;
    this.name = schema.name;
    this.inputChannel = schema.input;
    this.outputChannels = schema.output;
    this.criteria = schema.criteria;
    this.schema = schema;
    this.processEvents = processEvents;

    const executor = resources.get('filter', this.name) as FilterFunction<T>;
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

      await this.executor(job.data as T, this.criteria, resolve, reject);

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


  validate(schema: FilterSchema) {
    // schema validation
    this.validateSchema(schema, schemaJson)

    // functional validator
    validator(schema)
  }
}