import { deepFreeze } from '../Util/Util'
import type { ArtCharDatabase } from './Database'
import type { TriggerString } from './DataManager'
import type { IGO, IGOOD, ImportResult } from './exim'

export class DataEntry<
  Key extends string,
  GOkey extends string,
  CacheValue,
  StorageValue
> {
  database: ArtCharDatabase
  init: (database: ArtCharDatabase) => StorageValue
  data: CacheValue
  key: Key
  goKey: GOkey
  constructor(
    database: ArtCharDatabase,
    key: Key,
    init: (database: ArtCharDatabase) => StorageValue,
    goKey: GOkey
  ) {
    this.database = database
    this.key = key
    this.init = init
    this.goKey = goKey
    const storageVal = this.getStorage()
    if (storageVal) this.set(storageVal)
    else this.set(init(this.database))
    this.data = this.get() //initializer
  }

  listeners: Callback<CacheValue>[] = []
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
    return this.database.storage.get(this.key)
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
      typeof valueOrFunc === 'function' ? valueOrFunc(old) ?? old : valueOrFunc
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
    this.database.storage.set(this.key, this.deCache(cached))
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
    this.database.storage.remove(this.key)
  }
  saveStorage() {
    this.database.storage.set(this.key, this.deCache(this.data))
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
  exportGOOD(go: Partial<IGO & IGOOD>) {
    go[this.goKey] = this.data
  }
  importGOOD(go: IGO & IGOOD, _result: ImportResult) {
    const data = go[this.goKey]
    if (data) this.set(data)
  }
}
type Callback<Obj> = (reason: TriggerString, object: Obj) => void
