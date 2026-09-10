import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, cmpNE, prod, sum } from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import {
  allBoolConditionals,
  allNumConditionals,
  customParam,
  hexereiTally,
  notOwnBuff,
  own,
  ownBuff,
  percent,
  register,
  target,
  team,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Mona'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = 0,
  s = 0,
  b = 0,
  sp = 0,
  p1 = 0,
  p2 = 0
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
    dmg: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    dot: skillParam_gen.skill[s++],
    dmg: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    bubbleDuration: skillParam_gen.burst[b++][0],
    dmg: skillParam_gen.burst[b++],
    dmgBonusNeg: skillParam_gen.burst[b++],
    omenDuration: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
    dmgBonus: skillParam_gen.burst[b++],
  },
  sprint: {
    active_stam: skillParam_gen?.sprint?.[sp++]?.[0],
    drain_stam: skillParam_gen?.sprint?.[sp++]?.[0],
  },
  passive1: {
    torrentDuration: skillParam_gen.passive1[p1++][0],
    phantomDuration: skillParam_gen.passive1[p1++][0],
    percentage: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    unknown: skillParam_gen.passive2[p2++][0],
    percentage: skillParam_gen.passive2[p2++][0],
  },
  lockedPassive: {
    duration: skillParam_gen.lockedPassive![0][0],
    maxStacks: skillParam_gen.lockedPassive![1][0],
    vaporize_dmg_: skillParam_gen.lockedPassive![2][0],
    omenExt: skillParam_gen.lockedPassive![3][0],
    maxExtTimes: skillParam_gen.lockedPassive![4][0],
    extCd: skillParam_gen.lockedPassive![5][0],
  },
  constellation1: {
    electrocharged_dmg_: skillParam_gen.constellation1[0],
    vaporize_dmg_: skillParam_gen.constellation1[1],
    hydro_swirl_dmg_: skillParam_gen.constellation1[2],
    frozenExtension: skillParam_gen.constellation1[3],
    unknown: skillParam_gen.constellation1[4],
    duration: skillParam_gen.constellation1[5],
    bonusEffect: skillParam_gen.constellation1[6],
    lunarcrystallize_dmg_: skillParam_gen.constellation1[7],
  },
  constellation2: {
    caChance: skillParam_gen.constellation2[0],
    unknown1: skillParam_gen.constellation2[1],
    extraCaDur: skillParam_gen.constellation2[2],
    extraCaCd: skillParam_gen.constellation2[3],
    eleMas: skillParam_gen.constellation2[4],
    eleMasDuration: skillParam_gen.constellation2[5],
  },
  constellation4: {
    critRateInc: Math.abs(skillParam_gen.constellation4[0]),
    hexCritDMG_: skillParam_gen.constellation4[1],
  },
  constellation6: {
    unknown: skillParam_gen.constellation6[0],
    dmgBonus: skillParam_gen.constellation6[1],
    maxDmgBonus: skillParam_gen.constellation6[2],
    duration: skillParam_gen.constellation6[3],
    addlCaMult: skillParam_gen.constellation6[4],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  char: { burst, ascension, constellation },
} = own
const { lockHomework, Omen, ProphecyOfSubmersion, lockC2Charged } =
  allBoolConditionals(info.key)
const { RhetoricsOfCalamitas } = allNumConditionals(info.key, true, 0, 3)
const { lockStacks } = allNumConditionals(
  info.key,
  true,
  0,
  dm.lockedPassive.maxStacks
)

const hex2 = cmpGE(team.common.hexerei, 2, 1)
const omen_dmg_ = Omen.ifOn(percent(talentSubscript(burst, dm.burst.dmgBonus)))
const c1_electrocharged_dmg_ = ProphecyOfSubmersion.ifOn(
  cmpGE(constellation, 1, percent(dm.constellation1.electrocharged_dmg_))
)
const c1_lunarcharged_dmg_ = ProphecyOfSubmersion.ifOn(
  cmpGE(constellation, 1, percent(dm.constellation1.electrocharged_dmg_))
)
const c1_swirl_dmg_ = ProphecyOfSubmersion.ifOn(
  cmpGE(constellation, 1, percent(dm.constellation1.hydro_swirl_dmg_))
)
const c1_vaporize_dmg_ = ProphecyOfSubmersion.ifOn(
  cmpGE(constellation, 1, percent(dm.constellation1.vaporize_dmg_))
)
const c1_lunarcrystallize_dmg_ = ProphecyOfSubmersion.ifOn(
  cmpGE(constellation, 1, percent(dm.constellation1.lunarcrystallize_dmg_))
)
const c4_critRate_ = Omen.ifOn(
  cmpGE(constellation, 4, percent(dm.constellation4.critRateInc))
)
const c6_charged_dmg_ = cmpGE(
  constellation,
  6,
  prod(RhetoricsOfCalamitas, percent(dm.constellation6.dmgBonus))
)
const a4_hydro_dmg_ = cmpGE(
  ascension,
  4,
  prod(own.premod.enerRech_.sheet('agg'), percent(dm.passive2.percentage))
)
const lockStacks_vaporize_dmg_ = lockHomework.ifOn(
  prod(hex2, percent(dm.lockedPassive.vaporize_dmg_), lockStacks)
)
const lockC1On = prod(lockHomework.ifOn(1), ProphecyOfSubmersion.ifOn(1))
const lockC1_electrocharged_dmg_ = cmpGE(
  constellation,
  1,
  prod(
    lockC1On,
    dm.constellation1.electrocharged_dmg_ * dm.constellation1.bonusEffect
  )
)
const lockC1_lunarcharged_dmg_ = cmpGE(
  constellation,
  1,
  prod(
    lockC1On,
    dm.constellation1.electrocharged_dmg_ * dm.constellation1.bonusEffect
  )
)
const lockC1_vaporize_dmg_ = cmpGE(
  constellation,
  1,
  prod(
    lockC1On,
    dm.constellation1.vaporize_dmg_ * dm.constellation1.bonusEffect
  )
)
const lockC1_swirl_dmg_ = cmpGE(
  constellation,
  1,
  prod(
    lockC1On,
    dm.constellation1.hydro_swirl_dmg_ * dm.constellation1.bonusEffect
  )
)
const lockC1_lunarcrystallize_dmg_ = cmpGE(
  constellation,
  1,
  prod(
    lockC1On,
    dm.constellation1.lunarcrystallize_dmg_ * dm.constellation1.bonusEffect
  )
)
const lockC2Charged_eleMas = lockHomework.ifOn(
  lockC2Charged.ifOn(cmpGE(constellation, 2, dm.constellation2.eleMas))
)
const lockC4OmenHex_critDMG_ = lockHomework.ifOn(
  Omen.ifOn(
    cmpGE(
      constellation,
      4,
      cmpGE(target.common.hexerei, 1, dm.constellation4.hexCritDMG_)
    )
  )
)
const lockC6Omen_charged_mult_ = sum(
  1,
  lockHomework.ifOn(
    Omen.ifOn(cmpGE(constellation, 6, percent(dm.constellation6.addlCaMult)))
  )
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  hexereiTally(lockHomework.ifOn(1)),
  // C3 Restless Revolution (burst); C5 Mockery of Fortuna (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.dmg_.charged.add(c6_charged_dmg_),
  ownBuff.premod.dmg_.hydro.add(a4_hydro_dmg_),
  teamBuff.premod.dmg_.add(omen_dmg_),
  teamBuff.premod.critRate_.add(c4_critRate_),
  teamBuff.premod.eleMas.add(lockC2Charged_eleMas),
  teamBuff.premod.critDMG_.add(lockC4OmenHex_critDMG_),
  teamBuff.premod.dmg_.electrocharged.add(
    sum(
      c1_electrocharged_dmg_,
      cmpNE(destIsActive, 0, 0, lockC1_electrocharged_dmg_)
    )
  ),
  teamBuff.premod.dmg_.lunarcharged.add(
    sum(
      c1_lunarcharged_dmg_,
      cmpNE(destIsActive, 0, 0, lockC1_lunarcharged_dmg_)
    )
  ),
  teamBuff.premod.dmg_.swirl.add(
    sum(c1_swirl_dmg_, cmpNE(destIsActive, 0, 0, lockC1_swirl_dmg_))
  ),
  teamBuff.premod.dmg_.vaporize.add(
    sum(c1_vaporize_dmg_, cmpNE(destIsActive, 0, 0, lockC1_vaporize_dmg_))
  ),
  teamBuff.premod.dmg_.lunarcrystallize.add(
    sum(
      c1_lunarcrystallize_dmg_,
      cmpNE(destIsActive, 0, 0, lockC1_lunarcrystallize_dmg_)
    )
  ),
  notOwnBuff.premod.dmg_.vaporize.add(lockStacks_vaporize_dmg_),

  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged', {
    baseMulti: lockC6Omen_charged_mult_,
  }),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill_dot', info, 'atk', dm.skill.dot, 'skill'),
  dmg('skill_dmg', info, 'atk', dm.skill.dmg, 'skill'),
  dmg('burst', info, 'atk', dm.burst.dmg, 'burst'),
  dmg('a1', info, 'atk', dm.skill.dmg, 'skill', {
    cond: cmpGE(ascension, 1, 'infer', ''),
    baseMulti: percent(dm.passive1.percentage),
  }),

  customParam('charged_stamina', dm.charged.stamina),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_bubbleDuration', dm.burst.bubbleDuration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost),
  customParam('sprint_active_stam', dm.sprint.active_stam),
  customParam('sprint_drain_stam', dm.sprint.drain_stam)
)
