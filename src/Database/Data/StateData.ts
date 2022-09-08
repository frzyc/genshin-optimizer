import { ArtCharDatabase } from "../Database";
import { DataManager } from "../DataManager";

export class StateDataManager extends DataManager<string, string, object, object>{
  constructor(database: ArtCharDatabase) {
    super(database)
    for (const key of this.database.storage.keys) {
      if (key.startsWith("state_")) {
        const [, stateKey] = key.split("state_")
        this.set(stateKey, this.database.storage.get(key))
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
}
