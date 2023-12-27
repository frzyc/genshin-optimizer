import type { DBStorage, DbIndexKey, DbVersionKey } from './DBStorage'

export class SandboxStorage implements DBStorage {
  protected storage: Record<string, string> = {}

  constructor(obj?: Record<string, string>) {
    if (obj) this.storage = obj
  }

  get keys(): string[] {
    return Object.keys(this.storage)
  }
  get entries(): [key: string, value: string][] {
    return Object.entries(this.storage)
  }

  get(key: string) {
    const string = this.storage[key]
    if (!string) return undefined
    try {
      return JSON.parse(string)
    } catch {
      delete this.storage[key]
      return undefined
    }
  }
  set(key: string, value: any): void {
    this.storage[key] = JSON.stringify(value)
  }

  getString(key: string): string | undefined {
    return this.storage[key]
  }
  setString(key: string, value: string): void {
    this.storage[key] = value
  }
  remove(key: string): void {
    delete this.storage[key]
  }

  copyFrom(other: DBStorage) {
    for (const [key, value] of other.entries) {
      this.setString(key, value)
    }
  }
  clear() {
    this.storage = {}
  }
  removeForKeys(shouldRemove: (key: string) => boolean) {
    this.storage = Object.fromEntries(
      Object.entries(this.storage).filter(([key]) => !shouldRemove(key))
    )
  }
  getDBVersion(key: DbVersionKey = 'db_ver'): number {
    return parseInt(this.getString(key) ?? '0')
  }
  setDBVersion(version: number, key: DbVersionKey = 'db_ver'): void {
    this.setString(key, version.toString())
  }
  getDBIndex(key: DbIndexKey = 'dbIndex'): 1 | 2 | 3 | 4 {
    return parseInt(this.getString(key) ?? '1') as 1 | 2 | 3 | 4
  }
  setDBIndex(ind: 1 | 2 | 3 | 4, key: DbIndexKey = 'dbIndex') {
    this.setString(key, ind.toString())
  }
}
