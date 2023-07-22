import { ComponentsSchema } from ".";

export interface Validation<T> {
  validate: (schema: T) => void
}