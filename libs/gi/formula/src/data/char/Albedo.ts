import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, min, prod, sum } from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import {
  allBoolConditionals,
  allListConditionals,
  customDmg,
  customParam,
  hexereiTally,
  own,
  ownBuff,
  percent,
  register,
  target,
  team,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar } from './util'

const key: CharacterKey = 'Albedo'
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
      skillParam_gen.auto[a++],
    ],
  },
  charged: {
    dmg1: skillParam_gen.auto[a++],
    dmg2: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    skillDmg: skillParam_gen.skill[s++],
    blossomDmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
    blossomCd: 2,
  },
  burst: {
    burstDmg: skillParam_gen.burst[b++],
    blossomDmg: skillParam_gen.burst[b++],
    blossomAmt: 7,
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    hpThresh: skillParam_gen.passive1[0][0] * 100,
    blossomDmg_: skillParam_gen.passive1[1][0],
    isotomaDmgInc: skillParam_gen.passive1[2][0],
  },
  passive2: {
    eleMasInc: skillParam_gen.passive2[0][0],
    duration: skillParam_gen.passive2[1][0],
  },
  lockedPassive: {
    teamDmg_: skillParam_gen.lockedPassive![0][0],
    maxTeamDmg_: skillParam_gen.lockedPassive![1][0],
    hexDmg_: skillParam_gen.lockedPassive![2][0],
    maxHexDmg_: skillParam_gen.lockedPassive![3][0],
    teamDuration: skillParam_gen.lockedPassive![4][0],
    hexDuration: skillParam_gen.lockedPassive![5][0],
  },
  constellation1: {
    blossomEner: skillParam_gen.constellation1[0],
    def_: skillParam_gen.constellation1[1],
    duration: skillParam_gen.constellation1[2],
  },
  constellation2: {
    blossomDmgInc: skillParam_gen.constellation2[0],
    maxStacks: 4,
    stackDuration: 30,
    dmg: skillParam_gen.constellation2[1],
    eleMas: 125,
    eleMasDuration: 10,
  },
  constellation4: {
    plunging_dmg_: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
    plunging_impact_dmg_: skillParam_gen.constellation4[2],
  },
  constellation6: {
    bonus_dmg_: 0.17,
    duration: skillParam_gen.constellation6[0],
    dmgInc: skillParam_gen.constellation6[1],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { ascension, constellation },
} = own
const {
  lockHomework,
  lockCreateSolar,
  lockCreateSilver,
  a1LockSilver,
  c1LockAfterSkill,
  c4LockAfterJump,
  c6LockAfterDestroy,
} = allBoolConditionals(info.key)
const { burstUsed } = allListConditionals(info.key, ['burstUsed'])
const { p1EnemyHp } = allListConditionals(info.key, ['belowHp'])
const { c2Stacks } = allListConditionals(info.key, ['1', '2', '3', '4'])
const { skillInField } = allListConditionals(info.key, ['skillInField'])
const { c6Crystallize } = allListConditionals(info.key, ['c6Crystallize'])

const hex2 = cmpGE(team.common.hexerei, 2, 1)
const p2_eleMas = cmpGE(
  ascension,
  4,
  burstUsed.map({ burstUsed: dm.passive2.eleMasInc })
)
const p1_blossom_dmg_ = cmpGE(
  ascension,
  1,
  percent(p1EnemyHp.map({ belowHp: dm.passive1.blossomDmg_ }))
)
const c2StackVal = c2Stacks.map({ '1': 1, '2': 2, '3': 3, '4': 4 })
const c2_burst_dmgInc = cmpGE(
  constellation,
  2,
  prod(c2StackVal, percent(dm.constellation2.blossomDmgInc), final.def)
)
const inField = skillInField.map({ skillInField: 1 })
const c4_plunging_dmg_ = prod(
  destIsActive,
  cmpGE(constellation, 4, prod(inField, dm.constellation4.plunging_dmg_))
)
const c6_all_dmg_ = prod(
  destIsActive,
  cmpGE(
    constellation,
    6,
    prod(
      inField,
      c6Crystallize.map({ c6Crystallize: dm.constellation6.bonus_dmg_ })
    )
  )
)
const solar_dmg_ = lockCreateSolar.ifOn(
  lockHomework.ifOn(
    prod(
      hex2,
      min(
        prod(percent(dm.lockedPassive.teamDmg_), final.def, 1 / 1000),
        percent(dm.lockedPassive.maxTeamDmg_)
      )
    )
  )
)
const silver_dmg_ = lockCreateSilver.ifOn(
  lockHomework.ifOn(
    prod(
      hex2,
      cmpGE(target.common.hexerei, 1, 1),
      min(
        prod(percent(dm.lockedPassive.hexDmg_), final.def, 1 / 1000),
        percent(dm.lockedPassive.maxHexDmg_)
      )
    )
  )
)
const a1_blossom_dmgInc = a1LockSilver.ifOn(
  lockHomework.ifOn(
    prod(
      hex2,
      cmpGE(ascension, 1, prod(percent(dm.passive1.isotomaDmgInc), final.def))
    )
  )
)
const c1_def_ = c1LockAfterSkill.ifOn(
  lockHomework.ifOn(cmpGE(constellation, 1, dm.constellation1.def_))
)
const c2_eleMas = lockHomework.ifOn(
  cmpGE(
    constellation,
    2,
    cmpGE(ascension, 4, c2Stacks.map({ '4': dm.constellation2.eleMas }))
  )
)
const c4_impact_dmg_ = prod(
  destIsActive,
  c4LockAfterJump.ifOn(
    lockHomework.ifOn(
      cmpGE(constellation, 4, dm.constellation4.plunging_impact_dmg_)
    )
  )
)
const c6_fatal_dmgInc = c6LockAfterDestroy.ifOn(
  lockHomework.ifOn(
    cmpGE(constellation, 6, prod(percent(dm.constellation6.dmgInc), final.def))
  )
)
const moveDmg_ = sum(solar_dmg_, silver_dmg_)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  hexereiTally(lockHomework.ifOn(1)),
  // C3 Grace of Helios (skill); C5 Tide of Hadean Bloom (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.def_.add(c1_def_),
  ownBuff.formula.base.burst.add(c2_burst_dmgInc),
  teamBuff.premod.eleMas.add(sum(p2_eleMas, c2_eleMas)),
  teamBuff.premod.dmg_.normal.add(moveDmg_),
  teamBuff.premod.dmg_.charged.add(moveDmg_),
  teamBuff.premod.dmg_.plunging.add(sum(moveDmg_, c4_plunging_dmg_)),
  teamBuff.premod.dmg_.skill.add(moveDmg_),
  teamBuff.premod.dmg_.burst.add(moveDmg_),
  teamBuff.premod.dmg_.add(c6_all_dmg_),

  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_1', info, 'atk', dm.charged.dmg1, 'charged'),
  dmg('charged_2', info, 'atk', dm.charged.dmg2, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill', info, 'atk', dm.skill.skillDmg, 'skill'),
  dmg(
    'skill_blossom',
    info,
    'def',
    dm.skill.blossomDmg,
    'skill',
    undefined,
    ownBuff.premod.dmg_.skill.add(p1_blossom_dmg_),
    ownBuff.formula.base.skill.add(a1_blossom_dmgInc)
  ),
  dmg('burst', info, 'atk', dm.burst.burstDmg, 'burst'),
  dmg(
    'burst_blossom',
    info,
    'atk',
    dm.burst.blossomDmg,
    'burst',
    undefined,
    ownBuff.formula.base.burst.add(c6_fatal_dmgInc)
  ),
  customDmg(
    'c2',
    info.ele,
    'burst',
    prod(percent(dm.constellation2.dmg), final.def),
    {
      cond: cmpGE(
        constellation,
        2,
        cmpGE(lockHomework.ifOn(1), 1, 'infer', ''),
        ''
      ),
    }
  ),

  customParam('c4_plunging_impact_dmg_', c4_impact_dmg_),

  customParam('charged_stamina', dm.charged.stamina),
  customParam('skill_duration', dm.skill.duration),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
