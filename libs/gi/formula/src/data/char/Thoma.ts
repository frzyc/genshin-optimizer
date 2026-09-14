import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allNumConditionals,
  customParam,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, shield } from './util'

const key: CharacterKey = 'Thoma'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = 0,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3x2
      skillParam_gen.auto[a++], // 4
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    dmg: skillParam_gen.skill[s++],
    hpShield_: skillParam_gen.skill[s++],
    baseShield: skillParam_gen.skill[s++],
    shieldDuration: skillParam_gen.skill[s++][0],
    maxHpShield_: skillParam_gen.skill[s++],
    maxBaseShield: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    pressDmg: skillParam_gen.burst[b++],
    collapseDmg: skillParam_gen.burst[b++],
    hpShield_: skillParam_gen.burst[b++],
    baseShield: skillParam_gen.burst[b++],
    shieldDuration: skillParam_gen.burst[b++][0],
    unknown: skillParam_gen.burst[b++][0],
    scorchingDuration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    shield_: skillParam_gen.passive1[0][0],
    duration: skillParam_gen.passive1[1][0],
    maxStacks: skillParam_gen.passive1[2][0],
    cd: skillParam_gen.passive1[3][0],
  },
  passive2: {
    collapse_dmgInc: skillParam_gen.passive2[0][0],
  },
  c2: {
    burstDuration: skillParam_gen.constellation2[0],
  },
  c4: {
    energyRestore: skillParam_gen.constellation4[0],
  },
  c6: {
    auto_dmg: skillParam_gen.constellation6[0],
    duration: skillParam_gen.constellation6[1],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { ascension, constellation },
} = own
// WR cond(key, 'p1BarrierStacks' | 'c6AfterBarrier')
// WR lookup p1BarrierStacks 1..maxStacks → num 0–maxStacks
const { c6AfterBarrier } = allBoolConditionals(info.key)
const { p1BarrierStacks } = allNumConditionals(
  info.key,
  true,
  0,
  dm.passive1.maxStacks
)

const p1_shield_ = cmpGE(
  ascension,
  1,
  prod(p1BarrierStacks, percent(dm.passive1.shield_))
)
const p2Collapse_dmgInc = cmpGE(
  ascension,
  4,
  prod(percent(dm.passive2.collapse_dmgInc), final.hp)
)
const c6_auto_dmg_ = c6AfterBarrier.ifOn(
  cmpGE(constellation, 6, percent(dm.c6.auto_dmg))
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Blazing Blessing (skill); C5 Crimson Ooyoroi (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  // WR teamBuff is whole-party (comment admits should be active-only).
  teamBuff.premod.shield_.add(p1_shield_),
  teamBuff.premod.dmg_.normal.add(c6_auto_dmg_),
  teamBuff.premod.dmg_.charged.add(c6_auto_dmg_),
  teamBuff.premod.dmg_.plunging.add(c6_auto_dmg_),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_dmg1', info, 'atk', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill', info, 'atk', dm.skill.dmg, 'skill'),
  shield(
    'skill_minShield',
    'hp',
    dm.skill.hpShield_,
    dm.skill.baseShield,
    'skill'
  ),
  shield(
    'skill_minPyroShield',
    'hp',
    dm.skill.hpShield_,
    dm.skill.baseShield,
    'skill',
    { ele: 'pyro' }
  ),
  shield(
    'skill_maxShield',
    'hp',
    dm.skill.maxHpShield_,
    dm.skill.maxBaseShield,
    'skill'
  ),
  shield(
    'skill_maxPyroShield',
    'hp',
    dm.skill.maxHpShield_,
    dm.skill.maxBaseShield,
    'skill',
    { ele: 'pyro' }
  ),
  dmg('pressDmg', info, 'atk', dm.burst.pressDmg, 'burst'),
  // WR dmgNode overlay premod.burst_dmgInc on this listing only (Nahida extras).
  dmg(
    'collapseDmg',
    info,
    'atk',
    dm.burst.collapseDmg,
    'burst',
    undefined,
    ownBuff.formula.base.add(p2Collapse_dmgInc)
  ),
  shield(
    'burst_shield',
    'hp',
    dm.burst.hpShield_,
    dm.burst.baseShield,
    'burst'
  ),
  shield(
    'burst_pyroShield',
    'hp',
    dm.burst.hpShield_,
    dm.burst.baseShield,
    'burst',
    { ele: 'pyro' }
  ),
  customParam('p2Collapse_dmgInc', p2Collapse_dmgInc, {
    cond: cmpGE(ascension, 4, 'infer', ''),
  }),

  customParam('charged_stamina', dm.charged.stamina),
  customParam('skill_duration', dm.skill.shieldDuration),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_shieldDuration', dm.burst.shieldDuration),
  customParam('burst_scorchingDuration', dm.burst.scorchingDuration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost),
  customParam('c2_burstDuration', dm.c2.burstDuration, {
    cond: cmpGE(constellation, 2, 'infer', ''),
  }),
  customParam('c4_energyRestore', dm.c4.energyRestore, {
    cond: cmpGE(constellation, 4, 'infer', ''),
  })
)
