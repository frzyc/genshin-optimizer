export function evalIfFunc<T, X>(value: T | ((arg: X) => T), arg: X): T {
  return typeof value === 'function' ? (value as any)(arg) : value
}

export function assertUnreachable(value: never): never {
  throw new Error(`Should not reach this with value ${value}`)
}
