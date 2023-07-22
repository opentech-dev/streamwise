import { OperationSchema } from "./operation.schema";

export const validator = (schema: OperationSchema) => {
  const { input, output } = schema;
  
  if (input === output) {
    throw new Error(`Operation "${schema.name}" cannot be connected to itself!`);
  }
}