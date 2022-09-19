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
        if (!this.set(stateKey, this.database.storage.get(key)))
          this.database.storage.remove(key)
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
    if (key.startsWith("charMeta_")) {
      const [, charKey] = key.split("charMeta_")
      if (!allCharacterKeys.includes(charKey as CharacterKey)) return
      // TODO charMeta validation
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
  return () => ({
    name: `Database ${index}`,
    lastEdit: 0,
    gender: "F"
  })
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
