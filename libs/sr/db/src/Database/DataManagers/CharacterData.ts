import type { TriggerString } from '@genshin-optimizer/common/database'
import { clamp, deepClone, objKeyMap } from '@genshin-optimizer/common/util'
import { validateLevelAsc } from '@genshin-optimizer/gi/util'
import type {
  CharacterKey,
  CharacterLocationKey,
  RelicSlotKey,
  TrailblazerKey,
} from '@genshin-optimizer/sr/consts'
import {
  allBonusAbilityKeys,
  allCharacterKeys,
  allHitModeKeys,
  allRelicSlotKeys,
  allStatBoostKeys,
  allTrailblazerKeys,
  charKeyToCharLocKey,
} from '@genshin-optimizer/sr/consts'
import type { ISrObjectDescription } from '@genshin-optimizer/sr/srod'
import type {
  ICachedSroCharacter,
  ISroCharacter,
  ISroDatabase,
} from '../../Interfaces'
import { SroSource } from '../../Interfaces'
import type { SroDatabase } from '../Database'
import { SroDataManager } from '../SroDataManager'
import type { ImportResult } from '../exim'

export class CharacterDataManager extends SroDataManager<
  CharacterKey,
  'characters',
  ICachedSroCharacter,
  ISroCharacter
> {
  constructor(database: SroDatabase) {
    super(database, 'characters')
  }
  override validate(obj: unknown): ISroCharacter | undefined {
    if (!obj || typeof obj !== 'object') return undefined
    const {
      key: characterKey,
      level: rawLevel,
      ascension: rawAscension,
    } = obj as ISroCharacter
    let {
      hitMode,
      basic,
      skill,
      ult,
      talent,
      bonusAbilities,
      statBoosts,
      eidolon,
      team,
      compareData,
    } = obj as ISroCharacter

    if (!allCharacterKeys.includes(characterKey)) return undefined // non-recoverable

    if (!allHitModeKeys.includes(hitMode)) hitMode = 'avgHit'
    if (typeof eidolon !== 'number' && eidolon < 0 && eidolon > 6) eidolon = 0

    const { level, ascension } = validateLevelAsc(rawLevel, rawAscension)

    if (typeof bonusAbilities !== 'object')
      bonusAbilities = objKeyMap(allBonusAbilityKeys, (_key) => false)
    else {
      bonusAbilities = objKeyMap(allBonusAbilityKeys, (key) =>
        typeof bonusAbilities[key] !== 'boolean'
          ? false
          : bonusAbilities[key] ?? false
      )
    }
    if (typeof statBoosts !== 'object')
      statBoosts = objKeyMap(allStatBoostKeys, (_key) => false)
    else {
      statBoosts = objKeyMap(allStatBoostKeys, (key) =>
        typeof statBoosts[key] !== 'boolean' ? false : statBoosts[key] ?? false
      )
    }
    basic = typeof basic !== 'number' ? 1 : clamp(basic, 1, 6)
    skill = typeof skill !== 'number' ? 1 : clamp(skill, 1, 10)
    ult = typeof ult !== 'number' ? 1 : clamp(ult, 1, 10)
    talent = typeof talent !== 'number' ? 1 : clamp(talent, 1, 10)

    if (!team || !Array.isArray(team)) team = ['', '', '']
    else
      team = team.map((t, i) =>
        t &&
        allCharacterKeys.includes(t) &&
        !team.find((ot, j) => i > j && t === ot)
          ? t
          : ''
      ) as ISroCharacter['team']

    if (typeof compareData !== 'boolean') compareData = false

    const char: ISroCharacter = {
      key: characterKey,
      level,
      ascension,
      hitMode,
      basic,
      skill,
      ult,
      talent,
      bonusAbilities,
      statBoosts,
      eidolon,
      team,
      compareData,
    }
    return char
  }
  override toCache(
    storageObj: ISroCharacter,
    id: CharacterKey
  ): ICachedSroCharacter {
    const oldChar = this.get(id)
    return {
      equippedRelics: oldChar
        ? oldChar.equippedRelics
        : objKeyMap(
            allRelicSlotKeys,
            (sk) =>
              Object.values(this.database.relics?.data ?? {}).find(
                (r) =>
                  r?.location === charKeyToCharLocKey(id) && r.slotKey === sk
              )?.id ?? ''
          ),
      equippedLightCone: oldChar
        ? oldChar.equippedLightCone
        : Object.values(this.database.lightCones?.data ?? {}).find(
            (lc) => lc?.location === charKeyToCharLocKey(id)
          )?.id ?? '',
      ...storageObj,
    }
  }
  override deCache(char: ICachedSroCharacter): ISroCharacter {
    const {
      key,
      level,
      ascension,
      hitMode,
      basic,
      skill,
      ult,
      talent,
      bonusAbilities,
      statBoosts,
      eidolon,
      team,
      compareData,
    } = char
    const result: ISroCharacter = {
      key,
      level,
      ascension,
      hitMode,
      basic,
      skill,
      ult,
      talent,
      bonusAbilities,
      statBoosts,
      eidolon,
      team,
      compareData,
    }
    return result
  }
  getTrailblazerCharacterKey(): CharacterKey {
    return (
      allTrailblazerKeys.find((k) => this.keys.includes(k)) ??
      allTrailblazerKeys[0]
    )
  }
  LocationToCharacterKey(key: CharacterLocationKey): CharacterKey {
    return key === 'Trailblazer' ? this.getTrailblazerCharacterKey() : key
  }
  getOrCreate(key: CharacterKey): ICachedSroCharacter {
    if (!this.keys.includes(key)) {
      this.set(key, initialCharacter(key))
    }
    return this.get(key) as ICachedSroCharacter
  }

  override remove(key: CharacterKey) {
    const char = this.get(key)
    if (!char) return
    for (const relicKey of Object.values(char.equippedRelics)) {
      const relic = this.database.relics.get(relicKey)
      // Only unequip relic from Trailblazer if there are no more "Trailblazer"s in the database
      if (
        relic &&
        (relic.location === key ||
          (relic.location === 'Trailblazer' &&
            allTrailblazerKeys.includes(key as TrailblazerKey) &&
            !allTrailblazerKeys.find(
              (t) => t !== key && this.keys.includes(t)
            )))
      )
        this.database.relics.setCached(relicKey, { ...relic, location: '' })
    }
    const lightCone = this.database.lightCones.get(char.equippedLightCone)
    // Only unequip light cone from Trailblazer if there are no more "Trailblazer"s in the database
    if (
      lightCone &&
      (lightCone.location === key ||
        (lightCone.location === 'Trailblazer' &&
          allTrailblazerKeys.includes(key as TrailblazerKey) &&
          !allTrailblazerKeys.find(
            (t) => t !== key && this.keys.includes(t)
          ))) &&
      char.equippedLightCone
    )
      this.database.lightCones.setCached(char.equippedLightCone, {
        ...lightCone,
        location: '',
      })
    super.remove(key)
  }

  /**
   * **Caution**:
   * This does not update the `location` on relic
   * This function should be use internally for database to maintain cache on ICachedSroCharacter.
   */
  setEquippedRelic(
    key: CharacterLocationKey,
    slotKey: RelicSlotKey,
    relicId: string
  ) {
    const setEq = (k: CharacterKey) => {
      const char = super.get(k)
      if (!char) return
      const equippedRelics = deepClone(char.equippedRelics)
      equippedRelics[slotKey] = relicId
      super.setCached(k, { ...char, equippedRelics })
    }
    if (key === 'Trailblazer') allTrailblazerKeys.forEach((k) => setEq(k))
    else setEq(key)
  }

  /**
   * **Caution**:
   * This does not update the `location` on light cone
   * This function should be use internally for database to maintain cache on ICachedSroCharacter.
   */
  setEquippedLightCone(
    key: CharacterLocationKey,
    equippedLightCone: ICachedSroCharacter['equippedLightCone']
  ) {
    const setEq = (k: CharacterKey) => {
      const char = super.get(k)
      if (!char) return
      super.setCached(k, { ...char, equippedLightCone })
    }
    if (key === 'Trailblazer') allTrailblazerKeys.forEach((k) => setEq(k))
    else setEq(key)
  }

  hasDup(char: ISroCharacter, isSro: boolean) {
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
  triggerCharacter(key: CharacterLocationKey, reason: TriggerString) {
    if (key === 'Trailblazer')
      allTrailblazerKeys.forEach((ck) => this.trigger(ck, reason, this.get(ck)))
    else this.trigger(key, reason, this.get(key))
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
        if (!c.key) result.characters.invalid.push(c as ISroCharacter)
        idsToRemove.delete(c.key)
        if (
          this.hasDup(
            { ...initialCharacter(c.key), ...c },
            source === SroSource
          )
        )
          result.characters.unchanged.push(c as ISroCharacter)
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

export function initialCharacter(key: CharacterKey): ICachedSroCharacter {
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
    hitMode: 'avgHit',
    team: ['', '', ''],
    compareData: false,
    equippedRelics: objKeyMap(allRelicSlotKeys, () => ''),
    equippedLightCone: '',
  }
}
