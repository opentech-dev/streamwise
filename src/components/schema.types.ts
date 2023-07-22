import { FilterSchema } from './filter/filter.schema'
import { OperationSchema } from './operation/operation.schema'
import { MergerSchema } from './merger/merger.schema'
import { ProcessSchema } from './process/process.schema'

export {
  FilterSchema,
  OperationSchema,
  MergerSchema,
  ProcessSchema
}

export type ComponentsSchema = FilterSchema | OperationSchema | MergerSchema | ProcessSchema