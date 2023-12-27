import type { DBStorage, DbIndexKey, DbVersionKey } from './DBStorage'

export class DBLocalStorage implements DBStorage {
  private storage: Storage

  constructor(storage: Storage) {
    this.storage = storage
  }

  get keys(): string[] {
    return Object.keys(this.storage)
  }
  get entries(): [key: string, value: string][] {
    return Object.entries(this.storage)
  }

  get(key: string) {
    const string = this.storage.getItem(key)
    if (!string) return undefined
    try {
      return JSON.parse(string)
    } catch {
      this.storage.removeItem(key)
      return undefined
    }
  }
  set(key: string, value: any): void {
    this.storage.setItem(key, JSON.stringify(value))
  }

  getString(key: string): string | undefined {
    return this.storage.getItem(key) ?? undefined
  }
  setString(key: string, value: string) {
    this.storage.setItem(key, value)
  }
  remove(key: string) {
    this.storage.removeItem(key)
  }

  copyFrom(other: DBStorage) {
    for (const [key, value] of other.entries) {
      this.setString(key, value)
    }
  }
  clear() {
    this.storage.clear()
  }
  removeForKeys(shouldRemove: (key: string) => boolean) {
    for (const key in this.storage) {
      if (shouldRemove(key)) this.storage.removeItem(key)
    }
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
  setDBIndex(ind: 1 | 2 | 3 | 4, key: DbIndexKey) {
    this.setString(key, ind.toString())
  }
}
