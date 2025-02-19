import type { TriggerString } from '@genshin-optimizer/common/database'
import {
  clamp,
  objFilter,
  objFilterKeys,
  validateArr,
} from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import {
  allAttributeDamageKeys,
  allCharacterKeys,
  allDiscSetKeys,
  allFormulaKeys,
  allWengineKeys,
  coreLimits,
  discSlotToMainStatKeys,
} from '@genshin-optimizer/zzz/consts'
import { validateLevelAsc, validateTalent } from '@genshin-optimizer/zzz/util'
import type { ICachedCharacter, IDbCharacter } from '../../Interfaces'
import { DataManager } from '../DataManager'
import type { ZzzDatabase } from '../Database'

export function initialCharacterData(key: CharacterKey): ICachedCharacter {
  return {
    key,
    level: 1,
    core: 0,
    wengineKey: allWengineKeys[0],
    wengineLvl: 60,
    wenginePhase: 1,
    stats: {
      // in percent
      enemyDef: 953, // default enemy DEF
    },
    formulaKey: allFormulaKeys[0],
    constraints: {}, // in percent
    useEquipped: false,
    slot4: [...discSlotToMainStatKeys['4']],
    slot5: [...discSlotToMainStatKeys['5']],
    slot6: [...discSlotToMainStatKeys['6']],
    levelLow: 15,
    levelHigh: 15,
    setFilter2: [],
    setFilter4: [],
    conditionals: {},
    ascension: 0,
    mindscape: 0,
    talent: {
      dodge: 1,
      basic: 1,
      chain: 1,
      special: 1,
      assist: 1,
    },
  }
}
export class CharacterDataManager extends DataManager<
  CharacterKey,
  'characters',
  ICachedCharacter,
  IDbCharacter
> {
  constructor(database: ZzzDatabase) {
    super(database, 'characters')
  }
  override validate(obj: unknown): IDbCharacter | undefined {
    if (!obj || typeof obj !== 'object') return undefined
    const { key: characterKey } = obj as IDbCharacter
    let {
      core,
      wengineKey,
      wengineLvl,
      wenginePhase,
      stats,
      formulaKey,
      constraints,
      useEquipped,
      slot4,
      slot5,
      slot6,
      levelLow,
      levelHigh,
      setFilter2,
      setFilter4,
      conditionals,
      mindscape,
      talent,
    } = obj as IDbCharacter
    const { level: rawLevel, ascension: rawAscension } = obj as IDbCharacter

    if (!allCharacterKeys.includes(characterKey)) return undefined // non-recoverable

    if (typeof mindscape !== 'number' || mindscape < 0 || mindscape > 6)
      mindscape = 0

    const { sanitizedLevel, ascension } = validateLevelAsc(
      rawLevel,
      rawAscension
    )
    talent = validateTalent(ascension, talent)

    if (typeof core !== 'number') core = 0
    core = clamp(core, 0, coreLimits[ascension + 1])

    if (!allWengineKeys.includes(wengineKey)) wengineKey = allWengineKeys[0]

    if (typeof wengineLvl !== 'number') wengineLvl = 60
    wengineLvl = clamp(wengineLvl, 1, 60)

    if (typeof wenginePhase !== 'number') wenginePhase = 1
    wenginePhase = clamp(wenginePhase, 1, 5)

    if (typeof stats !== 'object') stats = {}
    stats = objFilter(
      stats,
      //enemyDefRed was a field used very temporarily
      (val, k) => typeof val === 'number' && !!val && k !== 'enemyDefRed'
    )

    if (!allFormulaKeys.includes(formulaKey)) formulaKey = allFormulaKeys[0]

    if (typeof constraints !== 'object') constraints = {}
    constraints = objFilter(
      constraints,
      ({ value, isMax }) =>
        typeof value === 'number' && typeof isMax === 'boolean'
    )
    constraints = objFilterKeys(
      constraints,
      // Taken from StatFilterCard
      [
        'hp',
        'def',
        'atk',
        'crit_',
        'crit_dmg_',
        'anomProf',
        'pen',
        ...allAttributeDamageKeys,
      ]
    )
    useEquipped = !!useEquipped

    slot4 = validateArr(slot4, discSlotToMainStatKeys['4'])
    slot5 = validateArr(slot5, discSlotToMainStatKeys['5'])
    slot6 = validateArr(slot6, discSlotToMainStatKeys['6'])

    if (typeof levelLow !== 'number') levelLow = 15
    levelLow = clamp(levelLow, 0, 15)

    if (typeof levelHigh !== 'number') levelHigh = 15
    levelHigh = clamp(levelHigh, 0, 15)

    setFilter2 = validateArr(setFilter2, allDiscSetKeys, [])
    setFilter4 = validateArr(setFilter4, allDiscSetKeys, [])

    if (typeof conditionals !== 'object') conditionals = {}
    conditionals = objFilter(conditionals, (value) => typeof value === 'number')

    const char: IDbCharacter = {
      key: characterKey,
      level: sanitizedLevel,
      core,
      wengineKey,
      wengineLvl,
      wenginePhase,
      stats,
      formulaKey,
      constraints,
      useEquipped,
      slot4,
      slot5,
      slot6,
      levelLow,
      levelHigh,
      setFilter2,
      setFilter4,
      conditionals,
      mindscape,
      talent,
      ascension,
    }
    return char
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
}
