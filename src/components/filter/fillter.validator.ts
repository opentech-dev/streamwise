import { FilterSchema } from "./filter.schema";

export const validator = (schema: FilterSchema) => {
  const input = schema.input;
  const output = [
    schema.output.resolve,
    schema.output.reject,
  ]

  if (output.indexOf(input) > -1) {
    throw new Error(`Filter "${schema.name}" is connected to itself!`);
  }
  
}