export type FilterFunction<T> = (data: T, criteria: any, resolve: (...args:any[])=>void, reject: (...args:any[])=>void) => void;