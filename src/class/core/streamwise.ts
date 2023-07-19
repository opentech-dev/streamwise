import { FilterFunction, OperationFunction, PipelineStarterFunction } from "@app/types";
import { Resources } from "./resources";
import { Process } from "../components/process";
import { DriverConfig } from "@app/types/connection";
import { RedisOptions } from "bullmq";
import { ProcessSchema } from "@app/types";


export class Streamwise<T> {

  resources = new Resources()
  driverConfig: DriverConfig;

  constructor(bullConfig: RedisOptions) {
    this.driverConfig = {
      prefix: 'stw',
      connection: bullConfig
    };
  }

  filter(name: string, executor: FilterFunction) {
    this.resources.register('filter', name, executor)
  }

  operation(name: string, executor: OperationFunction) {
    this.resources.register('operation', name, executor)
  }

  provideSchema(schema: ProcessSchema): PipelineStarterFunction<T> {
    const process = new Process(schema, this.resources, this.driverConfig);
    const startPipeline = (data: T) => process.connectInput(data);
    return startPipeline;
  }

}



