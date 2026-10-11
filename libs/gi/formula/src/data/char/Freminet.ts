import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, min, prod, sum } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allNumConditionals,
  customParam,
  own,
  ownBuff,
  percent,
  register,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar } from './util'

const key: CharacterKey = 'Freminet'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = 0,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
    ],
  },
  charged: {
    spin_dmg: skillParam_gen.auto[a++],
    final_dmg: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
    duration: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    thrustDmg: skillParam_gen.skill[s++],
    thornDmg: skillParam_gen.skill[s++],
    frostDmg: skillParam_gen.skill[s++],
    level0Dmg: skillParam_gen.skill[s++],
    level1CryoDmg: skillParam_gen.skill[s++],
    level1PhysDmg: skillParam_gen.skill[s++],
    level2CryoDmg: skillParam_gen.skill[s++],
    level2PhysDmg: skillParam_gen.skill[s++],
    level3CryoDmg: skillParam_gen.skill[s++],
    level3PhysDmg: skillParam_gen.skill[s++],
    level4Dmg: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
    thornInterval: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    cdDecrease: skillParam_gen.passive1[0][0],
  },
  passive2: {
    pressure_dmg_: skillParam_gen.passive2[0][0],
    duration: skillParam_gen.passive2[1][0],
  },
  constellation1: {
    pressure_critRate_: skillParam_gen.constellation1[0],
  },
  constellation2: {
    energyGen: skillParam_gen.constellation2[0],
    level4EnergyGen: skillParam_gen.constellation2[1],
  },
  constellation4: {
    atk_: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
    maxStacks: skillParam_gen.constellation4[2],
    cd: skillParam_gen.constellation4[3],
  },
  constellation6: {
    critDMG_: skillParam_gen.constellation6[0],
    duration: skillParam_gen.constellation6[1],
    maxStacks: skillParam_gen.constellation6[2],
    cd: skillParam_gen.constellation6[3],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  char: { ascension, constellation },
} = own
// WR cond(key, 'stalk' | 'a4AfterShatter'); lookup('c4C6Stacks') → num 0–4
const { stalk, a4AfterShatter } = allBoolConditionals(info.key)
const { c4C6Stacks } = allNumConditionals(info.key, true, 0, 3)

const frost_baseMulti = sum(percent(1), stalk.ifOn(percent(1)))
const a4AfterShatter_pressure_dmg_ = a4AfterShatter.ifOn(
  cmpGE(ascension, 4, percent(dm.passive2.pressure_dmg_))
)
const c1Pressure_critRate_ = cmpGE(
  constellation,
  1,
  percent(dm.constellation1.pressure_critRate_)
)
const c4Stacks_atk_ = cmpGE(
  constellation,
  4,
  prod(
    percent(dm.constellation4.atk_),
    min(c4C6Stacks, dm.constellation4.maxStacks)
  )
)
const c6Stacks_critDMG_ = cmpGE(
  constellation,
  6,
  prod(percent(dm.constellation6.critDMG_), c4C6Stacks)
)

const pressureExtras = [
  ownBuff.premod.dmg_.skill.add(a4AfterShatter_pressure_dmg_),
  ownBuff.premod.critRate_.skill.add(c1Pressure_critRate_),
] as const

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Impaling Ice (auto); C5 Nights of Hearth and Happiness (skill)
  ownBuff.char.auto.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.atk_.add(c4Stacks_atk_),
  ownBuff.premod.critDMG_.add(c6Stacks_critDMG_),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_spin', info, 'atk', dm.charged.spin_dmg, 'charged'),
  dmg('charged_final', info, 'atk', dm.charged.final_dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('thrustDmg', info, 'atk', dm.skill.thrustDmg, 'skill'),
  dmg('thornDmg', info, 'atk', dm.skill.thornDmg, 'skill'),
  dmg('frostDmg', info, 'atk', dm.skill.frostDmg, 'skill', {
    baseMulti: frost_baseMulti,
  }),
  dmg(
    'level0Dmg',
    info,
    'atk',
    dm.skill.level0Dmg,
    'skill',
    undefined,
    ...pressureExtras
  ),
  dmg(
    'level1CryoDmg',
    info,
    'atk',
    dm.skill.level1CryoDmg,
    'skill',
    undefined,
    ...pressureExtras
  ),
  dmg(
    'level1PhysDmg',
    info,
    'atk',
    dm.skill.level1PhysDmg,
    'skill',
    { ele: 'physical' },
    ...pressureExtras
  ),
  dmg(
    'level2CryoDmg',
    info,
    'atk',
    dm.skill.level2CryoDmg,
    'skill',
    undefined,
    ...pressureExtras
  ),
  dmg(
    'level2PhysDmg',
    info,
    'atk',
    dm.skill.level2PhysDmg,
    'skill',
    { ele: 'physical' },
    ...pressureExtras
  ),
  dmg(
    'level3CryoDmg',
    info,
    'atk',
    dm.skill.level3CryoDmg,
    'skill',
    undefined,
    ...pressureExtras
  ),
  dmg(
    'level3PhysDmg',
    info,
    'atk',
    dm.skill.level3PhysDmg,
    'skill',
    { ele: 'physical' },
    ...pressureExtras
  ),
  dmg(
    'level4Dmg',
    info,
    'atk',
    dm.skill.level4Dmg,
    'skill',
    { ele: 'physical' },
    ...pressureExtras
  ),
  dmg('burst', info, 'atk', dm.burst.skillDmg, 'burst'),

  customParam('charged_stamina', dm.charged.stamina),
  customParam('charged_duration', dm.charged.duration),
  customParam('skill_cd', dm.skill.cd),
  customParam('skill_thornInterval', dm.skill.thornInterval),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
