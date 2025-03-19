import { deepFreeze } from '@genshin-optimizer/common/util'
import type { Database } from './Database'
import type { TriggerString } from './common'

export class DataEntryBase<
  // Key used to reference this data entry
  Key extends string,
  // Key used as key for exim
  Datakey extends string,
  CacheValue,
  StorageValue,
  DatabaseType extends Database = Database,
> {
  database: DatabaseType
  init: (database: DatabaseType) => StorageValue
  data: CacheValue
  key: Key
  dataKey: Datakey
  constructor(
    database: DatabaseType,
    key: Key,
    init: (database: DatabaseType) => StorageValue,
    dataKey: Datakey
  ) {
    this.database = database
    this.key = key
    this.init = init
    this.dataKey = dataKey
    const storageVal = this.getStorage()
    if (storageVal) this.set(storageVal)
    else this.set(init(this.database))
    this.data = this.get() //initializer
  }

  listeners: Callback<CacheValue>[] = []

  /**
   * Going from cache key to storage key
   */
  toStorageKey(): string {
    return this.key
  }
  get() {
    return this.data
  }
  validate(obj: unknown): StorageValue | undefined {
    return obj as StorageValue | undefined
  }
  toCache(storageObj: StorageValue): CacheValue | undefined {
    return { ...storageObj } as unknown as CacheValue
  }
  deCache(cacheObj: CacheValue): StorageValue {
    const { ...storageObj } = cacheObj
    return storageObj as unknown as StorageValue
  }
  getStorage(): StorageValue {
    return this.database.storage.get(this.toStorageKey())
  }
  set(
    valueOrFunc:
      | Partial<StorageValue>
      | ((v: StorageValue) => Partial<StorageValue> | void)
  ): boolean {
    const old = this.getStorage()
    if (typeof valueOrFunc === 'function' && !old) {
      this.trigger('invalid', valueOrFunc)
      return false
    }
    const value =
      typeof valueOrFunc === 'function'
        ? (valueOrFunc(old) ?? old)
        : valueOrFunc
    const validated = this.validate({ ...old, ...value })
    if (!validated) {
      this.trigger('invalid', value)
      return false
    }
    const cached = this.toCache(validated)
    if (!cached) {
      this.trigger('invalid', value)
      return false
    }
    if (!old) this.trigger('new', cached)
    this.setCached(cached)
    return true
  }
  setCached(cached: CacheValue) {
    deepFreeze(cached)
    this.data = cached
    this.database.storage.set(this.toStorageKey(), this.deCache(cached))
    this.trigger('update', cached)
  }
  clear() {
    const data = this.toCache(this.init(this.database))
    if (!data) return
    this.data = data
    this.setCached(this.data)
    this.listeners = []
  }
  clearStorage() {
    this.database.storage.remove(this.toStorageKey())
  }
  saveStorage() {
    this.database.storage.set(this.toStorageKey(), this.deCache(this.data))
  }

  trigger(reason: TriggerString, object?: unknown) {
    this.listeners.forEach((cb) => cb(reason, object as CacheValue))
  }
  follow(callback: Callback<CacheValue>) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback)
    }
  }
}
type Callback<Obj> = (reason: TriggerString, object: Obj) => void
