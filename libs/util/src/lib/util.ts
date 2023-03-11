export function crawlObject(
  obj: any,
  keys: string[] = [],
  validate: (o: any, keys: string[]) => boolean,
  cb: (o: any, keys: string[]) => void
) {
  if (validate(obj, keys)) cb(obj, keys)
  else
    obj &&
      typeof obj === 'object' &&
      Object.entries(obj).forEach(([key, val]) =>
        crawlObject(val, [...keys, key], validate, cb)
      )
}

//assign obj.[keys...] = value
export function layeredAssignment<T>(
  obj: any,
  keys: Array<number | string>,
  value: T
) {
  keys.reduce((accu, key, i, arr) => {
    if (i === arr.length - 1) return (accu[key] = value)
    if (!accu[key]) accu[key] = {}
    return accu[key]
  }, obj)
  return obj
}
