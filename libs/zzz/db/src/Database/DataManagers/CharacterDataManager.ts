import type { TriggerString } from '@genshin-optimizer/common/database'
import {
  clamp,
  objFilter,
  objFilterKeys,
  validateArr,
} from '@genshin-optimizer/common/util'
import type {
  CharacterKey,
  CondKey,
  DiscMainStatKey,
  DiscSetKey,
  FormulaKey,
  WengineKey,
} from '@genshin-optimizer/zzz/consts'
import {
  allAttributeDamageKeys,
  allCharacterKeys,
  allDiscSetKeys,
  allFormulaKeys,
  allWengineKeys,
  discSlotToMainStatKeys,
} from '@genshin-optimizer/zzz/consts'
import { DataManager } from '../DataManager'
import type { ZzzDatabase } from '../Database'

export type Constraints = Record<string, { value: number; isMax: boolean }>
export type Stats = Record<string, number>
export type CharacterData = {
  key: CharacterKey
  level: number
  core: number // 0-6
  wengineKey: WengineKey
  wengineLvl: number
  stats: Stats
  formulaKey: FormulaKey
  constraints: Constraints
  useEquipped: boolean
  slot4: DiscMainStatKey[]
  slot5: DiscMainStatKey[]
  slot6: DiscMainStatKey[]
  levelLow: number
  levelHigh: number
  setFilter2: DiscSetKey[]
  setFilter4: DiscSetKey[]
  conditionals: Partial<Record<CondKey, number>>
}

function initialCharacterData(key: CharacterKey): CharacterData {
  return {
    key,
    level: 60,
    core: 6,
    wengineKey: allWengineKeys[0],
    wengineLvl: 60,
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
  }
}
export class CharacterDataManager extends DataManager<
  CharacterKey,
  'characters',
  CharacterData,
  CharacterData
> {
  constructor(database: ZzzDatabase) {
    super(database, 'characters')
  }
  override validate(obj: unknown): CharacterData | undefined {
    if (!obj || typeof obj !== 'object') return undefined
    const { key: characterKey } = obj as CharacterData
    let {
      level,
      core,
      wengineKey,
      wengineLvl,
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
    } = obj as CharacterData

    if (!allCharacterKeys.includes(characterKey)) return undefined // non-recoverable

    if (typeof level !== 'number') level = 60
    level = clamp(level, 1, 60)

    if (typeof core !== 'number') core = 6
    core = clamp(core, 0, 6)

    if (!allWengineKeys.includes(wengineKey)) wengineKey = allWengineKeys[0]

    if (typeof wengineLvl !== 'number') wengineLvl = 60
    wengineLvl = clamp(wengineLvl, 1, 60)

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

    const char: CharacterData = {
      key: characterKey,
      level,
      core,
      wengineKey,
      wengineLvl,
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

  getOrCreate(key: CharacterKey): CharacterData {
    if (!this.keys.includes(key)) {
      this.set(key, initialCharacterData(key))
    }
    return this.get(key) as CharacterData
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
}
