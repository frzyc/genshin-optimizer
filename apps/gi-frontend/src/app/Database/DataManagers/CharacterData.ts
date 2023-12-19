import type {
  ArtifactSlotKey,
  CharacterKey,
  LocationCharacterKey,
  TravelerKey,
} from '@genshin-optimizer/consts'
import {
  allArtifactSlotKeys,
  allCharacterKeys,
  allTravelerKeys,
  charKeyToLocCharKey,
} from '@genshin-optimizer/consts'
import { validateLevelAsc } from '@genshin-optimizer/gi-util'
import { clamp, deepClone, objKeyMap } from '@genshin-optimizer/util'
import type {
  CustomMultiTarget,
  ICachedCharacter,
  ICharacter,
} from '../../Types/character'
import type { InfusionAuraElements } from '../../Types/consts'
import {
  allAdditiveReactions,
  allAmpReactions,
  allHitModes,
  allInfusionAuraElements,
} from '../../Types/consts'
import type { TriggerString } from '../DataManager'
import { DataManager } from '../DataManager'
import type { ArtCharDatabase } from '../Database'
import type { IGO, IGOOD, ImportResult } from '../exim'
import { GOSource } from '../exim'

export class CharacterDataManager extends DataManager<
  CharacterKey,
  'characters',
  ICachedCharacter,
  ICharacter
> {
  constructor(database: ArtCharDatabase) {
    super(database, 'characters')
    for (const key of this.database.storage.keys) {
      if (
        key.startsWith('char_') &&
        !this.set(key.split('char_')[1] as CharacterKey, {})
      )
        this.database.storage.remove(key)
    }
  }
  override validate(obj: unknown): ICharacter | undefined {
    if (!obj || typeof obj !== 'object') return undefined
    const {
      key: characterKey,
      level: rawLevel,
      ascension: rawAscension,
    } = obj as ICharacter
    let {
      hitMode,
      reaction,
      conditional,
      bonusStats,
      enemyOverride,
      talent,
      infusionAura,
      constellation,
      team,
      teamConditional,
      compareData,
      customMultiTarget,
    } = obj as ICharacter

    if (!allCharacterKeys.includes(characterKey)) return undefined // non-recoverable

    if (!allHitModes.includes(hitMode)) hitMode = 'avgHit'
    if (
      reaction &&
      !allAmpReactions.includes(reaction as (typeof allAmpReactions)[number]) &&
      !allAdditiveReactions.includes(
        reaction as (typeof allAdditiveReactions)[number]
      )
    )
      reaction = undefined
    if (
      infusionAura !== '' &&
      !allInfusionAuraElements.includes(infusionAura as InfusionAuraElements)
    )
      infusionAura = ''
    if (
      typeof constellation !== 'number' &&
      constellation < 0 &&
      constellation > 6
    )
      constellation = 0

    const { level, ascension } = validateLevelAsc(rawLevel, rawAscension)

    if (typeof talent !== 'object') talent = { auto: 1, skill: 1, burst: 1 }
    else {
      let { auto, skill, burst } = talent
      auto = typeof auto !== 'number' ? 1 : clamp(auto, 1, 10)
      skill = typeof skill !== 'number' ? 1 : clamp(skill, 1, 10)
      burst = typeof burst !== 'number' ? 1 : clamp(burst, 1, 10)
      talent = { auto, skill, burst }
    }

    if (!conditional) conditional = {}
    if (!team || !Array.isArray(team)) team = ['', '', '']
    else
      team = team.map((t, i) =>
        t &&
        allCharacterKeys.includes(t) &&
        !team.find((ot, j) => i > j && t === ot)
          ? t
          : ''
      ) as ICharacter['team']

    if (!teamConditional) teamConditional = {}

    if (typeof compareData !== 'boolean') compareData = false

    // TODO: validate bonusStats
    if (
      typeof bonusStats !== 'object' ||
      !Object.entries(bonusStats).map(([_, num]) => typeof num === 'number')
    )
      bonusStats = {}
    if (
      typeof enemyOverride !== 'object' ||
      !Object.entries(enemyOverride).map(([_, num]) => typeof num === 'number')
    )
      enemyOverride = {}
    if (!customMultiTarget) customMultiTarget = []
    customMultiTarget = customMultiTarget
      .map((cmt) => validateCustomMultiTarget(cmt))
      .filter((t) => t) as CustomMultiTarget[]
    const char: ICharacter = {
      key: characterKey,
      level,
      ascension,
      hitMode,
      conditional,
      bonusStats,
      enemyOverride,
      talent,
      infusionAura,
      constellation,
      team,
      teamConditional,
      compareData,
      customMultiTarget,
    }
    if (reaction) char.reaction = reaction
    return char
  }
  override toCache(storageObj: ICharacter, id: CharacterKey): ICachedCharacter {
    const oldChar = this.get(id)
    return {
      equippedArtifacts: oldChar
        ? oldChar.equippedArtifacts
        : objKeyMap(
            allArtifactSlotKeys,
            (sk) =>
              Object.values(this.database.arts?.data ?? {}).find(
                (a) =>
                  a.location === charKeyToLocCharKey(id) && a.slotKey === sk
              )?.id ?? ''
          ),
      equippedWeapon: oldChar
        ? oldChar.equippedWeapon
        : Object.values(this.database.weapons?.data ?? {}).find(
            (w) => w.location === charKeyToLocCharKey(id)
          )?.id ?? '',
      ...storageObj,
    }
  }
  override deCache(char: ICachedCharacter): ICharacter {
    const {
      key,
      level,
      ascension,
      hitMode,
      reaction,
      conditional,
      bonusStats,
      enemyOverride,
      talent,
      infusionAura,
      constellation,
      team,
      teamConditional,
      compareData,
      customMultiTarget,
    } = char
    const result: ICharacter = {
      key,
      level,
      ascension,
      hitMode,
      conditional,
      bonusStats,
      enemyOverride,
      talent,
      infusionAura,
      constellation,
      team,
      teamConditional,
      compareData,
      customMultiTarget,
    }
    if (reaction) result.reaction = reaction
    return result
  }
  override toStorageKey(key: CharacterKey): string {
    return `char_${key}`
  }
  getTravelerCharacterKey(): CharacterKey {
    return (
      allTravelerKeys.find((k) => this.keys.includes(k)) ?? allTravelerKeys[0]
    )
  }
  LocationToCharacterKey(key: LocationCharacterKey): CharacterKey {
    return key === 'Traveler' ? this.getTravelerCharacterKey() : key
  }
  getWithInitWeapon(key: CharacterKey): ICachedCharacter {
    if (!this.keys.includes(key)) {
      this.set(key, initialCharacter(key))
      this.database.weapons.ensureEquipment(key)
    }
    return this.get(key) as ICachedCharacter
  }

  override remove(key: CharacterKey) {
    const char = this.get(key)
    if (!char) return
    for (const artKey of Object.values(char.equippedArtifacts)) {
      const art = this.database.arts.get(artKey)
      // Only unequip from artifact from traveler if there are no more "Travelers" in the database
      if (
        art &&
        (art.location === key ||
          (art.location === 'Traveler' &&
            allTravelerKeys.includes(key as TravelerKey) &&
            !allTravelerKeys.find((t) => t !== key && this.keys.includes(t))))
      )
        this.database.arts.setCached(artKey, { ...art, location: '' })
    }
    const weapon = this.database.weapons.get(char.equippedWeapon)
    // Only unequip from weapon from traveler if there are no more "Travelers" in the database
    if (
      weapon &&
      (weapon.location === key ||
        (weapon.location === 'Traveler' &&
          allTravelerKeys.includes(key as TravelerKey) &&
          !allTravelerKeys.find((t) => t !== key && this.keys.includes(t))))
    )
      this.database.weapons.setCached(char.equippedWeapon, {
        ...weapon,
        location: '',
      })
    super.remove(key)
  }

  /**
   * **Caution**:
   * This does not update the `location` on artifact
   * This function should be use internally for database to maintain cache on ICachedCharacter.
   */
  setEquippedArtifact(
    key: LocationCharacterKey,
    slotKey: ArtifactSlotKey,
    artid: string
  ) {
    const setEq = (k: CharacterKey) => {
      const char = super.get(k)
      if (!char) return
      const equippedArtifacts = deepClone(char.equippedArtifacts)
      equippedArtifacts[slotKey] = artid
      super.setCached(k, { ...char, equippedArtifacts })
    }
    if (key === 'Traveler') allTravelerKeys.forEach((k) => setEq(k))
    else setEq(key)
  }

  /**
   * **Caution**:
   * This does not update the `location` on weapon
   * This function should be use internally for database to maintain cache on ICachedCharacter.
   */
  setEquippedWeapon(
    key: LocationCharacterKey,
    equippedWeapon: ICachedCharacter['equippedWeapon']
  ) {
    const setEq = (k: CharacterKey) => {
      const char = super.get(k)
      if (!char) return
      super.setCached(k, { ...char, equippedWeapon })
    }
    if (key === 'Traveler') allTravelerKeys.forEach((k) => setEq(k))
    else setEq(key)
  }

  hasDup(char: ICharacter, isGO: boolean) {
    const db = this.getStorage(char.key)
    if (!db) return false
    if (isGO) {
      return JSON.stringify(db) === JSON.stringify(char)
    } else {
      let { key, level, constellation, ascension, talent } = db
      const dbGOOD = { key, level, constellation, ascension, talent }
      ;({ key, level, constellation, ascension, talent } = char)
      const charGOOD = { key, level, constellation, ascension, talent }
      return JSON.stringify(dbGOOD) === JSON.stringify(charGOOD)
    }
  }
  triggerCharacter(key: LocationCharacterKey, reason: TriggerString) {
    if (key === 'Traveler')
      allTravelerKeys.forEach((ck) => this.trigger(ck, reason, this.get(ck)))
    else this.trigger(key, reason, this.get(key))
  }
  override importGOOD(good: IGOOD & IGO, result: ImportResult) {
    result.characters.beforeMerge = this.values.length

    const source = good.source ?? 'Unknown'
    const characters = good[this.goKey]
    if (Array.isArray(characters) && characters?.length) {
      result.characters.import = characters.length
      const idsToRemove = new Set(this.keys)
      characters.forEach((c) => {
        if (!c.key) result.characters.invalid.push(c)
        idsToRemove.delete(c.key)
        if (this.hasDup(c, source === GOSource))
          result.characters.unchanged.push(c)
        else this.set(c.key, c)
      })

      // Somnia shouldn't be removed on import.
      idsToRemove.delete('Somnia')

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
    ascension: 0,
    hitMode: 'avgHit',
    equippedArtifacts: objKeyMap(allArtifactSlotKeys, () => ''),
    equippedWeapon: '',
    conditional: {},
    bonusStats: {},
    enemyOverride: {},
    talent: {
      auto: 1,
      skill: 1,
      burst: 1,
    },
    infusionAura: '',
    constellation: 0,
    team: ['', '', ''],
    teamConditional: {},
    compareData: false,
    customMultiTarget: [],
  }
}

// TODO:
function validateCustomMultiTarget<T>(t: T) {
  return t
}
