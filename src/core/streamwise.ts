import { FilterFunction, OperationFunction, PipelineStarterFunction } from "@app/types";
import { Resources } from "./resources";
import { Process } from "../components/process/process.component";
import { DriverConfig } from "@app/types/connection";
import { RedisOptions } from "bullmq";
import { ProcessSchema } from "@app/types";

export class Streamwise<T> {

  resources = new Resources<T>()
  driverConfig: DriverConfig;

  constructor(bullConfig: RedisOptions) {
    this.driverConfig = {
      prefix: 'strws',
      connection: bullConfig
    };
  }

  filter(name: string, executor: FilterFunction<T>) {
    this.resources.register('filter', name, executor)
  }

  operation(name: string, executor: OperationFunction<T>) {
    this.resources.register('operation', name, executor)
  }

  loadSchema(schema: ProcessSchema): PipelineStarterFunction<T[]> {
    const prefix = schema.name;
    const process = new Process<T>(schema, this.resources, {...this.driverConfig, prefix });
    const startPipeline = (data: T[]) => process.connectInput(data);
    return startPipeline;
  }

}



