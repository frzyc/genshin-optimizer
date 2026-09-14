import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod, subscript, sum } from '@genshin-optimizer/pando/engine'
import {
  allNumConditionals,
  customDmg,
  customHeal,
  customParam,
  own,
  ownBuff,
  percent,
  register,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar } from './util'

const key: CharacterKey = 'Neuvillette'
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
      skillParam_gen.auto[a++], // 3
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[a++],
    judgmentDmg: skillParam_gen.auto[a++],
    stam: skillParam_gen.auto[a++][0],
    hpRestore: skillParam_gen.auto[a++][0],
    hpCost: skillParam_gen.auto[a++][0],
    hpCostInterval: skillParam_gen.auto[a++][0],
    hpThresh: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    skillDmg: skillParam_gen.skill[s++],
    thornDmg: skillParam_gen.skill[s++],
    dropletDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
    thornInterval: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    waterfallDmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    dmg_: [
      0,
      skillParam_gen.passive1[0][0],
      skillParam_gen.passive1[1][0],
      skillParam_gen.passive1[2][0],
    ],
    duration: skillParam_gen.passive1[3][0],
  },
  passive2: {
    hpThresh: skillParam_gen.passive2[0][0],
    idk: skillParam_gen.passive2[1][0],
    hydro_dmg_: skillParam_gen.passive2[2][0] / 100,
    maxHydro_dmg_: 0.3,
  },
  constellation2: {
    charged_critDMG_: skillParam_gen.constellation2[0],
  },
  constellation6: {
    current_dmg_: skillParam_gen.constellation6[0],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { ascension, constellation },
} = own
// WR lookup(cond(key, 'a1Stacks'), 1..3); default off = 0
const { a1Stacks } = allNumConditionals(info.key, true, 0, 3)
// WR lookup(cond(key, 'a4Hp'), 1..50); 50 * hydro_dmg_ = 0.3 cap
const { a4Hp } = allNumConditionals(info.key, true, 0, 50)

const a1Stacks_judgmentSpecialMult_ = cmpGE(
  ascension,
  1,
  percent(sum(1, subscript(a1Stacks, [...dm.passive1.dmg_]))),
  1
)
const a4Hp_hydro_dmg_ = cmpGE(
  ascension,
  4,
  prod(a4Hp, percent(dm.passive2.hydro_dmg_))
)
const c2Judgment_critDMG_ = cmpGE(
  constellation,
  2,
  prod(a1Stacks, percent(dm.constellation2.charged_critDMG_))
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Ancient Postulation (auto); C5 Axiomatic Judgment (burst)
  ownBuff.char.auto.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.dmg_.hydro.add(a4Hp_hydro_dmg_),

  // Catalyst NA/CA/plunge are already Hydro
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  dmg(
    'charged_judgment',
    info,
    'hp',
    dm.charged.judgmentDmg,
    'charged',
    { baseMulti: a1Stacks_judgmentSpecialMult_ },
    ownBuff.premod.critDMG_.charged.add(c2Judgment_critDMG_)
  ),
  customHeal(
    'charged_hpRestore',
    prod(percent(dm.charged.hpRestore), final.hp)
  ),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill', info, 'hp', dm.skill.skillDmg, 'skill'),
  // WR thornDmg sets hit.reaction to '' (Arkhe); Pando has no no-react overlay.
  dmg('skill_thorn', info, 'atk', dm.skill.thornDmg, 'skill'),
  dmg('burst', info, 'hp', dm.burst.skillDmg, 'burst'),
  dmg('burst_waterfall', info, 'hp', dm.burst.waterfallDmg, 'burst'),
  customDmg(
    'c6',
    info.ele,
    'charged',
    prod(
      percent(dm.constellation6.current_dmg_),
      final.hp,
      a1Stacks_judgmentSpecialMult_
    ),
    { cond: cmpGE(constellation, 6, 'infer', '') },
    ownBuff.premod.critDMG_.charged.add(c2Judgment_critDMG_)
  ),

  customParam('charged_stam', dm.charged.stam),
  customParam('charged_hpLoss', prod(percent(dm.charged.hpCost), final.hp)),
  customParam('skill_dropletDuration', dm.skill.dropletDuration),
  customParam('skill_cd', dm.skill.cd),
  customParam('skill_thornInterval', dm.skill.thornInterval),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
