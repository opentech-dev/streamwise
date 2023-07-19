import { RedisOptions } from "bullmq";

export interface DriverConfig {
  prefix?: string
  connection: RedisOptions
}