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
}

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
      if (shouldRemove(key))
        this.storage.removeItem(key)
    }
  }
}

export class SandboxStorage implements DBStorage {
  private storage: Dict<string, string> = {}

  constructor(other: DBStorage | undefined = undefined) {
    other && this.copyFrom(other)
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
    this.storage = Object.fromEntries(Object.entries(this.storage).filter(([key]) => !shouldRemove(key)))
  }
}
