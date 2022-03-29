/**
 * @deprecated
 * @param prefix
 * @returns
 */
export function KeyPath<Base, Value = Base>(prefix: string[] = []): PartialPath<Base, Value> {
  const path = () => path.keys
  path.keys = prefix

  return new Proxy(path, {
    get: (partial, symbol) => KeyPath([...partial.keys, symbol.toString()])
  }) as any
}
export function resolve<Base, Value>(base: Base, path: Path<Base, Value>): Value {
  return path.reduce((current, key) => current?.[key], base as any)
}
export function assign<Base, Value>(base: Base, path: Path<Base, Value>, value: Value) {
  path.reduce((accu, key, i, arr) => {
    if (i === arr.length - 1) return (accu[key] = value)
    if (!accu[key]) accu[key] = {}
    return accu[key]
  }, base as any)
}

type PartialPath<Base, Value> = {
  [key in keyof Value]: PartialPath<Base, Value[key]> & (() => Path<Base, Value>)
}
// eslint-disable-next-line
export type Path<Base, Value> = readonly string[]
