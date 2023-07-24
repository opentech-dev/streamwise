import { Resources } from "@app/core/resources";
import { SchemaType } from "@app/types";
import { ProcessSchema } from "./process.schema";
import { Filter } from "../filter/filter.component";
import { Operation } from "../operation/operation.component";
import { DriverConfig } from "@app/types/connection";
import { Queue } from "bullmq";
import { Merger } from "../merger/merger.component";
import { Component } from "@app/core/component";
import * as schemaJson from './process.schema.json';
import { ProcessTreeValidator } from '@app/components/process/process.validator'

export class Process<T> extends Component {
  id: number | string;
  name: string;
  code: string = "PRC"
  type: SchemaType = 'process'
  inboundChannel: string;
  inboundQ: Queue;
  outboundChannel: string;
  components: Array<Filter<T> | Operation<T> | Merger> = []
  driverConfig: DriverConfig;

  constructor(schema: ProcessSchema, resources: Resources<T>, driverConfig: DriverConfig) {
    // const prefix = schema.name
    super( {...driverConfig });
    this.validate(schema)
    this.id = schema.id;
    this.name = schema.name;
    this.inboundChannel = schema.inbound;
    this.outboundChannel = schema.outbound;
    this.driverConfig = {...driverConfig };

    this.inboundQ = this.createQ('inbound', this.inboundChannel);

    const components = schema.components;

    components.forEach(componentSchema => {
      switch (componentSchema.type) {
        case "filter":
          this.components.push(new Filter<T>(componentSchema, resources, this.driverConfig))
          break;
        case "operation":
          this.components.push(new Operation<T>(componentSchema, resources, this.driverConfig))
          break;
        case "merger":
          this.components.push(new Merger(componentSchema, this.driverConfig))
          break;
        default:
          throw new Error(`Uknown Component type "${JSON.stringify(componentSchema, null, 2)}"`)
      }
    })
  }

  async connectInput(data: T[] | T) {
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

  validate(schema: ProcessSchema) {
    // Schema validation
    this.validateSchema(schema, schemaJson);

    // Logic validation
    const treeValidator = new ProcessTreeValidator();
    treeValidator.run(schema);
  }

}
