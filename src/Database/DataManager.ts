import { deepFreeze } from "../Util/Util"
import { ArtCharDatabase } from "./Database"
export class DataManager<CacheKey extends string | number, StorageKey extends string | number, CacheValue, StorageValue> {
  database: ArtCharDatabase

  constructor(database: ArtCharDatabase) {
    this.database = database
  }

  data: Dict<CacheKey, CacheValue> = {}
  listeners: Dict<CacheKey, Callback<CacheKey>[]> = {}
  anyListeners: Callback<CacheKey>[] = []

  toStorageKey(key: CacheKey): StorageKey {
    return key as any as StorageKey
  }
  validate(obj: any, key: CacheKey): StorageValue | undefined {
    return obj as StorageValue | undefined
  }
  toCache(storageObj: StorageValue, id: string): CacheValue | undefined {
    return { ...storageObj, id } as any as CacheValue
  }
  deCache(cacheObj: CacheValue): StorageValue {
    const { id, ...storageObj } = cacheObj as any
    return storageObj as any as StorageValue
  }
  followAny(callback: Callback<CacheKey>): () => void {
    this.anyListeners.push(callback)
    return () => {
      this.anyListeners = this.anyListeners.filter(cb => cb !== callback)
    }
  }
  follow(key: CacheKey, callback: Callback<CacheKey>) {
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
  getStorage(key: CacheKey) { return this.database.storage.get(this.toStorageKey(key) as any) }
  set(key: CacheKey, value: Partial<StorageValue>): boolean {
    const old = this.getStorage(key)
    const validated = this.validate({ ...(old ?? {}), ...value }, key)
    if (!validated) {
      this.trigger(key, "invalid", value)
      return false
    }
    const cached = this.toCache(validated, key as any)
    if (!cached) {
      this.trigger(key, "invalid", value)
      return false
    }
    if (!old) this.trigger(key, "new", cached)
    this.setCached(key, cached)
    return true
  }
  setCached(key: CacheKey, cached: CacheValue) {
    deepFreeze(cached)
    this.data[key] = cached
    this.database.storage.set(this.toStorageKey(key) as string, this.deCache(cached))
    this.trigger(key, "update", cached)
  }
  /** Trigger update event */
  trigger(key: CacheKey, reason: TriggerString, object?: any) {
    this.listeners[key]?.forEach(cb => cb(key, reason, object))
    this.anyListeners.forEach(cb => cb(key, reason, object))
  }
  remove(key: CacheKey) {
    const rem = this.data[key]
    delete this.data[key]
    this.database.storage.remove(this.toStorageKey(key) as string)

    this.trigger(key, "remove", rem)
    delete this.listeners[key]
  }
  clear() {
    for (const key in this.data) {
      this.remove(key)
    }
  }
}
export type TriggerString = "update" | "remove" | "new" | "invalid"
type Callback<Arg> = (key: Arg, reason: TriggerString, object: any) => void
