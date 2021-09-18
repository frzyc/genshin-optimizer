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
    callback(value)
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
  set(key: Key, value: Value) {
    this.data[key] = value

    this.trigger(key)
  }
  /** Trigger update event */
  trigger(key: Key) {
    const value = this.data[key]
    this.listeners[key]?.forEach(cb => cb(value))
    this.anyListeners.forEach(cb => cb(key))
  }
  remove(key: Key) {
    delete this.data[key]
    this.trigger(key)
    delete this.listeners[key]
  }
  removeAll() {
    this.data = {}

    Object.values(this.listeners).forEach(listeners => listeners.forEach(listener => listener(undefined)))
    this.anyListeners.forEach(listener => listener(DataManager.allKeys))
    this.listeners = {}
    this.anyListeners = []
  }
}

type Callback<Arg> = (arg: Arg) => void
