import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod, sum } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allListConditionals,
  customDmg,
  customParam,
  hexereiTally,
  notOwnBuff,
  own,
  ownBuff,
  percent,
  register,
  team,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Lohen'
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
      skillParam_gen.auto[++a], // 3x3
      skillParam_gen.auto[++a], // 4
      skillParam_gen.auto[++a], // 5.1
      skillParam_gen.auto[++a], // 5.2
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[++a], // x2
    stam: skillParam_gen.auto[++a][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[++a],
    low: skillParam_gen.auto[++a],
    high: skillParam_gen.auto[++a],
  },
  skill: {
    hitArr: [
      skillParam_gen.skill[s++], // 1
      skillParam_gen.skill[s++], // 2
      skillParam_gen.skill[s++], // 3x3
      skillParam_gen.skill[s++], // 4
      skillParam_gen.skill[s++], // 5.1
      skillParam_gen.skill[s++], // 5.2
    ],
    ca: skillParam_gen.skill[s++],
    castam: skillParam_gen.skill[s++][0],
    plunging: {
      dmg: skillParam_gen.skill[s++],
      low: skillParam_gen.skill[s++],
      high: skillParam_gen.skill[s++],
    },
    msDuration: skillParam_gen.skill[s++][0],
    joyGain1: skillParam_gen.skill[s++][0],
    joyGain2: skillParam_gen.skill[s++][0],
    baseAtkThresh: skillParam_gen.skill[s++][0],
    willGain: skillParam_gen.skill[s++][0],
    etchDmg: skillParam_gen.skill[s++],
    willEtchMult: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
    maxWill: 100,
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    willDmgMult: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    dmgLimit: skillParam_gen.passive1[0][0],
    willGain: skillParam_gen.passive1[1][0],
  },
  passive2: {
    teammateAtk_: skillParam_gen.passive2[0][0],
    selfAtk_: skillParam_gen.passive2[1][0],
    duration: skillParam_gen.passive2[2][0],
  },
  passive3: {
    duration: skillParam_gen.passive3![0][0],
    durationInc: skillParam_gen.passive3![1][0],
    cd: skillParam_gen.passive3![2][0],
  },
  lockedPassive: {
    willThresh: skillParam_gen.lockedPassive![0][0],
    normalCharged_dmg_: skillParam_gen.lockedPassive![1][0],
    duration: skillParam_gen.lockedPassive![2][0],
  },
  constellation1: {
    addlWillGain: skillParam_gen.constellation1[0],
    addlWillLimit: skillParam_gen.constellation1[1],
  },
  constellation2: {
    dmg: skillParam_gen.constellation2[0],
    eleMas: skillParam_gen.constellation2[1],
    duration: skillParam_gen.constellation2[2],
    cd: skillParam_gen.constellation2[3],
  },
  constellation4: {
    energyRegen1: skillParam_gen.constellation4[0],
    energyRegen2: skillParam_gen.constellation4[1],
  },
  constellation6: {
    cd: skillParam_gen.constellation6[0],
    critDmg_: skillParam_gen.constellation6[1],
  },
} as const

const willConsumedArr = range(
  20,
  dm.skill.maxWill * (1 + dm.constellation1.addlWillLimit),
  20
).map(String)

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill, ascension, constellation },
} = own
const {
  lockHomework,
  a4MasterCryo,
  a0HighSpirits,
  lockBuff,
  c2Blade,
  c6BurstMaster,
} = allBoolConditionals(info.key)
// WR lookup(cond(key, 'willConsumed'), 20..100 / C1 20..300 by 20)
const { willConsumed } = allListConditionals(info.key, [...willConsumedArr])

const willConsumedVal = willConsumed.map(
  objKeyMap(willConsumedArr, (will) => {
    const n = Number(will)
    return n <= dm.skill.maxWill ? n : cmpGE(constellation, 1, n)
  })
)
const willConsumed_etch_mult_ = sum(
  1,
  prod(percent(dm.skill.willEtchMult), willConsumedVal)
)
const willConsumed_burst_mult_ = sum(
  1,
  prod(percent(dm.burst.willDmgMult), willConsumedVal)
)

const hex2 = cmpGE(team.common.hexerei, 2, 1)
const a4MasterCryo_self_atk_ = a4MasterCryo.ifOn(
  cmpGE(ascension, 4, percent(dm.passive2.selfAtk_))
)
const a4MasterCryo_team_atk_ = a4MasterCryo.ifOn(
  cmpGE(ascension, 4, percent(dm.passive2.teammateAtk_))
)
const lockBuff_naCa_dmg_ = lockBuff.ifOn(
  lockHomework.ifOn(prod(hex2, percent(dm.lockedPassive.normalCharged_dmg_)))
)
const c2Blade_eleMas = c2Blade.ifOn(
  cmpGE(constellation, 2, dm.constellation2.eleMas)
)
const c6Etch_critDMG_ = cmpGE(
  constellation,
  6,
  percent(dm.constellation6.critDmg_)
)
const c6BurstMaster_critDMG_ = c6BurstMaster.ifOn(
  cmpGE(constellation, 6, percent(dm.constellation6.critDmg_))
)

/** WR dmgNode talent=skill, move normal/charged/plunging, hitEle cryo. */
function skillHit(
  name: string,
  table: number[],
  move: 'normal' | 'charged' | 'plunging'
) {
  return customDmg(
    name,
    'cryo',
    move,
    prod(percent(talentSubscript(skill, table)), final.atk)
  )
}

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // WR flags.isHexerei
  hexereiTally(lockHomework.ifOn(1)),
  // C3 Unforeseen Strike (skill); C5 Manifest Judgment (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  // WR a0HighSpirits_skillBoost — extra skill talent +1 on top of C3
  ownBuff.char.skill.add(a0HighSpirits.ifOn(1)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.atk_.add(a4MasterCryo_self_atk_),
  ownBuff.premod.dmg_.normal.add(lockBuff_naCa_dmg_),
  ownBuff.premod.dmg_.charged.add(lockBuff_naCa_dmg_),
  ownBuff.premod.critDMG_.burst.add(c6BurstMaster_critDMG_),
  // WR teamBuff.premod.atk_ / eleMas unequal(target.charKey, key)
  notOwnBuff.premod.atk_.add(a4MasterCryo_team_atk_),
  notOwnBuff.premod.eleMas.add(c2Blade_eleMas),

  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  // Listing-local cryo — infusionPrio has no cryo channel. Physical NA remain.
  dm.skill.hitArr.flatMap((arr, i) => skillHit(`skill_${i}`, arr, 'normal')),
  skillHit('skill_charged', dm.skill.ca, 'charged'),
  Object.entries(dm.skill.plunging).flatMap(([k, v]) =>
    skillHit(`skill_plunging_${k}`, v, 'plunging')
  ),
  dmg(
    'skill_etchDmg',
    info,
    'atk',
    dm.skill.etchDmg,
    'skill',
    { baseMulti: willConsumed_etch_mult_ },
    ownBuff.premod.critDMG_.add(c6Etch_critDMG_)
  ),
  dmg('burst', info, 'atk', dm.burst.skillDmg, 'burst', {
    baseMulti: willConsumed_burst_mult_,
  }),
  customDmg(
    'c2',
    'cryo',
    'elemental',
    prod(percent(dm.constellation2.dmg), final.atk),
    { cond: cmpGE(constellation, 2, 'infer', '') }
  ),

  customParam('charged_stam', dm.charged.stam),
  customParam('skill_castam', dm.skill.castam),
  customParam('skill_msDuration', dm.skill.msDuration),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
