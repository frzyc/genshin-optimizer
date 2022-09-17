import { allSubstatKeys } from "../../Types/artifact";
import { allCharacterKeys, CharacterKey } from "../../Types/consts";
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
  validate(obj: any, key: string): object | undefined {
    if (key === "TabOptimize") {
      let { equipmentPriority, threads } = obj
      if (!Array.isArray(equipmentPriority)) equipmentPriority = []
      equipmentPriority = equipmentPriority.filter(k => allCharacterKeys.includes(k))
      if (typeof threads !== "number" || !Number.isInteger(threads) || threads <= 0) threads = 1
      obj = { equipmentPriority, threads }
    }
    return obj
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

export function initCharMeta() {
  return {
    rvFilter: [...allSubstatKeys],
    favorite: false
  }
}

export function dbMetaInit(index: number) {
  return () => ({ name: `Database ${index}`, lastEdit: 0 })
}

export const defThreads = navigator.hardwareConcurrency || 4
export function initialTabOptimizeDBState(): {
  equipmentPriority: CharacterKey[],
  threads: number,
} {
  return {
    equipmentPriority: [],
    threads: defThreads
  }
}
