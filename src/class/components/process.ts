import { Resources } from "@app/class/core/resources";
import { ProcessSchema, SchemaType } from "@app/types";
import { Filter } from "./filter";
import { Operation } from "./operation";
import { DriverConfig } from "@app/types/connection";
import { BullWrapper } from "../core/bull-wrapper";
import { Queue } from "bullmq";

export class Process<T> extends BullWrapper {
  id: number | string;
  name: string;
  code: string = "PRC"
  type: SchemaType = 'process'
  dataEntryChannel: string;
  dataEntryQ: Queue;
  outputChannel: string;
  components: Array<Filter | Operation> = []
  driverConfig: DriverConfig;

  constructor(schema: ProcessSchema, resources: Resources, driverConfig: DriverConfig) {
    // const prefix = schema.name
    super( {...driverConfig });
    this.id = schema.id;
    this.name = schema.name;
    this.dataEntryChannel = schema.dataEntry;
    this.outputChannel = schema.output;
    this.driverConfig = {...driverConfig };

    this.dataEntryQ = this.createQ('dataEntry', this.dataEntryChannel);

    const components = schema.components;

    components.forEach(componentSchema => {
      switch (componentSchema.type) {
        case "filter":
          this.components.push(new Filter(componentSchema, resources, this.driverConfig))
          break;
        case "operation":
          this.components.push(new Operation(componentSchema, resources, this.driverConfig))
          break;
        default:
          throw new Error(`Uknown Component type "${componentSchema.type}"`)
      }
    })
  }

  async connectInput(data: T) {
    const name = `${this.dataEntryChannel}.data-entry`;
    if (Array.isArray(data)) {
      const bulk = data.map(d => ({
        name,
        data: d
      }))
      await this.dataEntryQ.addBulk(bulk);
    } else {
      await this.dataEntryQ.add(name, data)
    }
  }

}