export type KeyVal = {[key: string]: any}
export type OperationFunction = (data: any, resolve: Function, options?: KeyVal) => void;