import { ComponentsSchema, DriverConfig, qOptions } from "@app/types";
import { BullWrapper } from "./bull-wrapper";
import { SchemaValidator } from "@app/schema-validator/schema-validator";
import { Schema } from "ajv";
import { QueueOptions } from "bullmq";

export class Component extends BullWrapper {
  constructor(driverConfig: DriverConfig, defaultQueueOptions?: qOptions) {
    super(driverConfig, defaultQueueOptions)
  }

  validateSchema(schema: ComponentsSchema, schemaJson: Schema) {
    SchemaValidator(schema, schemaJson)
  }
}
