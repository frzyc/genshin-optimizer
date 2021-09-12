export class DataManager<Key extends string | number, Value> {
  static readonly allKeys = {} as const

  data: Dict<Key, Value> = {}
  listeners: Dict<Key, Callback<Value | undefined>[]> = {}
  anyListeners: Callback<Key | typeof DataManager.allKeys>[] = []

  followAny(callback: Callback<Key | typeof DataManager.allKeys>): () => void {
    this.anyListeners.push(callback)
    return () => {
      this.anyListeners = this.anyListeners.filter(cb => cb !== callback)
    }
  }
  follow(key: Key, callback: Callback<Value | undefined>) {
    const value = this.get(key)
    callback(value, "follow")
    if (this.listeners[key]) this.listeners[key]!.push(callback)
    else this.listeners[key] = [callback]
    return () => {
      this.listeners[key] = this.listeners[key]?.filter(cb => cb !== callback)
      if (!this.listeners[key]?.length) delete this.listeners[key]
    }
  }

  get keys() { return Object.keys(this.data) }
  get values() { return Object.values(this.data) }
  get(key: Key | "" | undefined): Value | undefined { return key ? this.data[key] : undefined }
  set(key: Key, value: Value, cause: string) {
    this.data[key] = value

    this.listeners[key]?.forEach(cb => cb(value, cause))
    this.anyListeners.forEach(cb => cb(key, cause))
  }
  remove(key: Key, cause: string) {
    delete this.data[key]

    this.listeners[key]?.forEach(cb => cb(undefined, cause))
    this.anyListeners.forEach(cb => cb(key, cause))
    delete this.listeners[key]
  }
  removeAll(cause: string) {
    this.data = {}

    Object.values(this.listeners).forEach(listeners => listeners.forEach(listener => listener(undefined, cause)))
    this.anyListeners.forEach(listener => listener(DataManager.allKeys, cause))
    this.listeners = {}
    this.anyListeners = []
  }
}

type Callback<Arg> = (arg: Arg, cause: string) => void
