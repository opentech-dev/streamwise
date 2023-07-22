import { MergerSchema } from "./merger.schema";

export const validator = (schema: MergerSchema) => {
  const inputs = schema.inputs;
  const output = schema.output;
  
  if (inputs.indexOf(output) > -1) {
    throw new Error(`Merger "${schema.name}" cannot be connected to itself!`);
  }
}