import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  customParam,
  own,
  ownBuff,
  percent,
  register,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, splitScaleDmg } from './util'

const key: CharacterKey = 'Chiori'
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
      skillParam_gen.auto[++a], // 3x2
      skillParam_gen.auto[(a += 2)], // 4
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[++a], // x2
    stam: skillParam_gen.auto[(a += 2)][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[++a],
    low: skillParam_gen.auto[++a],
    high: skillParam_gen.auto[++a],
  },
  skill: {
    turretDmg_atk: skillParam_gen.skill[s++],
    turretDmg_def: skillParam_gen.skill[s++],
    turretDuration: skillParam_gen.skill[s++][0],
    turretInterval: skillParam_gen.skill[s++][0],
    sweepDmg_atk: skillParam_gen.skill[s++],
    sweepDmg_def: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    bloomDmg_atk: skillParam_gen.burst[b++],
    bloomDmg_def: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    dollDmg: skillParam_gen.passive1[0][0],
    momentDuration: skillParam_gen.passive1[1][0],
    dollInterval: skillParam_gen.passive1[2][0],
    dollTriggers: skillParam_gen.passive1[3][0],
    infusionDuration: skillParam_gen.passive1[4][0],
  },
  passive2: {
    geo_dmg_: skillParam_gen.passive2[0][0],
    duration: skillParam_gen.passive2[1][0],
  },
  constellation1: {
    aoeIncrease: skillParam_gen.constellation1[0],
  },
  constellation2: {
    interval: skillParam_gen.constellation2[0],
    duration: skillParam_gen.constellation2[1],
    dmg: skillParam_gen.constellation2[2],
    dollDuration: skillParam_gen.constellation2[3],
  },
  constellation4: {
    duration: skillParam_gen.constellation4[0],
    dollDuration: skillParam_gen.constellation4[1],
    maxDolls: skillParam_gen.constellation4[2],
    cd: skillParam_gen.constellation4[4],
  },
  constellation6: {
    cdReduction: skillParam_gen.constellation6[0],
    auto_dmgInc_def: skillParam_gen.constellation6[1],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { ascension, constellation },
} = own
// WR cond(key, 'a1Infusion' | 'a4Construct')
const { a1Infusion, a4Construct } = allBoolConditionals(info.key)

const a1InfusionOn = cmpGE(
  prod(cmpGE(ascension, 1, 1), a1Infusion.ifOn(1)),
  1,
  'infer',
  ''
)
const a4Construct_geo_dmg_ = a4Construct.ifOn(
  cmpGE(ascension, 4, percent(dm.passive2.geo_dmg_))
)
// WR prod(percent(auto_dmgInc_def), total.def) → formula.base.normal.
const c6Beauty_normal_dmgInc = cmpGE(
  constellation,
  6,
  prod(percent(dm.constellation6.auto_dmgInc_def), final.def)
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Fluttering Hasode (skill); C5 Hiyoku: Twin Blades (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.dmg_.geo.add(a4Construct_geo_dmg_),
  ownBuff.formula.base.normal.add(c6Beauty_normal_dmgInc),

  // WR infusion.overridableSelf geo. infusionPrio.overridable has no geo —
  // listing-local `{ ele: 'geo' }` on A1 Tailoring NA/CA/plunge.
  dm.normal.hitArr.flatMap((arr, i) => [
    ...dmg(`normal_${i}`, info, 'atk', arr, 'normal'),
    ...dmg(`normal_${i}_geo`, info, 'atk', arr, 'normal', {
      ele: 'geo',
      cond: a1InfusionOn,
    }),
  ]),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  dmg('charged_geo', info, 'atk', dm.charged.dmg, 'charged', {
    ele: 'geo',
    cond: a1InfusionOn,
  }),
  Object.entries(dm.plunging).flatMap(([k, v]) => [
    ...dmg(`plunging_${k}`, info, 'atk', v, 'plunging'),
    ...dmg(`plunging_${k}_geo`, info, 'atk', v, 'plunging', {
      ele: 'geo',
      cond: a1InfusionOn,
    }),
  ]),
  splitScaleDmg(
    'turretDmg',
    info,
    ['atk', 'def'],
    [dm.skill.turretDmg_atk, dm.skill.turretDmg_def],
    'skill'
  ),
  splitScaleDmg(
    'sweepDmg',
    info,
    ['atk', 'def'],
    [dm.skill.sweepDmg_atk, dm.skill.sweepDmg_def],
    'skill'
  ),
  splitScaleDmg(
    'bloomDmg',
    info,
    ['atk', 'def'],
    [dm.burst.bloomDmg_atk, dm.burst.bloomDmg_def],
    'burst'
  ),
  splitScaleDmg(
    'dollDmg',
    info,
    ['atk', 'def'],
    [dm.skill.sweepDmg_atk, dm.skill.sweepDmg_def],
    'skill',
    {
      baseMulti: percent(dm.passive1.dollDmg),
      cond: cmpGE(ascension, 1, 'infer', ''),
    }
  ),
  splitScaleDmg(
    'c2_dollDmg',
    info,
    ['atk', 'def'],
    [dm.skill.turretDmg_atk, dm.skill.turretDmg_def],
    'skill',
    {
      baseMulti: percent(dm.passive1.dollDmg * dm.constellation2.dmg),
      cond: cmpGE(constellation, 2, 'infer', ''),
    }
  ),
  customParam('c6_normal_dmgInc', c6Beauty_normal_dmgInc, {
    cond: cmpGE(constellation, 6, 'infer', ''),
  }),

  customParam('charged_stam', dm.charged.stam),
  customParam('skill_turretDuration', dm.skill.turretDuration),
  customParam('skill_turretInterval', dm.skill.turretInterval),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
