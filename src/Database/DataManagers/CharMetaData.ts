import { allSubstatKeys, SubstatKey } from "../../Types/artifact";
import { CharacterKey, LocationCharacterKey, travelerKeys } from "../../Types/consts";
import { ArtCharDatabase } from "../Database";
import { DataManager } from "../DataManager";

interface ICharMeta {
  rvFilter: SubstatKey[]
  favorite: boolean
}
export function initCharMeta(): ICharMeta {
  return {
    rvFilter: [...allSubstatKeys],
    favorite: false
  }
}
const storageHash = "charMeta_"
export class CharMetaDataManager extends DataManager<CharacterKey, string, "charMetas", ICharMeta, ICharMeta>{
  constructor(database: ArtCharDatabase) {
    super(database, "charMetas")
    for (const key of this.database.storage.keys) {
      if (key.startsWith(storageHash)) {
        const [, charKey] = key.split(storageHash)
        if (!this.set(charKey as CharacterKey, this.database.storage.get(key)))
          this.database.storage.remove(key)
      }
    }
  }
  validate(obj: any): ICharMeta | undefined {
    if (typeof obj !== "object") return

    let { rvFilter, favorite } = obj
    if (!Array.isArray(rvFilter)) rvFilter = []
    else rvFilter = rvFilter.filter(k => allSubstatKeys.includes(k))
    if (typeof favorite !== "boolean") favorite = false
    const charMeta: ICharMeta = { rvFilter, favorite }
    return charMeta
  }

  toStorageKey(key: CharacterKey): string {
    return `${storageHash}${key}`
  }
  getTravelerCharacterKey(): CharacterKey {
    return travelerKeys.find(k => this.keys.includes(k)) ?? travelerKeys[0]
  }
  LocationToCharacterKey(key: LocationCharacterKey): CharacterKey {
    return key === "Traveler" ? this.getTravelerCharacterKey() : key
  }
  get(key: CharacterKey): ICharMeta {
    if (!this.data[key])
      if (!this.set(key, initCharMeta()))
        console.error("Something wrong with creating initial CharMeta")
    return this.data[key]!
  }
}
