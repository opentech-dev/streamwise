
export interface Validation<T> {
  validate: (schema: T) => void
}