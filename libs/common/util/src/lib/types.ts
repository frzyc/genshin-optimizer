export type Unpromise<T> = T extends Promise<infer U> ? U : T
export type UnArray<A> = A extends readonly (infer T)[] ? T : never
