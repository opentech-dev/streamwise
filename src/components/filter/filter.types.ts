export type FilterFunction<T> = (data: T, criteria: any, resolve: Function, reject: Function) => void;