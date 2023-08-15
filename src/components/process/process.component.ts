import { Resources } from "@app/core/resources";
import { SchemaType } from "@app/types";
import { ProcessSchema } from "./process.schema";
import { Filter } from "../filter/filter.component";
import { Operation } from "../operation/operation.component";
import { DriverConfig } from "@app/types/connection";
import { Job, Queue, Worker } from "bullmq";
import { Merger } from "../merger/merger.component";
import { Component } from "@app/core/component";
import * as schemaJson from './process.schema.json';
import { ProcessTreeValidator } from '@app/components/process/process.validator'
import { ProcessEvent, ProcessEventType } from './process.types';
import * as EventEmmiter from 'events';
import TypedEmitter from "typed-emitter"
import { componentId } from "@app/types/component";

export class Process<T> extends Component {
  private id: componentId;
  private name: string;
  private code: string = "PRC"
  private type: SchemaType = 'process'
  private inboundChannel: string;
  private inboundQ: Queue;
  private outboundChannel?: string;
  private outboundWorker?: Worker;
  private processEvents = new EventEmmiter() as TypedEmitter<ProcessEventType<T>>;
  private components: Array<Filter<T> | Operation<T> | Merger<T>> = []
  private isDestroyed = false;

  constructor(schema: ProcessSchema, resources: Resources<T>, driverConfig: DriverConfig) {
    // const prefix = schema.name
    super( {...driverConfig });
    this.validate(schema)
    this.id = schema.id;
    this.name = schema.name;
    this.inboundChannel = schema.inbound;
    this.outboundChannel = schema.outbound;

    this.inboundQ = this.createQ('inbound', this.inboundChannel);
    this.setupOutbound();

    const components = schema.components;

    components.forEach(componentSchema => {
      switch (componentSchema.type) {
        case "filter":
          this.components.push(new Filter<T>(componentSchema, resources, this.driverConfig, this.processEvents))
          break;
        case "operation":
          this.components.push(new Operation<T>(componentSchema, resources, this.driverConfig, this.processEvents))
          break;
        case "merger":
          this.components.push(new Merger<T>(componentSchema, this.driverConfig, this.processEvents))
          break;
        default:
          throw new Error(`Uknown Component type "${JSON.stringify(componentSchema, null, 2)}"`)
      }
    })
  }

  private setupOutbound() {
    if (!this.outboundChannel) return;
    this.outboundWorker = this.createWorker('outbound', this.outboundChannel, async (job: Job) => {
      const data = job.data as T;
      this.processEvents.emit("outbound", data);
      return data;
    })

    this.outboundWorker.on('completed', async (job: Job) => {
      await job.remove();
    });
  }

  private validate(schema: ProcessSchema) {
    // Schema validation
    this.validateSchema(schema, schemaJson);

    // Logic validation
    const treeValidator = new ProcessTreeValidator();
    treeValidator.run(schema);
  }

  /** PUBLIC METHODS */
  
  public async inbound(data: T[] | T) {
    if (this.isDestroyed) {
      throw new Error(`Cannot add data to destroyed process "${this.name}" id: ${this.id}`);
    } 

    const name = "inbound";
    if (Array.isArray(data)) {
      const bulk = data.map(d => ({
        name,
        data: d
      }))
      await this.inboundQ.addBulk(bulk);
    } else {
      await this.inboundQ.add(name, data);
    }
  }

  public close() {
    this.processEvents.emit('_close');
    this.inboundQ.close();
    this.isDestroyed = true;
  }

  public on(event: ProcessEvent, callback: ProcessEventType<T>[ProcessEvent]) {
    this.processEvents.on(event, callback)
    return this;
  }

}

