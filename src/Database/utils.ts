export function getDBVersion(storage: Storage) {
  return parseInt(storage.getItem('db_ver') ?? '0')
}
export function setDBVersion(storage: Storage, version: number) {
  storage.setItem('db_ver', version.toString())
}

export function load(storage: Storage, key: string): any | undefined {
  const string = storage.getItem(key)
  if (!string) return undefined
  try {
    return JSON.parse(string)
  } catch {
    storage.removeItem(key)
    return undefined
  }
}
export function save(storage: Storage, key: string, value: any) {
  storage.setItem(key, JSON.stringify(value))
}
export function remove(storage: Storage, key: string) {
  storage.removeItem(key)
}
