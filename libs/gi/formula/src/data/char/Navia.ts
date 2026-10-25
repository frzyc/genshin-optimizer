import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  cmpGE,
  min,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/pando/engine'
import { infusionPrio } from '../common/dmg'
import {
  allBoolConditionals,
  allNumConditionals,
  customParam,
  enemyDebuff,
  own,
  ownBuff,
  percent,
  register,
  team,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar } from './util'

const key: CharacterKey = 'Navia'
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
      skillParam_gen.auto[a++], // 3x3
      skillParam_gen.auto[a++], // 4
    ],
  },
  charged: {
    cyclicDmg: skillParam_gen.auto[a++],
    finalDmg: skillParam_gen.auto[a++],
    stam: skillParam_gen.auto[a++][0],
    duration: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    baseShardDmg: skillParam_gen.skill[s++],
    addlCharge_dmg_: skillParam_gen.skill[s++][0],
    shrapnelDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
    bladeDmg: skillParam_gen.skill[s++],
    bladeInterval: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    supportDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    auto_dmg_: skillParam_gen.passive1[0][0],
    duration: skillParam_gen.passive1[1][0],
  },
  passive2: {
    atk_: skillParam_gen.passive2[0][0],
  },
  constellation1: {
    energyRegen: skillParam_gen.constellation1[0],
    cdReduction: skillParam_gen.constellation1[1],
  },
  constellation2: {
    critRate_: skillParam_gen.constellation2[0],
  },
  constellation4: {
    geo_enemyRes_: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
  },
  constellation6: {
    shot_critDMG_: skillParam_gen.constellation6[0],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  char: { ascension, constellation },
} = own
// WR cond(key, 'a1AfterSkill' | 'c4AfterBurstHit')
const { a1AfterSkill, c4AfterBurstHit } = allBoolConditionals(info.key)
// WR lookup(cond(key, 'skillCharges'), 1..6 → n, else 0)
const { skillCharges } = allNumConditionals(info.key, true, 0, 6)
// WR lookup(cond(key, 'shotsHit'), 1..11 → n, else 0)
const { shotsHit } = allNumConditionals(info.key, true, 0, 11)

// WR lookup 1→7, 2→9, 3+→11, else 5
const skillShotsFired = subscript(skillCharges, [5, 7, 9, 11, 11, 11, 11])
// TODO: Verify this
const shotsHit_mult_map = [
  0, 0, 0.05, 0.1, 0.15, 0.2, 0.36, 0.4, 0.6, 0.66, 0.9, 1,
]
const shotsHit_shot_mult_ = cmpGE(
  skillShotsFired,
  shotsHit,
  percent(subscript(shotsHit, shotsHit_mult_map))
)
const excessSkillCharges_skill_dmg_ = cmpGE(
  skillCharges,
  4,
  prod(sum(skillCharges, -3), percent(dm.skill.addlCharge_dmg_))
)

const a1AfterSkill_auto_dmg_ = a1AfterSkill.ifOn(
  cmpGE(ascension, 1, percent(dm.passive1.auto_dmg_))
)

const a4ElementArr = ['pyro', 'electro', 'cryo', 'hydro'] as const
const numTeammates = sum(...a4ElementArr.map((ele) => team.common.count[ele]))
const a4Element_atk_ = cmpGE(
  ascension,
  4,
  cmpGE(
    numTeammates,
    2,
    percent(dm.passive2.atk_ * 2),
    cmpGE(numTeammates, 1, percent(dm.passive2.atk_))
  )
)

const c2Shot_critRate_ = cmpGE(
  constellation,
  2,
  cmpGE(
    skillCharges,
    1,
    prod(min(skillCharges, 3), percent(dm.constellation2.critRate_))
  )
)
// WR teamBuff.premod.geo_enemyRes_ = -dm (shred). Keep WR sign.
const c4AfterBurstHit_geo_enemyRes_ = c4AfterBurstHit.ifOn(
  cmpGE(constellation, 4, percent(-dm.constellation4.geo_enemyRes_))
)
const c6Shot_critDMG_ = cmpGE(
  constellation,
  6,
  cmpGE(
    skillCharges,
    4,
    prod(sum(skillCharges, -3), percent(dm.constellation6.shot_critDMG_))
  )
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Ceremonial Crystalshot (skill); C5 As the Sunlit Sky's Singing Salute (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.dmg_.normal.add(a1AfterSkill_auto_dmg_),
  ownBuff.premod.dmg_.charged.add(a1AfterSkill_auto_dmg_),
  ownBuff.premod.dmg_.plunging.add(a1AfterSkill_auto_dmg_),
  ownBuff.premod.atk_.add(a4Element_atk_),
  ownBuff.premod.dmg_.skill.add(excessSkillCharges_skill_dmg_),
  ownBuff.reaction.infusionIndex.add(
    a1AfterSkill.ifOn(cmpGE(ascension, 1, infusionPrio.nonOverridable.geo))
  ),
  enemyDebuff.common.preRes.geo.add(c4AfterBurstHit_geo_enemyRes_),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_cyclic', info, 'atk', dm.charged.cyclicDmg, 'charged'),
  dmg('charged_final', info, 'atk', dm.charged.finalDmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg(
    'totalShardDmg',
    info,
    'atk',
    dm.skill.baseShardDmg,
    'skill',
    { baseMulti: sum(percent(1), shotsHit_shot_mult_) },
    ownBuff.premod.critRate_.skill.add(c2Shot_critRate_),
    ownBuff.premod.critDMG_.skill.add(c6Shot_critDMG_)
  ),
  // WR bladeDmg sets hit.reaction to '' (Arkhe); Pando has no no-react overlay.
  dmg('bladeDmg', info, 'atk', dm.skill.bladeDmg, 'skill'),
  dmg('burst', info, 'atk', dm.burst.skillDmg, 'burst'),
  dmg('supportDmg', info, 'atk', dm.burst.supportDmg, 'burst'),

  customParam('charged_stam', dm.charged.stam),
  customParam('charged_duration', dm.charged.duration),
  customParam('skill_shrapnelDuration', dm.skill.shrapnelDuration),
  customParam('skill_cd', dm.skill.cd),
  customParam('skill_bladeInterval', dm.skill.bladeInterval),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
