import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpEq, cmpGE, prod, sum } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allListConditionals,
  allNumConditionals,
  customParam,
  notOwnBuff,
  own,
  ownBuff,
  percent,
  register,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Aloy'
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
      skillParam_gen.auto[a++], // 1.1
      skillParam_gen.auto[a++], // 1.2
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3
      skillParam_gen.auto[a++], // 4
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
    freezeBombDmg: skillParam_gen.skill[s++],
    chillWaterBomblets: skillParam_gen.skill[s++],
    atkDecrease: skillParam_gen.skill[s++],
    atkDecreaseDuration: skillParam_gen.skill[s++][0],
    coilNormalDmgBonus1: skillParam_gen.skill[s++],
    coilNormalDmgBonus2: skillParam_gen.skill[s++],
    coilNormalDmgBonus3: skillParam_gen.skill[s++],
    rushingNormalDmgBonus: skillParam_gen.skill[s++],
    rushingDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    atkInc: 0.16,
    teamAtkInc: skillParam_gen.passive1[p1++][0],
    duration: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    cryoDmgBonus: skillParam_gen.passive2[p2++][0],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  char: { skill, ascension },
} = own
// WR cond(key, 'A1'); lookup coil coil1|coil2|coil3|rush; lookup A4 1–10
const { A1 } = allBoolConditionals(info.key)
const { coil } = allListConditionals(info.key, [
  'coil1',
  'coil2',
  'coil3',
  'rush',
])
const { A4 } = allNumConditionals(info.key, true, 0, 10)

const coil_normal_dmg_ = sum(
  prod(
    coil.map({ coil1: 1 }),
    percent(talentSubscript(skill, dm.skill.coilNormalDmgBonus1))
  ),
  prod(
    coil.map({ coil2: 1 }),
    percent(talentSubscript(skill, dm.skill.coilNormalDmgBonus2))
  ),
  prod(
    coil.map({ coil3: 1 }),
    percent(talentSubscript(skill, dm.skill.coilNormalDmgBonus3))
  ),
  prod(
    coil.map({ rush: 1 }),
    percent(talentSubscript(skill, dm.skill.rushingNormalDmgBonus))
  )
)
const a1_atk_ = A1.ifOn(cmpGE(ascension, 1, percent(dm.passive1.atkInc)))
const a1_teamAtk_ = A1.ifOn(
  cmpGE(ascension, 1, percent(dm.passive1.teamAtkInc))
)
const a4_cryo_dmg_ = cmpGE(
  ascension,
  4,
  prod(A4, percent(dm.passive2.cryoDmgBonus))
)
const rushOn = cmpEq(coil.map({ rush: 1 }), 1, 'infer', '')

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // Aloy has no constellations — no C3/C5 talent boosts.

  ownBuff.premod.dmg_.normal.add(coil_normal_dmg_),
  ownBuff.premod.atk_.add(a1_atk_),
  notOwnBuff.premod.atk_.add(a1_teamAtk_),
  ownBuff.premod.dmg_.cryo.add(a4_cryo_dmg_),

  // Formulas — bow NA physical; rush Coil is listing-local cryo (not infusionPrio).
  dm.normal.hitArr.flatMap((arr, i) => [
    ...dmg(`normal_${i}`, info, 'atk', arr, 'normal'),
    ...dmg(`normal_${i}_rush`, info, 'atk', arr, 'normal', {
      ele: 'cryo',
      cond: rushOn,
    }),
  ]),
  dmg('charged_aimed', info, 'atk', dm.charged.aimed, 'charged', {
    ele: 'physical',
  }),
  dmg('charged_aimedCharged', info, 'atk', dm.charged.aimedCharged, 'charged', {
    ele: 'cryo',
  }),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('freezeBombDmg', info, 'atk', dm.skill.freezeBombDmg, 'skill'),
  dmg('chillWaterBomblets', info, 'atk', dm.skill.chillWaterBomblets, 'skill'),
  dmg('burst', info, 'atk', dm.burst.dmg, 'burst'),

  customParam(
    'skill_atkDecrease',
    percent(talentSubscript(skill, dm.skill.atkDecrease))
  ),
  customParam('skill_atkDecreaseDuration', dm.skill.atkDecreaseDuration),
  customParam('skill_rushingDuration', dm.skill.rushingDuration),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
