export function validateArr<T>(obj: unknown, validKeys: readonly T[], def?: T[]): T[] {
  if (!Array.isArray(obj)) return def ?? [...validKeys]
  return obj.filter(k => validKeys.includes(k))
}

export function validateObject(obj: unknown, vKey: (k: string) => boolean, vEntry: (o: unknown) => boolean) {
  if (typeof obj !== "object") return {}
  return Object.fromEntries(Object.entries(obj as object).filter(([k, e]) => vKey(k) && vEntry(e)))
}
