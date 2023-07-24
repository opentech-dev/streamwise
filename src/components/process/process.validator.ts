import { ProcessSchema } from "@app/types";


export class ProcessTreeValidator {
  inputs  = new Set<string>();
  outputs = new Set<string>();
  tree = {};

  run(schema: ProcessSchema) {
    
      /**
       * Parse all components and colect all inputs and outputs
       * Inputs an Outputs must form pairs. 
       * If there are Otputs with no pairs, this means there are empty Queue(s) where messages get stuck
       */
      
      schema.components.forEach((cSchema) => {
        switch (cSchema.type) {

          case "filter":
            this.inputs.add(cSchema.input)
              
            if (cSchema.output.resolve) this.outputs.add(cSchema.output.resolve);
            if (cSchema.output.reject) this.outputs.add(cSchema.output.reject);

            break;
          case "operation":
            this.inputs.add(cSchema.input)
            if (cSchema.output) this.outputs.add(cSchema.output)
            break;

          case "merger":
            cSchema.inputs.forEach(i => this.inputs.add(i));
            this.outputs.add(cSchema.output)
            break;

          default:
            throw new Error(`Unknown Schema Type ${JSON.stringify(cSchema, null, 2)}`)
        }
      })

      this.inputs.delete(schema.inbound)
      if (schema.outbound) this.outputs.delete(schema.outbound)

      this.checkForPairs()
  }

  checkForPairs() {
    for( let channelIn of [...this.inputs]) {
      if (this.outputs.has(channelIn)) {
        this.outputs.delete(channelIn);
        this.inputs.delete(channelIn);
      }
    }
    
    if (this.inputs.size) {
      throw new Error(
        `The following channel inputs are not connected:\n
          ${[...this.inputs].join('\n')} \n
        Check your Schema and try again \n
        `)
    }

    if (this.outputs.size) {
      throw new Error(
        `The following channel outputs are not connected:\n
          ${[...this.outputs].join('\n')} \n
        Check your Schema and try again \n
        `)
    }

  }

}

 