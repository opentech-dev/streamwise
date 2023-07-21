import { FilterFunction, OperationFunction, PipelineStarterFunction } from "@app/types/types";
import { Resources } from "./resources";
import { Process } from "../components/process";
import { DriverConfig } from "@app/types/connection";
import { RedisOptions } from "bullmq";
import { ProcessSchema } from "@app/types/types";


export class Streamwise<T> {

  resources = new Resources()
  driverConfig: DriverConfig;

  constructor(bullConfig: RedisOptions) {
    this.driverConfig = {
      prefix: 'strws',
      connection: bullConfig
    };
  }

  filter(name: string, executor: FilterFunction) {
    this.resources.register('filter', name, executor)
  }

  operation(name: string, executor: OperationFunction) {
    this.resources.register('operation', name, executor)
  }

  loadSchema(schema: ProcessSchema): PipelineStarterFunction<T> {
    const prefix = schema.name;
    const process = new Process(schema, this.resources, {...this.driverConfig, prefix });
    const startPipeline = (data: T) => process.connectInput(data);
    return startPipeline;
  }

}



