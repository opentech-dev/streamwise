import { QueueOptions } from "bullmq";
import { FilterSchema } from "../filter/filter.schema";
import { MergerSchema } from "../merger/merger.schema";
import { OperationSchema } from "../operation/operation.schema";
import { JobOptions } from "bull";

export type SchemaType = "process" | "filter" | "operation" | "merger";
export type ProcessComponents = FilterSchema | OperationSchema | MergerSchema;
interface qOptions {
  defaultJobOptions : JobOptions
  streams?: {
    events: {
        maxLen: number;
    };
  };
}

export interface ProcessSchema {
  id: number | string
  name: string
  type: "process"
  inbound: string,
  outbound?: string,
  components: Array<ProcessComponents>,
  defaultQueueOptions?: qOptions
}