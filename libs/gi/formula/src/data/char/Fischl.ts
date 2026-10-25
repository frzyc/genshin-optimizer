import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, cmpNE, prod, sum } from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import {
  allBoolConditionals,
  customDmg,
  customHeal,
  hexereiTally,
  notOwnBuff,
  own,
  ownBuff,
  percent,
  register,
  team,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Fischl'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = 0,
  s = 0,
  b = 0,
  p1 = 0,
  p2 = 0
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
    aimed: skillParam_gen.auto[a++],
    aimedCharged: skillParam_gen.auto[a++],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    ozDmg: skillParam_gen.skill[s++],
    summonDmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    dmg: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    dmg: skillParam_gen.passive2[p2++][0],
  },
  lockedPassive: {
    atk_duration: skillParam_gen.lockedPassive![0][0],
    atk_: skillParam_gen.lockedPassive![1][0],
    eleMasDuration: skillParam_gen.lockedPassive![2][0],
    eleMas: skillParam_gen.lockedPassive![3][0],
  },
  constellation1: {
    dmg: skillParam_gen.constellation1[0],
  },
  constellation2: {
    dmg: skillParam_gen.constellation2[0],
  },
  constellation4: {
    dmg: skillParam_gen.constellation4[0],
    regen: skillParam_gen.constellation4[1],
  },
  constellation6: {
    dmg: skillParam_gen.constellation6[0],
    duration: skillParam_gen.constellation6[1],
    lockIncrease_: skillParam_gen.constellation6[2],
    lockDuration: skillParam_gen.constellation6[3],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill, ascension, constellation },
} = own
// WR cond(key, 'lockHomework' | 'lockC6Oz' | 'lockOverload' | 'lockEcLc')
const { lockHomework, lockC6Oz, lockOverload, lockEcLc } = allBoolConditionals(
  info.key
)

const hexereiRite = cmpGE(team.common.hexerei, 2, lockHomework.ifOn(1))
const lockC6OzMulti = lockC6Oz.ifOn(2, 1)
const lockOverloadAtk_ = lockOverload.ifOn(
  prod(hexereiRite, lockC6OzMulti, percent(dm.lockedPassive.atk_))
)
const lockEcLcEleMas = lockEcLc.ifOn(
  prod(hexereiRite, lockC6OzMulti, dm.lockedPassive.eleMas)
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // WR flags.isHexerei
  hexereiTally(lockHomework.ifOn(1)),
  // C3 Nightrider (skill); C5 Midnight Phantasmagoria (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.atk_.add(lockOverloadAtk_),
  // WR lockOverload_atk_active: dest is on-field AND dest !== Fischl
  notOwnBuff.premod.atk_.add(cmpNE(destIsActive, 0, lockOverloadAtk_)),
  ownBuff.premod.eleMas.add(lockEcLcEleMas),
  notOwnBuff.premod.eleMas.add(cmpNE(destIsActive, 0, lockEcLcEleMas)),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_aimed', info, 'atk', dm.charged.aimed, 'charged', {
    ele: 'physical',
  }),
  dmg('charged_aimedCharged', info, 'atk', dm.charged.aimedCharged, 'charged', {
    ele: 'electro',
  }),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill_oz', info, 'atk', dm.skill.ozDmg, 'skill'),
  customDmg(
    'skill_summon',
    info.ele,
    'skill',
    prod(
      sum(
        percent(talentSubscript(skill, dm.skill.summonDmg)),
        cmpGE(constellation, 2, percent(dm.constellation2.dmg))
      ),
      final.atk
    )
  ),
  dmg('burst', info, 'atk', dm.burst.dmg, 'burst'),
  dmg('a1_aimedChargedOz', info, 'atk', dm.charged.aimedCharged, 'charged', {
    ele: 'electro',
    baseMulti: percent(dm.passive1.dmg),
    cond: cmpGE(ascension, 1, 'infer', ''),
  }),
  customDmg(
    'a4',
    info.ele,
    'skill',
    prod(percent(dm.passive2.dmg), final.atk),
    { cond: cmpGE(ascension, 4, 'infer', '') }
  ),
  customDmg(
    'c1',
    'physical',
    'normal',
    prod(percent(dm.constellation1.dmg), final.atk),
    { cond: cmpGE(constellation, 1, 'infer', '') }
  ),
  customDmg(
    'c4',
    info.ele,
    'burst',
    prod(percent(dm.constellation4.dmg), final.atk),
    { cond: cmpGE(constellation, 4, 'infer', '') }
  ),
  customHeal('c4_heal', prod(percent(dm.constellation4.regen), final.hp), {
    cond: cmpGE(constellation, 4, 'infer', ''),
  }),
  customDmg(
    'c6_oz',
    info.ele,
    'skill',
    prod(percent(dm.constellation6.dmg), final.atk),
    { cond: cmpGE(constellation, 6, 'infer', '') }
  )
)
