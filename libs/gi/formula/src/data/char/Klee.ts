import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  cmpGE,
  cmpNE,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import {
  allBoolConditionals,
  allNumConditionals,
  customDmg,
  customParam,
  enemyDebuff,
  hexereiTally,
  notOwnBuff,
  own,
  ownBuff,
  percent,
  register,
  team,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar } from './util'

const key: CharacterKey = 'Klee'
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
    jumptyDumptyDmg1: skillParam_gen.skill[s++],
    jumptyDumptyDmg2: skillParam_gen.skill[s++],
    jumptyDumptyDmg3: skillParam_gen.skill[s++],
    mineDmg: skillParam_gen.skill[s++],
    mineDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
    unknown: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
  },
  passive1: {
    charged_dmg_: 0.5,
  },
  lockedPassive: {
    duration: skillParam_gen.lockedPassive![0][0],
    mult: [
      skillParam_gen.lockedPassive![1][0],
      skillParam_gen.lockedPassive![2][0],
      skillParam_gen.lockedPassive![3][0],
    ],
    idk2: skillParam_gen.lockedPassive![4][0],
  },
  constellation1: {
    dmg_: 1.2,
    duration: skillParam_gen.constellation1[0],
    atk_: skillParam_gen.constellation1[1],
  },
  constellation2: {
    enemyDefRed_: 0.23,
  },
  constellation4: {
    dmg: 5.55,
    dmg_: skillParam_gen.constellation4[0],
  },
  constellation6: {
    team_pyro_dmg_: 0.1,
    self_pyro_dmg_: skillParam_gen.constellation6[0],
    chance1: skillParam_gen.constellation6[1],
    chance2: skillParam_gen.constellation6[2],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { ascension, constellation },
} = own
const { lockHomework, ExplosiveFrags, BlazingDelight, lockC1 } =
  allBoolConditionals(info.key)
const { lockBadge } = allNumConditionals(info.key, true, 0, 3)

const hex2 = cmpGE(team.common.hexerei, 2, 1)
const lockBadge_mult_ = sum(
  1,
  lockHomework.ifOn(
    prod(
      hex2,
      cmpGE(
        lockBadge,
        1,
        percent(subscript(sum(lockBadge, -1), [...dm.lockedPassive.mult]))
      )
    )
  )
)
const lockC1_atk_ = lockHomework.ifOn(
  lockC1.ifOn(cmpGE(constellation, 1, dm.constellation1.atk_))
)
const c2_defRed_ = ExplosiveFrags.ifOn(
  cmpGE(constellation, 2, percent(dm.constellation2.enemyDefRed_))
)
const c6Team_pyro_dmg_ = BlazingDelight.ifOn(
  cmpGE(constellation, 6, percent(dm.constellation6.team_pyro_dmg_))
)
const lockC6_pyro_dmg_ = lockHomework.ifOn(
  BlazingDelight.ifOn(cmpGE(constellation, 6, dm.constellation6.self_pyro_dmg_))
)
const lockC4_dmg_ = lockHomework.ifOn(
  cmpGE(constellation, 4, cmpNE(destIsActive, 0, dm.constellation4.dmg_))
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  hexereiTally(lockHomework.ifOn(1)),
  // C3 Exquisite Compound (skill); C5 Nova Burst (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.atk_.add(lockC1_atk_),
  ownBuff.premod.dmg_.pyro.add(lockC6_pyro_dmg_),
  enemyDebuff.common.defRed_.add(c2_defRed_),
  // WR C6 team pyro: homework off → everyone; homework on → dest ≠ Klee
  teamBuff.premod.dmg_.pyro.add(lockHomework.ifOff(c6Team_pyro_dmg_)),
  notOwnBuff.premod.dmg_.pyro.add(lockHomework.ifOn(c6Team_pyro_dmg_)),

  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('jumptyDumptyDmg', info, 'atk', dm.skill.jumptyDumptyDmg1, 'skill'),
  dmg('mineDmg', info, 'atk', dm.skill.mineDmg, 'skill'),
  dmg('burst', info, 'atk', dm.burst.dmg, 'burst'),
  dmg(
    'a1_charged',
    info,
    'atk',
    dm.charged.dmg,
    'charged',
    {
      cond: cmpGE(ascension, 1, 'infer', ''),
      baseMulti: lockBadge_mult_,
    },
    ownBuff.premod.dmg_.charged.add(percent(dm.passive1.charged_dmg_))
  ),
  dmg('c1', info, 'atk', dm.burst.dmg, 'burst', {
    cond: cmpGE(constellation, 1, 'infer', ''),
    baseMulti: percent(dm.constellation1.dmg_),
  }),
  customDmg(
    'c4',
    'pyro',
    'elemental',
    prod(percent(dm.constellation4.dmg), final.atk),
    { cond: cmpGE(constellation, 4, 'infer', '') },
    ownBuff.premod.dmg_.pyro.add(lockC4_dmg_)
  ),

  customParam('charged_stamina', dm.charged.stamina),
  customParam('skill_mineDuration', dm.skill.mineDuration),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost),
  customParam('burst_duration', dm.burst.duration)
)
