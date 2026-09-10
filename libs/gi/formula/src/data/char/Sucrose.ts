import { absorbableEle, type CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpEq, cmpGE, prod, sum } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allListConditionals,
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
import { dataGenToCharInfo, dmg, entriesForChar } from './util'

const key: CharacterKey = 'Sucrose'
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
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3
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
    press: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dot: skillParam_gen.burst[b++],
    dmg_: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    eleMas: skillParam_gen.passive1[p1++][0],
    duration: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    eleMas_: skillParam_gen.passive2[p2++][0],
    duration: skillParam_gen.passive2[p2++][0],
  },
  lockedPassive: {
    smallDuration: skillParam_gen.lockedPassive![0][0],
    small_dmg_: skillParam_gen.lockedPassive![1][0],
    largeDuration: skillParam_gen.lockedPassive![2][0],
    large_dmg_: skillParam_gen.lockedPassive![3][0],
  },
  constellation2: {
    durationInc: skillParam_gen.constellation2[0],
  },
  constellation6: {
    ele_dmg_: skillParam_gen.constellation6[0],
    hex_dmg_: skillParam_gen.constellation6[1],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  char: { constellation, ascension },
} = own
// WR cond(key, 'lockHomework' | 'skillHit' | 'lockAfterSkill' | 'lockAfterBurst' | swirl{ele})
const {
  lockHomework,
  skillHit,
  lockAfterSkill,
  lockAfterBurst,
  swirlpyro,
  swirlhydro,
  swirlelectro,
  swirlcryo,
} = allBoolConditionals(info.key)
const { absorption } = allListConditionals(info.key, [...absorbableEle])

const swirlByEle = {
  pyro: swirlpyro,
  hydro: swirlhydro,
  electro: swirlelectro,
  cryo: swirlcryo,
} as const

const hex2 = cmpGE(team.common.hexerei, 2, 1)
const lockMove_dmg_ = prod(
  hex2,
  lockHomework.ifOn(
    sum(
      lockAfterSkill.ifOn(percent(dm.lockedPassive.small_dmg_)),
      lockAfterBurst.ifOn(percent(dm.lockedPassive.large_dmg_))
    )
  )
)
const c6EleDmg_ = cmpGE(
  constellation,
  6,
  sum(
    percent(dm.constellation6.ele_dmg_),
    lockHomework.ifOn(
      cmpGE(target.common.hexerei, 1, percent(dm.constellation6.hex_dmg_))
    )
  )
)
// WR total.eleMas from premod.eleMas. Read premod.eleMas@agg so teamBuff cannot cycle.
const a4_eleMas = skillHit.ifOn(
  cmpGE(
    ascension,
    4,
    prod(percent(dm.passive2.eleMas_), own.premod.eleMas.sheet('agg'))
  )
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // WR flags.isHexerei
  hexereiTally(lockHomework.ifOn(1)),
  // C3 Wind Spirit Creation (skill); C5 Forbidden Creation - Isomer 75 / Type II (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  // WR A1: dest ≠ Sucrose AND dest.ele matches swirled ele
  absorbableEle.map((ele) =>
    notOwnBuff.premod.eleMas.add(
      swirlByEle[ele].ifOn(
        cmpGE(ascension, 1, cmpEq(target.char.ele, ele, dm.passive1.eleMas))
      )
    )
  ),
  // WR A4: dest ≠ Sucrose
  notOwnBuff.final.eleMas.add(a4_eleMas),
  teamBuff.premod.dmg_.normal.add(lockMove_dmg_),
  teamBuff.premod.dmg_.charged.add(lockMove_dmg_),
  teamBuff.premod.dmg_.plunging.add(lockMove_dmg_),
  teamBuff.premod.dmg_.skill.add(lockMove_dmg_),
  teamBuff.premod.dmg_.burst.add(lockMove_dmg_),
  absorbableEle.map((ele) =>
    teamBuff.premod.dmg_[ele].add(
      prod(
        absorption.map({
          pyro: ele === 'pyro' ? 1 : 0,
          hydro: ele === 'hydro' ? 1 : 0,
          electro: ele === 'electro' ? 1 : 0,
          cryo: ele === 'cryo' ? 1 : 0,
        }),
        c6EleDmg_
      )
    )
  ),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill', info, 'atk', dm.skill.press, 'skill'),
  dmg('burst_dot', info, 'atk', dm.burst.dot, 'burst'),
  absorbableEle.flatMap((ele) =>
    dmg(`burst_${ele}`, info, 'atk', dm.burst.dmg_, 'burst', { ele })
  ),
  customParam('a4_eleMas', a4_eleMas),

  customParam('charged_stamina', dm.charged.stamina),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
