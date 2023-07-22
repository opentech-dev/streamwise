export interface OperationSchema {
  id: number | string
  type: "operation" 
  name: string
  input: string
  output?: string
  options?: any
}