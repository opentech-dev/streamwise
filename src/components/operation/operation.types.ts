export type KeyVal = {[key: string]: any}
export type OperationFunction<T> = (data: T, resolve: (...args:any[])=>void, options?: KeyVal) => void;