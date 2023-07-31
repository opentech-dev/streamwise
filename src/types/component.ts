export type componentId = string | number;

export interface Validation<T> {
  validate: (schema: T) => void
}