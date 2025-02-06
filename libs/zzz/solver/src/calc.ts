import {
  clamp01,
  objKeyMap,
  objSumInPlace,
} from '@genshin-optimizer/common/util'
import type {
  AnomalyDamageKey,
  AttributeDamageKey,
  CondKey,
  DiscSetKey,
  FormulaKey,
} from '@genshin-optimizer/zzz/consts'
import {
  allAnomalyDmgKeys,
  allAttributeDamageKeys,
  disc2pEffect,
  disc4PeffectSheets,
} from '@genshin-optimizer/zzz/consts'
import type { Stats } from '@genshin-optimizer/zzz/db'
import type { DiscStats } from './common'

export function passSetFilter(
  discs: DiscStats[],
  filter2: DiscSetKey[],
  filter4: DiscSetKey[]
): boolean {
  const setCount: Partial<Record<DiscSetKey, number>> = {}
  if (!filter4.length && !filter2.length) return true
  for (const { setKey } of discs) setCount[setKey] = (setCount[setKey] || 0) + 1

  if (filter4.length) {
    let has4 = false
    for (const key in setCount) {
      const k = key as DiscSetKey
      if (setCount[k]! >= 4 && filter4.includes(k)) {
        has4 = true
        break // can break out because there is only one 4p
      }
    }
    if (!has4) return false
  }
  if (filter2.length) {
    for (const key in setCount) {
      const k = key as DiscSetKey
      const val = setCount[k]!
      if (val === 1) return false // Rainbow
      if (val >= 2 && val < 4 && !filter2.includes(k)) return false
    }
  }
  return true
}

/**
 * sum up stats from base + discs + 2p effects
 */
export function applyCalc(
  baseStats: Stats,
  conditionals: Partial<Record<CondKey, number>>,
  discs: DiscStats[]
) {
  const sum = { ...baseStats }
  const s = (key: string) => sum[key] || 0

  const setCount: Partial<Record<DiscSetKey, number>> = {}
  // Apply disc set counts
  for (const { setKey } of discs) setCount[setKey] = (setCount[setKey] || 0) + 1
  objSumInPlace(sum, setCount)

  // Apply disc stats
  for (const { stats } of discs) objSumInPlace(sum, stats)

  // Apply 2p effects
  for (const key in setCount) {
    const k = key as DiscSetKey
    if (setCount[k]! >= 2) {
      const p2 = disc2pEffect[k]
      if (p2) objSumInPlace(sum, p2)
    }
  }
  // Apply 4p effects
  for (const key in setCount) {
    const k = key as DiscSetKey
    if (setCount[k]! >= 4) {
      const p4 = disc4PeffectSheets[k]?.getStats(conditionals, sum)
      if (p4) objSumInPlace(sum, p4)
    }
  }

  // Rudimentary Calculations
  sum['initial_hp'] = s('hp_base') * (1 + s('hp_')) + s('hp')
  sum['initial_atk'] = s('atk_base') * (1 + s('atk_')) + s('atk')
  sum['initial_def'] = s('def_base') * (1 + s('def_')) + s('def')
  sum['final_hp'] = s('initial_hp') * (1 + s('cond_hp_')) + s('cond_hp')
  sum['final_atk'] = s('initial_atk') * (1 + s('cond_atk_')) + s('cond_atk')
  sum['final_def'] = s('initial_def') * (1 + s('cond_def_')) + s('cond_def')
  sum['impact'] = s('impact') * (1 + s('impact_'))
  sum['anomMas'] = s('anomMas') * (1 + s('anomMas_'))
  sum['crit_'] = clamp01(sum['crit_'])
  return sum
}

export function calcFormula(sums: Record<string, number>, formula: FormulaKey) {
  return formulas[formula](sums) ?? 0
}

const formulas: Record<FormulaKey, (sums: Record<string, number>) => number> = {
  initial_atk: (sums: Record<string, number>) => sums['initial_atk'] || 0,
  ...objKeyMap(
    allAttributeDamageKeys,
    (dmg_) => (sums: Record<string, number>) => {
      const s = (key: string) => sums[key] || 0

      return (
        // Base DMG, missing ability MV
        s('final_atk') *
        // DMG Bonus Multiplier
        (1 + s(dmg_) + s('dmg_')) *
        // Crit Multiplier
        (1 + s('crit_') * s('crit_dmg_')) *
        // DEF Multiplier
        defMulti(s) *
        // Res Multiplier
        resMulti(s)
        // DMG Taken Multipler skipped
        // Stunned Multiplier skipped
      )
    }
  ),
  ...objKeyMap(allAnomalyDmgKeys, (dmg_) => (sums: Record<string, number>) => {
    const s = (key: string) => sums[key] || 0
    return (
      // Anomaly Base DMG
      anomalyBaseDmg[dmg_] *
      s('final_atk') *
      // Anomaly Proficiency Multiplier
      (s('anomProf') * 0.01) *
      // Anomaly Level Multiplier
      (1 + (1 / 59) * (s('charLvl') - 1)) *
      // DMG Bonus Multiplier
      (1 + s(anomalyDmgMap[dmg_]) + s('dmg_')) *
      // DEF Multiplier
      defMulti(s) *
      // Res Multiplier
      resMulti(s)
      // DMG Taken Multipler skipped
      // Stunned Multiplier skipped
    )
  }),
}
function defMulti(s: (k: string) => number) {
  const lvlFactor = getLvlFactor(s('charLvl'))
  return (
    lvlFactor /
    (Math.max(
      s('enemyDef') * (1 - s('enemyDefRed_')) * (1 - s('pen_')) - s('pen'),
      0
    ) +
      lvlFactor)
  )
}
function resMulti(s: (k: string) => number) {
  return 1 - s('enemyRes_') + s('enemyResRed_') + s('enemyResIgn_')
}
function getLvlFactor(lvl: number) {
  return lvlFactorMap[lvl as unknown as keyof typeof lvlFactorMap] || 794
}
const lvlFactorMap = {
  '1': 50,
  '2': 54,
  '3': 58,
  '4': 62,
  '5': 66,
  '6': 71,
  '7': 76,
  '8': 82,
  '9': 88,
  '10': 94,
  '11': 100,
  '12': 107,
  '13': 114,
  '14': 121,
  '15': 129,
  '16': 137,
  '17': 145,
  '18': 153,
  '19': 162,
  '20': 172,
  '21': 181,
  '22': 191,
  '23': 201,
  '24': 211,
  '25': 222,
  '26': 233,
  '27': 245,
  '28': 256,
  '29': 268,
  '30': 281,
  '31': 293,
  '32': 306,
  '33': 319,
  '34': 333,
  '35': 347,
  '36': 361,
  '37': 375,
  '38': 390,
  '39': 405,
  '40': 421,
  '41': 436,
  '42': 452,
  '43': 469,
  '44': 485,
  '45': 502,
  '46': 519,
  '47': 537,
  '48': 555,
  '49': 573,
  '50': 592,
  '51': 610,
  '52': 629,
  '53': 649,
  '54': 669,
  '55': 689,
  '56': 709,
  '57': 730,
  '58': 751,
  '59': 772,
  '60': 794,
} as const

const anomalyDmgMap: Record<AnomalyDamageKey, AttributeDamageKey> = {
  burn: 'fire_dmg_',
  shock: 'electric_dmg_',
  corruption: 'ether_dmg_',
  shatter: 'ice_dmg_',
  assault: 'physical_dmg_',
} as const
const anomalyBaseDmg: Record<AnomalyDamageKey, number> = {
  burn: 0.5,
  shock: 1.25,
  corruption: 0.625,
  shatter: 5.0,
  assault: 7.13,
}
