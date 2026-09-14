import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod, sum } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allListConditionals,
  customDmg,
  customParam,
  own,
  ownBuff,
  percent,
  register,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Wanderer'
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
      skillParam_gen.auto[a++], // 3x2
    ],
  },
  throwaway: a++,
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
    dmg: skillParam_gen.skill[s++],
    normal_mult: skillParam_gen.skill[s++],
    charged_mult: skillParam_gen.skill[s++],
    skyDwellerPoints: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    pyro_atk_: skillParam_gen.passive1[p1++][0],
    hydro_point: skillParam_gen.passive1[p1++][0],
    cryo_critRate_: skillParam_gen.passive1[p1++][0],
    electro_energy: skillParam_gen.passive1[p1++][0],
    electro_cd: 0.2,
  },
  passive2: {
    chance_: skillParam_gen.passive2[p2++][0],
    chanceInc_: skillParam_gen.passive2[p2++][0],
    dmg: skillParam_gen.passive2[p2++][0],
    arrowAmt: 4,
    cd: 0.1,
  },
  constellation1: {
    atkSPD_: skillParam_gen.constellation1[0],
    dmg: skillParam_gen.constellation1[1],
  },
  constellation2: {
    burst_dmg_perPoint: skillParam_gen.constellation2[0],
    max_burst_dmg_: skillParam_gen.constellation2[1],
  },
  constellation6: {
    dmg: skillParam_gen.constellation6[0],
    pointRestore: skillParam_gen.constellation6[1],
    threshold: skillParam_gen.constellation6[2],
    cd: 0.2,
    maxRestoreTimes: 5,
  },
} as const

const c2PointsArr = [
  '5',
  '10',
  '15',
  '20',
  '25',
  '30',
  '35',
  '40',
  '45',
  '50',
] as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill, ascension, constellation },
} = own
// WR cond(key, 'afterSkill') `'on'`
const { afterSkill } = allBoolConditionals(info.key)
// WR cond(key, 'skillPyroContact' | 'skillCryoContact') — states `'pyro'` / `'cryo'`
const { skillPyroContact } = allListConditionals(info.key, ['pyro'])
const { skillCryoContact } = allListConditionals(info.key, ['cryo'])
// WR lookup(condC2Points, { 5, 10, …, 50 })
const { c2Points } = allListConditionals(info.key, [...c2PointsArr])

const afterSkill_normal_mult_ = afterSkill.ifOn(
  percent(talentSubscript(skill, dm.skill.normal_mult)),
  1
)
const afterSkill_charged_mult_ = afterSkill.ifOn(
  percent(talentSubscript(skill, dm.skill.charged_mult)),
  1
)
const skillPyro_atk_ = afterSkill.ifOn(
  cmpGE(
    ascension,
    1,
    percent(skillPyroContact.map({ pyro: dm.passive1.pyro_atk_ }))
  )
)
const skillCryo_critRate_ = afterSkill.ifOn(
  cmpGE(
    ascension,
    1,
    percent(skillCryoContact.map({ cryo: dm.passive1.cryo_critRate_ }))
  )
)
const c1AfterSkill_atkSPD_ = afterSkill.ifOn(
  cmpGE(constellation, 1, percent(dm.constellation1.atkSPD_))
)
const c1BonusScaling_ = afterSkill.ifOn(
  cmpGE(constellation, 1, percent(dm.constellation1.dmg))
)
const c2AfterSkill_burst_dmg_ = afterSkill.ifOn(
  cmpGE(
    constellation,
    2,
    prod(
      c2Points.map({
        '5': 5,
        '10': 10,
        '15': 15,
        '20': 20,
        '25': 25,
        '30': 30,
        '35': 35,
        '40': 40,
        '45': 45,
        '50': 50,
      }),
      percent(dm.constellation2.burst_dmg_perPoint)
    )
  )
)
const afterSkillOn = cmpGE(afterSkill.ifOn(1), 1, 'infer', '')

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Sanban: Moonflower Kusemai (burst); C5 Matsuban (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.atk_.add(skillPyro_atk_),
  ownBuff.premod.critRate_.add(skillCryo_critRate_),
  ownBuff.premod.atkSPD_.add(c1AfterSkill_atkSPD_),
  ownBuff.premod.dmg_.burst.add(c2AfterSkill_burst_dmg_),

  // Catalyst NA/CA/plunge are already Anemo. WR does not infuse in Windfavored —
  // skill-state is Kuugo DMG mult on the same listings (not listing-local anemo).
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal', {
      baseMulti: afterSkill_normal_mult_,
    })
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged', {
    baseMulti: afterSkill_charged_mult_,
  }),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill', info, 'atk', dm.skill.dmg, 'skill'),
  dmg('burst', info, 'atk', dm.burst.dmg, 'burst'),
  customDmg(
    'passive2',
    'anemo',
    'elemental',
    prod(sum(percent(dm.passive2.dmg), c1BonusScaling_), final.atk),
    { cond: cmpGE(ascension, 4, 'infer', '') }
  ),
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`c6_${i}`, info, 'atk', arr, 'normal', {
      ele: 'anemo',
      baseMulti: prod(percent(dm.constellation6.dmg), afterSkill_normal_mult_),
      cond: cmpGE(constellation, 6, afterSkillOn, ''),
    })
  ),

  customParam('charged_stamina', dm.charged.stamina),
  customParam('skill_skyDwellerPoints', dm.skill.skyDwellerPoints),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
