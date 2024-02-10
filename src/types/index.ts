import { JobOptions } from 'bull';
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

export type ResourceFunctionTypes<T> = FilterFunction<T> | OperationFunction<T>

export type ResourceStore<T> = {
  [key in SchemaType]: Map<string, ResourceFunctionTypes<T>>;
};

export type ComponentType = "filter" | "operation"

export type ComponentConfig<T> = {
  type: ComponentType, 
  name: string, 
  resource: ResourceFunctionTypes<T>
}

export type ComponentsLib<T> = Array<ComponentConfig<T>>

/*** */

export interface qOptions {
  defaultJobOptions : JobOptions
  streams?: {
    events: {
        maxLen: number;
    };
  };
}
