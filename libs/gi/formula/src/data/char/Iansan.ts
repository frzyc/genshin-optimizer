import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, cmpNE, min, prod } from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import {
  allBoolConditionals,
  allNumConditionals,
  customHeal,
  customParam,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Iansan'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = -1,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[++a], // 1
      skillParam_gen.auto[++a], // 2
      skillParam_gen.auto[++a], // 3
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[++a],
    swiftDmg: skillParam_gen.auto[++a],
    stam: skillParam_gen.auto[++a][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[++a],
    low: skillParam_gen.auto[++a],
    high: skillParam_gen.auto[++a],
  },
  skill: {
    skillDmg: skillParam_gen.skill[s++],
    nsLimit: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    highAtkConversion: skillParam_gen.burst[b++][0],
    lowAtkConversionPerNs: skillParam_gen.burst[b++][0],
    maxAtk: skillParam_gen.burst[b++],
    nonCombatDuration: skillParam_gen.burst[b++][0],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    atk_: skillParam_gen.passive1[0][0],
    extraNs: skillParam_gen.passive1[1][0],
    duration: skillParam_gen.passive1[2][0],
    addlNs: skillParam_gen.passive1[3][0],
    cd: skillParam_gen.passive1[4][0],
  },
  passive2: {
    duration: skillParam_gen.passive2[0][0],
    heal: skillParam_gen.passive2[1][0],
    cd: skillParam_gen.passive2[2][0],
  },
  constellation1: {
    nsConsumed: skillParam_gen.constellation1[0],
    energyRegen: skillParam_gen.constellation1[1],
    cd: skillParam_gen.constellation1[2],
  },
  constellation2: {
    atk_: skillParam_gen.constellation2[0],
    duration: 15,
  },
  constellation4: {
    addlNs: skillParam_gen.constellation4[0],
    overflowRefund: skillParam_gen.constellation4[1],
  },
  constellation6: {
    durationInc: skillParam_gen.constellation6[0],
    duration: skillParam_gen.constellation6[1],
    dmg_: skillParam_gen.constellation6[2],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { burst, ascension, constellation },
} = own
// WR cond(key, 'a1Precise' | 'c6Extreme')
const { a1Precise, c6Extreme } = allBoolConditionals(info.key)
// WR lookup(cond(key, 'burstNs'), 1..42 → n, else 0). threshold ≥42 uses high ATK%.
const { burstNs } = allNumConditionals(info.key, true, 0, 42)

// WR uses input.premod.atk so teamBuff.total.atk cannot cycle. Write final.atk.
const burstNs_atkDisp = min(
  cmpGE(
    burstNs,
    42,
    prod(percent(dm.burst.highAtkConversion), own.premod.atk.sheet('agg')),
    prod(
      percent(dm.burst.lowAtkConversionPerNs),
      burstNs,
      own.premod.atk.sheet('agg')
    )
  ),
  talentSubscript(burst, dm.burst.maxAtk)
)
// WR equal(activeCharKey, target.charKey, …) — dest-gated Kinetic Energy Scale.
const burstNs_atk = cmpNE(destIsActive, 0, burstNs_atkDisp)

const a1Precise_atk_ = a1Precise.ifOn(
  cmpGE(ascension, 1, percent(dm.passive1.atk_))
)
const c2OffFieldPrecise_atk_ = a1Precise.ifOn(
  cmpGE(constellation, 2, cmpGE(ascension, 1, percent(dm.constellation2.atk_)))
)
const c6Extreme_dmg_ = c6Extreme.ifOn(
  cmpGE(constellation, 6, percent(dm.constellation6.dmg_))
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Thunderbolt Rush (skill); C5 The Three Principles of Power (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.atk_.add(a1Precise_atk_),
  teamBuff.final.atk.add(burstNs_atk),
  teamBuff.premod.atk_.add(cmpNE(destIsActive, 0, c2OffFieldPrecise_atk_)),
  teamBuff.premod.dmg_.add(cmpNE(destIsActive, 0, c6Extreme_dmg_)),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  dmg('charged_swiftDmg', info, 'atk', dm.charged.swiftDmg, 'charged', {
    ele: 'electro',
  }),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill', info, 'atk', dm.skill.skillDmg, 'skill'),
  dmg('burst', info, 'atk', dm.burst.skillDmg, 'burst'),
  customHeal('passive2_heal', prod(percent(dm.passive2.heal), final.atk)),
  customParam('burstNs_atkDisp', burstNs_atkDisp),

  customParam('skill_nsLimit', dm.skill.nsLimit),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_nonCombatDuration', dm.burst.nonCombatDuration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
