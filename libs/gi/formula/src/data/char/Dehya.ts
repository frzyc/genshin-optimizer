import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allNumConditionals,
  customHeal,
  customParam,
  own,
  ownBuff,
  percent,
  register,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, splitScaleDmg } from './util'

const key: CharacterKey = 'Dehya'
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
      skillParam_gen.auto[a++], // 4
    ],
  },
  charged: {
    spin: skillParam_gen.auto[a++],
    final: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
    duration: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    indomitableDmg: skillParam_gen.skill[s++],
    rangingDmg: skillParam_gen.skill[s++],
    fieldDmgAtk: skillParam_gen.skill[s++],
    fieldDmgHp: skillParam_gen.skill[s++],
    mitigation: skillParam_gen.skill[s++],
    redmaneMax: skillParam_gen.skill[s++][0],
    fieldDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    fistDmgAtk: skillParam_gen.burst[b++],
    fistDmgHp: skillParam_gen.burst[b++],
    driveDmgAtk: skillParam_gen.burst[b++],
    driveDmgHp: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive2: {
    hpThreshold: skillParam_gen.passive2[0][0],
    initialHeal: skillParam_gen.passive2[1][0],
    dotHeal: skillParam_gen.passive2[2][0],
    dotInterval: skillParam_gen.passive2[3][0],
    duration: skillParam_gen.passive2[4][0],
    cd: skillParam_gen.passive2[5][0],
  },
  c1: {
    hp_: skillParam_gen.constellation1[0],
    skill_dmgInc: skillParam_gen.constellation1[1],
    burst_dmgInc: skillParam_gen.constellation1[2],
  },
  c2: {
    fieldDurationIncrease: skillParam_gen.constellation2[0],
    field_dmg_: skillParam_gen.constellation2[1],
  },
  c4: {
    energyRestore: skillParam_gen.constellation4[0],
    heal: skillParam_gen.constellation4[1],
    cd: skillParam_gen.constellation4[2],
  },
  c6: {
    burst_critRate_: skillParam_gen.constellation6[0],
    burst_critDMG_: skillParam_gen.constellation6[1],
    duration: skillParam_gen.constellation6[2],
    maxDuration: skillParam_gen.constellation6[3],
    maxBurst_critDMG_: skillParam_gen.constellation6[4],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { ascension, constellation },
} = own
const { c2InField } = allBoolConditionals(info.key)
const { c6CritStacks } = allNumConditionals(info.key, true, 0, 4)

const c1_hp_ = cmpGE(constellation, 1, dm.c1.hp_)
const c1_skill_dmgInc = cmpGE(
  constellation,
  1,
  prod(percent(dm.c1.skill_dmgInc), own.premod.hp.sheet('agg'))
)
const c1_burst_dmgInc = cmpGE(
  constellation,
  1,
  prod(percent(dm.c1.burst_dmgInc), own.premod.hp.sheet('agg'))
)
const c2InField_field_dmg_ = c2InField.ifOn(
  cmpGE(constellation, 2, dm.c2.field_dmg_)
)
const c6_burst_critRate_ = cmpGE(constellation, 6, dm.c6.burst_critRate_)
const c6CritStacks_burst_critDMG_ = cmpGE(
  constellation,
  6,
  prod(c6CritStacks, percent(dm.c6.burst_critDMG_))
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Stoking High (burst); C5 Molten Inferno (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.hp_.add(c1_hp_),
  ownBuff.formula.base.skill.add(c1_skill_dmgInc),
  ownBuff.formula.base.burst.add(c1_burst_dmgInc),
  ownBuff.premod.critRate_.burst.add(c6_burst_critRate_),
  ownBuff.premod.critDMG_.burst.add(c6CritStacks_burst_critDMG_),

  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_spin', info, 'atk', dm.charged.spin, 'charged'),
  dmg('charged_final', info, 'atk', dm.charged.final, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill_indomitable', info, 'atk', dm.skill.indomitableDmg, 'skill'),
  dmg('skill_ranging', info, 'atk', dm.skill.rangingDmg, 'skill'),
  splitScaleDmg(
    'skill_field',
    info,
    ['atk', 'hp'],
    [dm.skill.fieldDmgAtk, dm.skill.fieldDmgHp],
    'skill',
    undefined,
    ownBuff.premod.dmg_.skill.add(c2InField_field_dmg_)
  ),
  customParam('skill_redmaneMax', prod(percent(dm.skill.redmaneMax), final.hp)),
  splitScaleDmg(
    'burst_fist',
    info,
    ['atk', 'hp'],
    [dm.burst.fistDmgAtk, dm.burst.fistDmgHp],
    'burst'
  ),
  splitScaleDmg(
    'burst_drive',
    info,
    ['atk', 'hp'],
    [dm.burst.driveDmgAtk, dm.burst.driveDmgHp],
    'burst'
  ),
  customHeal(
    'a4_initialHeal',
    prod(percent(dm.passive2.initialHeal), final.hp),
    { cond: cmpGE(ascension, 4, 'infer', '') }
  ),
  customHeal('a4_dotHeal', prod(percent(dm.passive2.dotHeal), final.hp), {
    cond: cmpGE(ascension, 4, 'infer', ''),
  }),
  customHeal('c4_heal', prod(percent(dm.c4.heal), final.hp), {
    cond: cmpGE(constellation, 4, 'infer', ''),
  }),

  customParam('charged_stamina', dm.charged.stamina),
  customParam('charged_duration', dm.charged.duration),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
