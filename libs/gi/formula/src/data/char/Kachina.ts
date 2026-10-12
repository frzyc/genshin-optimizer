import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod, subscript } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allNumConditionals,
  customDmg,
  customParam,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar } from './util'

const key: CharacterKey = 'Kachina'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = -1,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[++a], // 1
      skillParam_gen.auto[++a], // 2.1
      skillParam_gen.auto[++a], // 2.2
      skillParam_gen.auto[++a], // 3
      skillParam_gen.auto[++a], // 4
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[++a],
    stam: skillParam_gen.auto[++a][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[++a],
    low: skillParam_gen.auto[++a],
    high: skillParam_gen.auto[++a],
  },
  skill: {
    rideDmg: skillParam_gen.skill[s++],
    independentDmg: skillParam_gen.skill[s++],
    pointLimit: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    geo_dmg_: skillParam_gen.passive1[0][0],
    duration: skillParam_gen.passive1[1][0],
  },
  passive2: {
    dmgInc: skillParam_gen.passive2[0][0],
  },
  constellation1: {
    energyRegen: skillParam_gen.constellation1[0],
    cd: skillParam_gen.constellation1[1],
  },
  constellation2: {
    pointsRegen: skillParam_gen.constellation2[0],
  },
  constellation4: {
    def_: skillParam_gen.constellation4,
  },
  constellation6: {
    dmg: skillParam_gen.constellation6[0],
    cd: skillParam_gen.constellation6[1],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { ascension, constellation },
} = own
// WR cond(key, 'a1NightsoulBurst')
const { a1NightsoulBurst } = allBoolConditionals(info.key)
// WR lookup(cond(key, 'c4Opponents'), 1..4 → n, else 0) then subscript([0, ...def_])
const { c4Opponents } = allNumConditionals(info.key, true, 0, 4)

const a1NightsoulBurst_geo_dmg_ = a1NightsoulBurst.ifOn(
  cmpGE(ascension, 1, percent(dm.passive1.geo_dmg_))
)
// WR prod(percent(dmgInc), total.def). Read premod.def@agg so formula.base cannot cycle.
const a4_skill_dmgInc = cmpGE(
  ascension,
  4,
  prod(percent(dm.passive2.dmgInc), own.premod.def.sheet('agg'))
)
const c4Opponents_def_ = cmpGE(
  constellation,
  4,
  percent(subscript(c4Opponents, [0, ...dm.constellation4.def_]))
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Go, Go Turbo Twirly! (skill); C5 Time to Get Serious! (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.dmg_.geo.add(a1NightsoulBurst_geo_dmg_),
  ownBuff.formula.base.skill.add(a4_skill_dmgInc),
  // WR teamBuff.premod.def_ — whole party, not dest-gated.
  teamBuff.premod.def_.add(c4Opponents_def_),

  // Formulas — NA/CA/plunge ATK; skill/burst/C6 scale DEF (geo).
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill_ride', info, 'def', dm.skill.rideDmg, 'skill'),
  dmg('skill_independent', info, 'def', dm.skill.independentDmg, 'skill'),
  dmg('burst', info, 'def', dm.burst.skillDmg, 'burst'),
  customDmg(
    'c6',
    info.ele,
    'elemental',
    prod(percent(dm.constellation6.dmg), final.def),
    { cond: cmpGE(constellation, 6, 'infer', '') }
  ),

  customParam('charged_stam', dm.charged.stam),
  customParam('skill_pointLimit', dm.skill.pointLimit),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
