import { FilterFunction, OperationFunction } from '../components/components.types';
export { DriverConfig } from './connection';

export * from '../components/schema.types';
export * from '../components/components.types';

export type SchemaType = 'process' | 'filter' | 'operation' | 'merger';

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
