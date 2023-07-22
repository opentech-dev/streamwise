export type KeyVal = {[key: string]: any}
export type OperationFunction<T> = (data: T, resolve: Function, options?: KeyVal) => void;