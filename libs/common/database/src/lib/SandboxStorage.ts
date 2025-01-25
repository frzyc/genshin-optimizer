import type {
  DBStorage,
  DbIndexKey,
  DbVersionKey,
  StorageType,
} from './DBStorage'

export class SandboxStorage implements DBStorage {
  protected storage: Record<string, string> = {}
  dbVersionKey: DbVersionKey
  dbIndexKey: DbIndexKey

  constructor(obj?: Record<string, string>, storageType: StorageType = 'go') {
    if (obj) this.storage = obj
    switch (storageType) {
      case 'go':
        this.dbVersionKey = 'db_ver'
        this.dbIndexKey = 'dbIndex'
        break
      case 'sro':
        this.dbVersionKey = 'sro_db_ver'
        this.dbIndexKey = 'sro_dbIndex'
        break
      case 'zzz':
        this.dbVersionKey = 'zzz_db_ver'
        this.dbIndexKey = 'zzz_dbIndex'
    }
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
  getDBVersion(): number {
    return parseInt(this.getString(this.dbVersionKey) ?? '0')
  }
  setDBVersion(version: number): void {
    this.setString(this.dbVersionKey, version.toString())
  }
  getDBIndex(): 1 | 2 | 3 | 4 {
    return parseInt(this.getString(this.dbIndexKey) ?? '1') as 1 | 2 | 3 | 4
  }
  setDBIndex(ind: 1 | 2 | 3 | 4) {
    this.setString(this.dbIndexKey, ind.toString())
  }
}
