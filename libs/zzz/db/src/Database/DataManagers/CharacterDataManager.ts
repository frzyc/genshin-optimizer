import type { TriggerString } from '@genshin-optimizer/common/database'
import { clamp, deepClone, objKeyMap } from '@genshin-optimizer/common/util'
import type { CharacterKey, DiscSlotKey } from '@genshin-optimizer/zzz/consts'
import {
  allDiscSlotKeys,
  coreLimits,
  skillLimits,
} from '@genshin-optimizer/zzz/consts'
import { validateLevelMilestone } from '@genshin-optimizer/zzz/util'
import type { ICharacter } from '@genshin-optimizer/zzz/zood'
import { parseCharacter } from '@genshin-optimizer/zzz/zood'
import type { ICachedCharacter } from '../../Interfaces'
import { DataManager } from '../DataManager'
import type { ZzzDatabase } from '../Database'

export class CharacterDataManager extends DataManager<
  CharacterKey,
  'characters',
  ICachedCharacter,
  ICharacter
> {
  constructor(database: ZzzDatabase) {
    super(database, 'characters')
  }
  override validate(obj: unknown): ICharacter | undefined {
    // Use shared schema from zood for structural validation
    const data = parseCharacter(obj)
    if (!data) return undefined

    // level/promotion co-validation
    const { sanitizedLevel, milestone: promotion } = validateLevelMilestone(
      data.level,
      data.promotion
    )

    // Clamp skills to promotion-dependent limits
    const skillMax = skillLimits[promotion]
    const coreMax = coreLimits[promotion]

    return {
      key: data.key as CharacterKey,
      level: sanitizedLevel,
      promotion,
      mindscape: data.mindscape,
      core: clamp(data.core, 0, coreMax),
      dodge: clamp(data.dodge, 1, skillMax),
      basic: clamp(data.basic, 1, skillMax),
      chain: clamp(data.chain, 1, skillMax),
      special: clamp(data.special, 1, skillMax),
      assist: clamp(data.assist, 1, skillMax),
      potential: data.potential,
    }
  }

  override toCache(storageObj: ICharacter, id: CharacterKey): ICachedCharacter {
    const oldChar = this.get(id)
    return {
      equippedDiscs: oldChar
        ? oldChar.equippedDiscs
        : objKeyMap(
            allDiscSlotKeys,
            (sk) =>
              Object.values(this.database.discs?.data ?? {}).find(
                (a) => a?.location === id && a.slotKey === sk
              )?.id ?? ''
          ),
      equippedWengine: oldChar
        ? oldChar.equippedWengine
        : (Object.values(this.database.wengines?.data ?? {}).find(
            (w) => w?.location === id
          )?.id ?? ''),
      ...storageObj,
    }
  }
  // These overrides allow CharacterKey to be used as id.
  // This assumes we only support one copy of a character in a DB.
  override toStorageKey(key: string): string {
    return `${this.goKeySingle}_${key}`
  }
  override toCacheKey(key: string): CharacterKey {
    return key.split(`${this.goKeySingle}_`)[1] as CharacterKey
  }

  getOrCreate(key: CharacterKey): ICachedCharacter {
    if (!this.keys.includes(key)) {
      this.set(key, initialCharacterData(key))
    }
    return this.get(key) as ICachedCharacter
  }

  // hasDup(char: ICharacter, isSro: boolean) {
  //   const db = this.getStorage(char.key)
  //   if (!db) return false
  //   if (isSro) {
  //     return JSON.stringify(db) === JSON.stringify(char)
  //   } else {
  //     let {
  //       key,
  //       level,
  //       eidolon,
  //       ascension,
  //       basic,
  //       skill,
  //       ult,
  //       talent,
  //       bonusAbilities,
  //       statBoosts,
  //     } = db
  //     const dbSr = {
  //       key,
  //       level,
  //       eidolon,
  //       ascension,
  //       basic,
  //       skill,
  //       ult,
  //       talent,
  //       bonusAbilities,
  //       statBoosts,
  //     }
  //     ;({
  //       key,
  //       level,
  //       eidolon,
  //       ascension,
  //       basic,
  //       skill,
  //       ult,
  //       talent,
  //       bonusAbilities,
  //       statBoosts,
  //     } = char)
  //     const charSr = {
  //       key,
  //       level,
  //       eidolon,
  //       ascension,
  //       basic,
  //       skill,
  //       ult,
  //       talent,
  //       bonusAbilities,
  //       statBoosts,
  //     }
  //     return JSON.stringify(dbSr) === JSON.stringify(charSr)
  //   }
  // }
  triggerCharacter(key: CharacterKey, reason: TriggerString) {
    this.trigger(key, reason, this.get(key))
  }

  override remove(key: CharacterKey): ICachedCharacter | undefined {
    const char = this.get(key)
    if (!char) return undefined
    for (const discKey of Object.values(char.equippedDiscs)) {
      const disc = this.database.discs.get(discKey)
      if (discKey && disc && disc.location === key)
        this.database.discs.setCached(discKey, { ...disc, location: '' })
    }
    const wengine = this.database.wengines.get(char.equippedWengine)
    if (char.equippedWengine && wengine && wengine.location === key)
      this.database.wengines.setCached(char.equippedWengine, {
        ...wengine,
        location: '',
      })

    return super.remove(key)
  }

  /**
   * **Caution**:
   * This does not update the `location` on wengine
   * This function should be use internally for database to maintain cache on ICharacter.
   */
  setEquippedWengine(
    key: CharacterKey,
    equippedWengine: ICachedCharacter['equippedWengine']
  ) {
    const char = super.get(key)
    if (!char) return
    super.setCached(key, { ...char, equippedWengine })
  }

  /**
   * **Caution**:
   * This does not update the `location` on disc
   * This function should be use internally for database to maintain cache on ICachedCharacter.
   */
  setEquippedDisc(key: CharacterKey, slotKey: DiscSlotKey, discId: string) {
    const char = super.get(key)
    if (!char) return
    const equippedDiscs = deepClone(char.equippedDiscs)
    equippedDiscs[slotKey] = discId
    super.setCached(key, { ...char, equippedDiscs })
  }
}

export function initialCharacterData(key: CharacterKey): ICachedCharacter {
  return {
    key,
    level: 60,
    core: 6,
    promotion: 0,
    mindscape: 0,
    potential: 0,
    dodge: 1,
    basic: 1,
    chain: 1,
    special: 1,
    assist: 1,
    equippedDiscs: objKeyMap(allDiscSlotKeys, () => ''),
    equippedWengine: '',
  }
}
