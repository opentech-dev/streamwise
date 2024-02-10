import { QueueOptions } from "bullmq";
import { FilterSchema } from "../filter/filter.schema";
import { MergerSchema } from "../merger/merger.schema";
import { OperationSchema } from "../operation/operation.schema";
import { JobOptions } from "bull";
import { qOptions } from "@app/types";

export type SchemaType = "process" | "filter" | "operation" | "merger";
export type ProcessComponents = FilterSchema | OperationSchema | MergerSchema;

export interface ProcessSchema {
  id: number | string
  name: string
  type: "process"
  inbound: string,
  outbound?: string,
  components: Array<ProcessComponents>,
  defaultQueueOptions?: qOptions
}