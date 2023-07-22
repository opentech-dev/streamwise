export interface FilterSchema {
  id: number | string
  type: "filter"
  name: string,
  input: string
  output: FilterOutput
  criteria: any
}

export type FilterOutput = {
  resolve?: string;
  reject?: string;
} & ({ resolve: string } | { reject: string }); // at least one should NOT be empty

