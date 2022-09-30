export function validateArr<T>(obj: any, validKeys: readonly T[], def?: T[]): T[] {
  if (!Array.isArray(obj)) return def ?? [...validKeys]
  return obj.filter(k => validKeys.includes(k))
}

export function validateObject(obj: any, vKey: (k: string) => boolean, vEntry: (o: any) => boolean) {
  if (typeof obj !== "object") return {}
  return Object.fromEntries(Object.entries(obj).filter(([k, e]) => vKey(k) && vEntry(e)))
}
