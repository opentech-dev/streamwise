import { ResourceFunctionTypes, ResourceStore, SchemaType, ComponentType } from "@app/types";

export class Resources {

  resources: ResourceStore = {
    process: new Map(),
    filter: new Map(),
    operation: new Map(),
    merger: new Map()
  }

  register(type: SchemaType, name: string, resource: ResourceFunctionTypes) {
    const resourceMap = this.resources[type]
    resourceMap.set(name, resource);
  }

  get(type: ComponentType, name: string) {
    return this.resources[type].get(name);
  }

}

export const resources = new Resources()