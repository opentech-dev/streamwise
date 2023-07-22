import Ajv, { Schema } from 'ajv';
import { ComponentsSchema } from '@app/types';

const ajv = new Ajv();

export const SchemaValidator = (schema: ComponentsSchema, schemaJson: Schema) => {
 
  const type = schema.type;
  const name = schema.name;
  
  const validator = ajv.compile(schemaJson)

  if (!validator(schema)) {
    const errors = validator.errors?.map(err => `- ${err.message}; ${err.keyword}`);
    const message = `Schema of type="${type}" name="${name}" is INVALID; \n${errors?.join('\n')}`;
    throw new Error(message);
  }

}