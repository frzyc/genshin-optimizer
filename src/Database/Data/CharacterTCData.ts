import { CharacterKey } from "pipeline";
import { allSubstatKeys } from "../../Types/artifact";
import { ICharacter, ICharTC } from "../../Types/character";
import { allSlotKeys, WeaponKey } from "../../Types/consts";
import { objectKeyMap } from "../../Util/Util";
import { ArtCharDatabase } from "../Database";
import { DataManager } from "../DataManager";

export class CharacterTCDataManager extends DataManager<CharacterKey, string, ICharTC, ICharacter>{
  constructor(database: ArtCharDatabase) {
    super(database)
    for (const key of this.database.storage.keys) {
      if (key.startsWith("charTC_")) {
        const obj = this.database.storage.get(key)
        const [, chatTCKey] = key.split("charTC_")
        this.set(chatTCKey as CharacterKey, obj)
      }
    }
  }
  toStorageKey(key: CharacterKey): string {
    return `charTC_${key}`
  }
  remove(key: CharacterKey) {
    const char = this.get(key)
    if (!char) return
    super.remove(key)
  }
  get(key: CharacterKey | "" | undefined): ICharTC {
    const charTc = key ? this.data[key] : undefined
    return charTc || initCharTC("DullBlade")
  }
}

export function initCharTC(weaponKey: WeaponKey): ICharTC {
  return {
    weapon: {
      key: weaponKey,
      level: 1,
      ascension: 0,
      refinement: 1,
    },
    artifact: {
      levels: objectKeyMap(allSlotKeys, () => 20),
      mainstatKeys: {
        sands: "atk_",
        goblet: "atk_",
        circlet: "atk_",
      },
      substats: {
        type: "max",
        stats: objectKeyMap(allSubstatKeys, () => 0)
      },
      sets: {}
    }
  }
}
