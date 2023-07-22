import { Resources } from "@app/core/resources";
import { KeyVal, SchemaType, OperationFunction } from "@app/types";
import { DriverConfig } from "@app/types/connection";
import { Job, Queue } from "bullmq";
import { OperationSchema } from "./operation.schema";
import { Component } from "@app/core/component";
import * as schemaJson from './operation.schema.json'
import { Validation } from "@app/types/component";
import { validator } from "./operation.validator";

export class Operation extends Component implements Validation<OperationSchema> {
  id: number | string;
  name: string;
  code: string = "OP";
  type: SchemaType = 'operation';
  inputChannel: string;
  outputChannel?: string;
  options?: KeyVal;
  executor: OperationFunction;
  schema: OperationSchema;

  constructor(schema: OperationSchema, resources: Resources, driverConfig: DriverConfig) {
    super(driverConfig)
    
    // Validate schema and schema logic
    this.validate(schema)

    this.id = schema.id;
    this.name = schema.name;
    this.inputChannel = schema.input;
    this.outputChannel = schema.output;
    this.options = schema.options;
    this.schema = schema;

    const executor = resources.get('operation', this.name) as OperationFunction;
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

      await this.executor(job.data, resolve, this.options);

      if (outputQ)  {
        await outputQ.add(`resolved`, resolvedData)
        return resolvedData;
      }

      // if reached here, the executor function did not invoke resolve
      if (!invocation) {
        throw new Error(`${this.type} "${this.name}" did not invoke resolve() method!`)
      }
    })

    inputWorker.on('completed', (job: Job, returnvalue: any) => {
      job.remove();
      console.log(`Operation ${job.id} - ${job.name} completed!`);
    });
  }

  validate(schema: OperationSchema) {
    this.validateSchema(schema, schemaJson);

    validator(schema);
  }

}