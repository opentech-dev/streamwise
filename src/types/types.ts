export { DriverConfig } from './connection';

/**
 * JSON Schema Definitions
 */

export type KeyVal = {[key: string]: any}

export interface ProcessSchema {
  id: number | string
  name: string
  type: "process"
  dataEntry: string,
  output: string,
  components: Array<ComponentsSchema>
}

export interface FilterSchema {
  id: number | string
  type: "filter"
  name: string,
  input: string
  output: FilterOutput
  criteria: any
}

export type FilterOutput = {
  resolve?: string;
  reject?: string;
} & ({ resolve: string } | { reject: string }); // at least one should NOT be empty


export interface OperationSchema {
  id: number | string
  type: "operation" 
  name: string
  input: string
  output?: string
  options?: KeyVal
}

export interface MergerSchema {
  id: number | string
  type: "merger"
  name: string,
  inputs: string[]
  output: string
}


export type SchemaType = "process" | "filter" | "operation" | "merger"
export type ComponentsSchema = FilterSchema | OperationSchema | MergerSchema;


/*** */

/**
 * Component Executors
 */

export type FilterFunction = (data: any, criteria: any, resolve: Function, reject: Function) => void;

export type OperationFunction = (data: any, resolve: Function, options?: KeyVal) => void;

/*** */


// Pipeline Starter Function
export type PipelineStarterFunction<T> = (data: T) => void;


/**
 * Resource Storage Configurations
 */

/**
 * resource - a storage for components executor functions
 * It's used by the constructors to identify their executors.
 * Currently only operation and filters have executor functions
 */

export type ResourceFunctionTypes = FilterFunction | OperationFunction

export type ResourceStore = {
  [key in SchemaType]: Map<string, ResourceFunctionTypes>;
};

export type ComponentType = "filter" | "operation"

export type ComponentConfig = {
  type: ComponentType, 
  name: string, 
  resource: ResourceFunctionTypes
}

export type ComponentsLib = Array<ComponentConfig>

/*** */
