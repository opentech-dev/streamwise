import { ComponentsSchema, DriverConfig } from "@app/types";
import { BullWrapper } from "./bull-wrapper";
import { SchemaValidator } from "@app/schema-validator/schema-validator";
import { Schema } from "ajv";

export class Component extends BullWrapper {
  constructor(driverConfig: DriverConfig) {
    super(driverConfig)
  }

  validateSchema(schema: ComponentsSchema, schemaJson: Schema) {
    SchemaValidator(schema, schemaJson)
  }
}
