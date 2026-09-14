import { absorbableEle, type CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  cmpEq,
  cmpGE,
  cmpNE,
  max,
  min,
  prod,
  sum,
} from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import {
  allBoolConditionals,
  allListConditionals,
  allNumConditionals,
  customDmg,
  customParam,
  hexereiTally,
  notOwnBuff,
  own,
  ownBuff,
  percent,
  register,
  target,
  team,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar } from './util'

const key: CharacterKey = 'Prune'
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
    stam: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    ringDmg: skillParam_gen.skill[s++],
    clangDmg: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    bellDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    dmg: skillParam_gen.passive1[0][0],
  },
  passive2: {
    dmg_: skillParam_gen.passive2[0][0],
    duration: skillParam_gen.passive2[1][0],
    maxDmg_: skillParam_gen.passive2[2][0],
    atkThresh: skillParam_gen.passive2[3][0],
  },
  lockedPassive: {
    selfAtk_: skillParam_gen.lockedPassive![0][0],
    selfDuration: skillParam_gen.lockedPassive![1][0],
    teamAtk_: skillParam_gen.lockedPassive![2][0],
    teamDuration: skillParam_gen.lockedPassive![3][0],
  },
  constellation1: {
    energyRegen: skillParam_gen.constellation1[0],
  },
  constellation2: {
    atk_: skillParam_gen.constellation2[0],
    moreAtk_: skillParam_gen.constellation2[1],
    maxAtk_: skillParam_gen.constellation2[2],
  },
  constellation4: {
    dmg: skillParam_gen.constellation4[0],
  },
  constellation6: {
    durationInc: skillParam_gen.constellation6[0],
    atk: skillParam_gen.constellation6[1],
    duration: skillParam_gen.constellation6[2],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { ascension, constellation },
} = own
const { hexerei } = team.common
// WR cond(key, 'lockHomework' | 'a4Rally' | 'c6RallyReaction') `'on'`
const { lockHomework, a4Rally, c6RallyReaction } = allBoolConditionals(info.key)
const { c2Stack } = allNumConditionals(info.key, true, 0, 6)
// WR cond(key, 'lockRallyReaction') state `'swirl'`
const { lockRallyReaction } = allListConditionals(info.key, ['swirl'])
const lockRallyReactionOn = lockRallyReaction.map({ swirl: 1 })
const hex2 = cmpGE(hexerei, 2, 1)

const a4Rally_dmg_ = a4Rally.ifOn(
  cmpGE(
    ascension,
    4,
    max(
      min(
        prod(
          percent(dm.passive2.dmg_),
          sum(own.premod.atk.sheet('agg'), -dm.passive2.atkThresh)
        ),
        percent(dm.passive2.maxDmg_)
      ),
      0
    )
  )
)
const c2StackAtk_ = cmpGE(
  constellation,
  2,
  sum(
    percent(dm.constellation2.atk_),
    prod(percent(dm.constellation2.moreAtk_), c2Stack)
  )
)
const lockRallyReaction_selfAtk_ = prod(
  hex2,
  lockHomework.ifOn(1),
  cmpGE(ascension, 4, 1),
  lockRallyReactionOn,
  percent(dm.lockedPassive.selfAtk_)
)
const lockRallyReaction_teamAtk_ = prod(
  hex2,
  lockHomework.ifOn(1),
  cmpGE(ascension, 4, 1),
  lockRallyReactionOn,
  cmpGE(target.common.hexerei, 1, 1),
  cmpEq(target.char.ele, 'anemo', 1),
  percent(dm.lockedPassive.teamAtk_)
)
const c6RallyReaction_atk = c6RallyReaction.ifOn(
  cmpGE(constellation, 6, cmpGE(ascension, 4, dm.constellation6.atk))
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // WR flags.isHexerei
  hexereiTally(lockHomework.ifOn(1)),
  // C3 The Bell Tolls! The Hunt Is On! (burst); C5 Ring-A-Ding-Ding! Hexhunter Chime (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.atk_.add(c2StackAtk_),
  ownBuff.premod.atk_.add(lockRallyReaction_selfAtk_),
  // WR teamBuff dest anemo + hexerei, dest ≠ Prune
  notOwnBuff.premod.atk_.add(lockRallyReaction_teamAtk_),
  // WR teamBuff.premod.atk: self or dest is active
  ownBuff.premod.atk.add(c6RallyReaction_atk),
  notOwnBuff.premod.atk.add(cmpNE(destIsActive, 0, c6RallyReaction_atk)),
  // WR A4 Tolling Rally: dest ≠ Prune
  notOwnBuff.premod.dmg_.normal.add(a4Rally_dmg_),
  notOwnBuff.premod.dmg_.charged.add(a4Rally_dmg_),
  notOwnBuff.premod.dmg_.plunging.add(a4Rally_dmg_),
  notOwnBuff.premod.dmg_.skill.add(a4Rally_dmg_),
  notOwnBuff.premod.dmg_.burst.add(a4Rally_dmg_),

  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill_ring', info, 'atk', dm.skill.ringDmg, 'skill'),
  absorbableEle.flatMap((ele) =>
    dmg(`skill_clang_${ele}`, info, 'atk', dm.skill.clangDmg, 'skill', { ele })
  ),
  dmg('burst', info, 'atk', dm.burst.skillDmg, 'burst'),
  dmg('burst_bell', info, 'atk', dm.burst.bellDmg, 'burst'),
  absorbableEle.flatMap((ele) =>
    customDmg(
      `a1_${ele}`,
      ele,
      'burst',
      prod(percent(dm.passive1.dmg), final.atk),
      { cond: cmpGE(ascension, 1, 'infer', '') }
    )
  ),
  absorbableEle.flatMap((ele) =>
    customDmg(
      `c4_${ele}`,
      ele,
      'burst',
      prod(percent(dm.constellation4.dmg), final.atk),
      { cond: cmpGE(constellation, 4, 'infer', '') }
    )
  ),
  customParam('a4Rally_dmg_', a4Rally_dmg_),

  customParam('charged_stam', dm.charged.stam),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
