import { ArtCharDatabase } from "../Database";
import { DataManager } from "../DataManager";

export class StateDataManager extends DataManager<string, string, object, object>{
  constructor(database: ArtCharDatabase) {
    super(database)
    for (const key of this.database.storage.keys) {
      if (key.startsWith("state_")) {
        const [, stateKey] = key.split("state_")
        const stateObj = this.database.storage.get(key)
        if (!stateObj) {
          console.error("StateData", key, "is unrecoverable.", stateObj)
          this.database.storage.remove(key)
          continue
        }
        this.set(stateKey, stateObj)
      }
    }
  }

  toStorageKey(key: string): string {
    return `state_${key}`
  }
  getWithInit<O extends object>(key: string, init: () => O) {
    const state = this.get(key) as O | undefined
    if (state) return state
    const newState = init()
    this.set(key, newState)
    return this.get(key) as O
  }

  set<O extends object>(id: string, value: Partial<O>) {
    const oldState = this.get(id) as O
    super.set(id, { ...oldState, ...value })
  }

}
