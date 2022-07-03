import { deepFreeze } from "../Util/Util"
import { ArtCharDatabase } from "./Database"

export class DataManager<CacheKey extends string | number, StorageKey extends string | number, CacheValue, StorageValue> {
  database: ArtCharDatabase

  constructor(database: ArtCharDatabase) {
    this.database = database
  }
  static readonly allKeys = {} as const

  data: Dict<CacheKey, CacheValue> = {}
  listeners: Dict<CacheKey, Callback<CacheValue | undefined>[]> = {}
  anyListeners: Callback<CacheKey | typeof DataManager.allKeys>[] = []

  toStorageKey(key: CacheKey): StorageKey {
    return key as any as StorageKey
  }
  deCache(cacheObj: CacheValue): StorageValue {
    return cacheObj as any as StorageValue
  }
  followAny(callback: Callback<CacheKey | typeof DataManager.allKeys>): () => void {
    this.anyListeners.push(callback)
    return () => {
      this.anyListeners = this.anyListeners.filter(cb => cb !== callback)
    }
  }
  follow(key: CacheKey, callback: Callback<CacheValue | undefined>) {
    if (this.listeners[key]) this.listeners[key]!.push(callback)
    else this.listeners[key] = [callback]
    return () => {
      this.listeners[key] = this.listeners[key]?.filter(cb => cb !== callback)
      if (!this.listeners[key]?.length) delete this.listeners[key]
    }
  }

  get keys() { return Object.keys(this.data) }
  get values() { return Object.values(this.data) }
  get(key: CacheKey | "" | undefined): CacheValue | undefined { return key ? this.data[key] : undefined }
  set(key: CacheKey, value: CacheValue) {
    deepFreeze(value)
    this.data[key] = value
    this.database.storage.set(this.toStorageKey(key) as string, this.deCache(value))
    this.trigger(key)
  }
  /** Trigger update event */
  trigger(key: CacheKey) {
    const value = this.data[key]
    this.listeners[key]?.forEach(cb => cb(value))
    this.anyListeners.forEach(cb => cb(key))
  }
  remove(key: CacheKey) {
    delete this.data[key]
    this.database.storage.remove(this.toStorageKey(key) as string)

    this.trigger(key)
    delete this.listeners[key]
  }
  clear() {
    for (const key in this.data) {
      this.remove(key)
    }
  }
}

type Callback<Arg> = (arg: Arg) => void
