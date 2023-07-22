export interface MergerSchema {
  id: number | string
  type: "merger"
  name: string,
  inputs: string[]
  output: string
}