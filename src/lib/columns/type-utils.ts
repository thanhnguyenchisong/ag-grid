type KnownKeys<T> = {
  [K in keyof T as string extends K ? never : K]: T[K];
};

/** Keys of T whose value type extends boolean (skips string index signatures). */
export type BooleanKeys<T> = {
  [K in keyof KnownKeys<T> as KnownKeys<T>[K] extends boolean ? K : never]: KnownKeys<T>[K];
}[keyof KnownKeys<T>];
