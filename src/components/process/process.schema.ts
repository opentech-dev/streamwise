import { FilterSchema } from "../filter/filter.schema";
import { MergerSchema } from "../merger/merger.schema";
import { OperationSchema } from "../operation/operation.schema";

export type SchemaType = "process" | "filter" | "operation" | "merger";
export type ProcessComponents = FilterSchema | OperationSchema | MergerSchema;

export interface ProcessSchema {
  id: number | string
  name: string
  type: "process"
  inbound: string,
  outbound?: string,
  components: Array<ProcessComponents>
}