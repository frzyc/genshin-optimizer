import type { TriggerString } from '@genshin-optimizer/common/database'
import { deepClone, objKeyMap } from '@genshin-optimizer/common/util'
import type { CharacterKey, RelicSlotKey } from '@genshin-optimizer/sr/consts'
import {
  allRelicSlotKeys,
  allTrailblazerKeys,
} from '@genshin-optimizer/sr/consts'
import type {
  ICharacter,
  ISrObjectDescription,
} from '@genshin-optimizer/sr/srod'
import { validateCharacterWithRules } from '@genshin-optimizer/sr/srod'
import { validateLevelAsc } from '@genshin-optimizer/sr/util'
import type { ICachedCharacter, ISroDatabase } from '../../Interfaces'
import { SroSource } from '../../Interfaces'
import { DataManager } from '../DataManager'
import type { SroDatabase } from '../Database'
import type { ImportResult } from '../exim'

export class CharacterDataManager extends DataManager<
  CharacterKey,
  'characters',
  ICachedCharacter,
  ICharacter
> {
  constructor(database: SroDatabase) {
    super(database, 'characters')
  }
  override validate(obj: unknown): ICharacter | undefined {
    return validateCharacterWithRules(obj, validateLevelAsc)
  }
  override toCache(storageObj: ICharacter, id: CharacterKey): ICachedCharacter {
    const oldChar = this.get(id)
    return {
      equippedRelics: oldChar
        ? oldChar.equippedRelics
        : objKeyMap(
            allRelicSlotKeys,
            (sk) =>
              Object.values(this.database.relics?.data ?? {}).find(
                (r) => r?.location === id && r.slotKey === sk
              )?.id
          ),
      equippedLightCone: oldChar
        ? oldChar.equippedLightCone
        : Object.values(this.database.lightCones?.data ?? {}).find(
            (lc) => lc?.location === id
          )?.id,
      ...storageObj,
    }
  }
  override deCache(char: ICachedCharacter): ICharacter {
    const {
      key,
      level,
      ascension,
      basic,
      skill,
      ult,
      talent,
      bonusAbilities,
      statBoosts,
      eidolon,
      servantSkill,
      servantTalent,
    } = char
    const result: ICharacter = {
      key,
      level,
      ascension,
      basic,
      skill,
      ult,
      talent,
      bonusAbilities,
      statBoosts,
      eidolon,
      servantSkill,
      servantTalent,
    }
    return result
  }
  // These overrides allow CharacterKey to be used as id.
  // This assumes we only support one copy of a character in a DB.
  override toStorageKey(key: string): string {
    return `${this.goKeySingle}_${key}`
  }
  override toCacheKey(key: string): CharacterKey {
    return key.split(`${this.goKeySingle}_`)[1] as CharacterKey
  }
  getTrailblazerCharacterKey(): CharacterKey {
    return (
      allTrailblazerKeys.find((k) => this.keys.includes(k)) ??
      allTrailblazerKeys[0]
    )
  }
  getOrCreate(key: CharacterKey): ICachedCharacter {
    if (!this.keys.includes(key)) {
      this.set(key, initialCharacter(key))
    }
    return this.get(key) as ICachedCharacter
  }

  override remove(key: CharacterKey): ICachedCharacter | undefined {
    const char = this.get(key)
    if (!char) return undefined
    for (const relicKey of Object.values(char.equippedRelics)) {
      if (!relicKey) continue
      const relic = this.database.relics.get(relicKey)
      if (relic && relic.location === key)
        this.database.relics.setCached(relicKey, { ...relic, location: '' })
    }
    const lightCone = this.database.lightCones.get(char.equippedLightCone)
    if (lightCone && lightCone.location === key && char.equippedLightCone)
      this.database.lightCones.setCached(char.equippedLightCone, {
        ...lightCone,
        location: '',
      })
    return super.remove(key)
  }

  /**
   * **Caution**:
   * This does not update the `location` on relic
   * This function should be use internally for database to maintain cache on ICachedSroCharacter.
   */
  setEquippedRelic(
    key: CharacterKey,
    slotKey: RelicSlotKey,
    relicId: string | undefined
  ) {
    const char = super.get(key)
    if (!char) return
    const equippedRelics = deepClone(char.equippedRelics)
    equippedRelics[slotKey] = relicId
    super.setCached(key, { ...char, equippedRelics })
  }

  /**
   * **Caution**:
   * This does not update the `location` on light cone
   * This function should be use internally for database to maintain cache on ICachedSroCharacter.
   */
  setEquippedLightCone(
    key: CharacterKey,
    equippedLightCone: ICachedCharacter['equippedLightCone']
  ) {
    const char = super.get(key)
    if (!char) return
    super.setCached(key, { ...char, equippedLightCone })
  }

  hasDup(char: ICharacter, isSro: boolean) {
    const db = this.getStorage(char.key)
    if (!db) return false
    if (isSro) {
      return JSON.stringify(db) === JSON.stringify(char)
    } else {
      let {
        key,
        level,
        eidolon,
        ascension,
        basic,
        skill,
        ult,
        talent,
        bonusAbilities,
        statBoosts,
      } = db
      const dbSr = {
        key,
        level,
        eidolon,
        ascension,
        basic,
        skill,
        ult,
        talent,
        bonusAbilities,
        statBoosts,
      }
      ;({
        key,
        level,
        eidolon,
        ascension,
        basic,
        skill,
        ult,
        talent,
        bonusAbilities,
        statBoosts,
      } = char)
      const charSr = {
        key,
        level,
        eidolon,
        ascension,
        basic,
        skill,
        ult,
        talent,
        bonusAbilities,
        statBoosts,
      }
      return JSON.stringify(dbSr) === JSON.stringify(charSr)
    }
  }
  triggerCharacter(key: CharacterKey, reason: TriggerString) {
    this.trigger(key, reason, this.get(key))
  }
  override importSROD(
    sr: ISrObjectDescription & ISroDatabase,
    result: ImportResult
  ) {
    result.characters.beforeMerge = this.values.length

    const source = sr.source ?? 'Unknown'
    const characters = sr.characters
    if (Array.isArray(characters) && characters?.length) {
      result.characters.import = characters.length
      const idsToRemove = new Set(this.keys)
      characters.forEach((c) => {
        if (!c.key) result.characters.invalid.push(c as ICharacter)
        idsToRemove.delete(c.key)
        if (
          this.hasDup(
            { ...initialCharacter(c.key), ...c },
            source === SroSource
          )
        )
          result.characters.unchanged.push(c as ICharacter)
        else this.set(c.key, c)
      })

      const idtoRemoveArr = Array.from(idsToRemove)
      if (result.keepNotInImport || result.ignoreDups)
        result.characters.notInImport = idtoRemoveArr.length
      else idtoRemoveArr.forEach((k) => this.remove(k))
      result.characters.unchanged = []
    } else result.characters.notInImport = this.values.length
  }
}

export function initialCharacter(key: CharacterKey): ICachedCharacter {
  return {
    key,
    level: 1,
    eidolon: 0,
    ascension: 0,
    basic: 1,
    skill: 1,
    ult: 1,
    talent: 1,
    bonusAbilities: {},
    statBoosts: {},
    equippedRelics: objKeyMap(allRelicSlotKeys, () => ''),
    equippedLightCone: '',
    servantSkill: 1,
    servantTalent: 1,
  }
}
