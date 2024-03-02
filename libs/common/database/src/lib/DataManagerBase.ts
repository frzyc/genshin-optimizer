import { deepFreeze } from '@genshin-optimizer/common/util'
import type { Database } from './Database'
import type { TriggerString } from './common'

export class DataManagerBase<
  CacheKey extends string,
  DataKey extends string,
  CacheValue extends StorageValue,
  StorageValue,
  DatabaseType extends Database
> {
  database: DatabaseType
  /**
   * The "list name" when an DataManagerBase is exported to GO data
   */
  dataKey: DataKey

  constructor(database: DatabaseType, goKey: DataKey) {
    this.database = database
    this.dataKey = goKey
  }

  data: Partial<Record<CacheKey, CacheValue>> = {}
  listeners: Partial<Record<CacheKey, DataManagerCallback<CacheKey>[]>> = {}
  anyListeners: DataManagerCallback<CacheKey>[] = []

  toStorageKey(key: CacheKey): string {
    return key
  }
  toCacheKey(key: string): CacheKey {
    return key as CacheKey
  }
  validate(obj: unknown, _key: CacheKey): StorageValue | undefined {
    return obj as StorageValue
  }
  toCache(storageObj: StorageValue, id: CacheKey): CacheValue | undefined {
    return { ...storageObj, id } as CacheValue
  }
  deCache(cacheObj: CacheValue): StorageValue {
    const { id, ...storageObj } = cacheObj as any
    return storageObj
  }
  followAny(callback: DataManagerCallback<CacheKey>): () => void {
    this.anyListeners.push(callback)
    return () => {
      this.anyListeners = this.anyListeners.filter((cb) => cb !== callback)
    }
  }
  follow(key: CacheKey, callback: DataManagerCallback<CacheKey>) {
    if (!key) return () => {}
    if (this.listeners[key]) this.listeners[key]?.push(callback)
    else this.listeners[key] = [callback]
    return () => {
      this.listeners[key] = this.listeners[key]?.filter((cb) => cb !== callback)
      if (!this.listeners[key]?.length) delete this.listeners[key]
    }
  }

  get keys() {
    return Object.keys(this.data) as CacheKey[]
  }
  get values() {
    return Object.values(this.data) as CacheValue[]
  }
  get(key: CacheKey | '' | undefined): CacheValue | undefined {
    return key ? this.data[key] : undefined
  }
  getStorage(key: CacheKey): StorageValue {
    return this.database.storage.get(this.toStorageKey(key))
  }
  set(
    key: CacheKey,
    valueOrFunc:
      | Partial<StorageValue>
      | ((v: StorageValue) => Partial<StorageValue> | void),
    notify = true
  ): boolean {
    const old = this.getStorage(key)
    if (typeof valueOrFunc === 'function' && !old) {
      this.trigger(key, 'invalid', valueOrFunc)
      return false
    }
    const value =
      typeof valueOrFunc === 'function' ? valueOrFunc(old) ?? old : valueOrFunc
    const validated = this.validate({ ...(old ?? {}), ...value }, key)
    if (!validated) {
      this.trigger(key, 'invalid', value)
      return false
    }
    const cached = this.toCache(validated, key)
    if (!cached) {
      this.trigger(key, 'invalid', value)
      return false
    }
    if (!old && notify) this.trigger(key, 'new', cached)
    this.setCached(key, cached)
    return true
  }
  setCached(key: CacheKey, cached: CacheValue) {
    deepFreeze(cached)
    this.data[key] = cached
    this.saveStorageEntry(key, cached)
    this.trigger(key, 'update', cached)
  }
  /** Trigger update event */
  trigger(key: CacheKey, reason: TriggerString, object?: any) {
    this.listeners[key]?.forEach((cb) => cb(key, reason, object))
    this.anyListeners.forEach((cb) => cb(key, reason, object))
  }
  remove(key: CacheKey, notify = true) {
    const rem = this.data[key]
    if (!rem) return rem
    delete this.data[key]
    this.removeStorageEntry(key)

    if (notify) this.trigger(key, 'remove', rem)
    delete this.listeners[key]
    return rem
  }
  /**
   * change the id of the entry in `oldKey` to a `newKey`.
   * Will fail if
   *   oldKey == newKey
   *   data[oldKey] doesnt exist
   *   data[newKey] exists
   *   setting data[newKey] fails.
   * @param oldKey
   * @param newKey
   * @param notify
   * @returns
   */
  changeId(oldKey: CacheKey, newKey: CacheKey, notify = false): boolean {
    if (oldKey === newKey) return false
    const value = this.get(oldKey)
    if (!value) return false
    if (this.get(newKey)) return false
    if (!this.set(newKey, value, notify)) return false
    this.remove(oldKey, notify)
    return true
  }
  get goKeySingle() {
    if (this.dataKey.endsWith('s')) return this.dataKey.slice(0, -1)
    return this.dataKey
  }
  generateKey(keys: Set<string> = new Set(this.keys)): string {
    let ind = keys.size
    let candidate = ''
    do {
      candidate = `${this.goKeySingle}_${ind++}`
    } while (keys.has(candidate))
    return candidate
  }

  clear() {
    for (const key in this.data) {
      this.remove(key)
    }
  }
  removeStorageEntry(key: CacheKey) {
    this.database.storage.remove(this.toStorageKey(key))
  }
  saveStorageEntry(key: CacheKey, cached: CacheValue) {
    this.database.storage.set(this.toStorageKey(key), this.deCache(cached))
  }
  clearStorage() {
    for (const key in this.data) this.removeStorageEntry(key)
  }
  saveStorage() {
    Object.entries(this.data).forEach(([k, v]) =>
      this.saveStorageEntry(k as CacheKey, v as CacheValue)
    )
  }
}
export type DataManagerCallback<Arg> = (
  key: Arg,
  reason: TriggerString,
  object: any
) => void
