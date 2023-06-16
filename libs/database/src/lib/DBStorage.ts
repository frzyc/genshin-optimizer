export interface DBStorage {
  keys: string[]
  entries: [key: string, value: string][]

  get(key: string): any | undefined
  set(key: string, value: any): void

  getString(key: string): string | undefined
  setString(key: string, value: string): void
  remove(key: string): void
  removeForKeys(shouldRemove: (key: string) => boolean): void

  copyFrom(other: DBStorage): void
  clear(): void
  getDBVersion(): number
  setDBVersion(version: number): void
  getDBIndex(): 1 | 2 | 3 | 4
  setDBIndex(ind: 1 | 2 | 3 | 4): void
}
