import { deepFreeze } from "../Util/Util"
import { ArtCharDatabase } from "./Database"
import { TriggerString } from "./DataManager"
import { IGO, IGOOD, ImportResult } from "./exim"

export class DataEntry<Key extends string, GOkey extends string, CacheValue, StorageValue>{
  database: ArtCharDatabase
  init: () => StorageValue
  data: CacheValue
  key: Key
  goKey: GOkey
  constructor(database: ArtCharDatabase, key: Key, init: () => StorageValue, goKey: GOkey) {
    this.database = database
    this.key = key
    this.init = init
    this.goKey = goKey
    if (this.database.storage.keys.includes(key)) {
      this.data = this.toCache(init())!
      this.set(this.database.storage.get(key))
    } else {
      this.data = this.toCache(init())!
      this.setCached(this.data)
    }
  }

  listeners: Callback<CacheValue>[] = []
  get() { return this.data }
  validate(obj: any): StorageValue | undefined {
    return obj as StorageValue | undefined
  }
  toCache(storageObj: StorageValue): CacheValue | undefined {
    return { ...storageObj } as any as CacheValue
  }
  deCache(cacheObj: CacheValue): StorageValue {
    const { ...storageObj } = cacheObj as any
    return storageObj as any as StorageValue
  }
  set(value: Partial<StorageValue>): boolean {
    const old = this.data
    const validated = this.validate({ ...old, ...value })
    if (!validated) {
      this.trigger("invalid", value)
      return false
    }
    const cached = this.toCache(validated)
    if (!cached) {
      this.trigger("invalid", value)
      return false
    }
    if (!old) this.trigger("new", cached)
    this.setCached(cached)
    return true
  }
  setCached(cached: CacheValue) {
    deepFreeze(cached)
    this.data = cached
    this.database.storage.set(this.key, this.deCache(cached))
    this.trigger("update", cached)
  }
  reset() {
    this.data = this.toCache(this.init())!
    this.setCached(this.data)
    this.listeners = []
  }

  trigger(reason: TriggerString, object?: any) {
    this.listeners.forEach(cb => cb(reason, object))
  }
  follow(callback: Callback<CacheValue>) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback)
    }
  }
  exportGOOD(go: Partial<IGO & IGOOD>) {
    go[this.goKey as any] = this.data
  }
  importGOOD(go: IGO & IGOOD, result: ImportResult) {
    const data = go[this.goKey as any]
    if (data) this.set(data)
  }
}
type Callback<Obj> = (reason: TriggerString, object: Obj) => void
