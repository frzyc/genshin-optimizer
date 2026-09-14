import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, cmpNE, prod } from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import {
  allBoolConditionals,
  customDmg,
  customParam,
  enemyDebuff,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import {
  dataGenToCharInfo,
  dmg,
  entriesForChar,
  fixedShield,
  shield,
  talentSubscript,
} from './util'

const key: CharacterKey = 'Beidou'
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
    spinningDmg: skillParam_gen.auto[a++],
    finalDmg: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
    duration: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    shieldHp_: skillParam_gen.skill[s++],
    shieldFlat: skillParam_gen.skill[s++],
    dmgBase: skillParam_gen.skill[s++],
    onHitDmgBonus: skillParam_gen.skill[s++], //DMG bonus on hit taken
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    burstDmg: skillParam_gen.burst[b++],
    lightningDmg: skillParam_gen.burst[b++],
    damageReduction: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    energyCost: skillParam_gen.burst[b++][0],
  },
  //pasive 1: 2, //additional targets for lightning arc
  ascension4: {
    normalDmg_: skillParam_gen.passive2[0][0], //Same value for all 3
    chargeDmg_: skillParam_gen.passive2[0][0],
    attackSpeed: skillParam_gen.passive2[0][0],
  },
  lockedPassive: {
    cdReduce: skillParam_gen.lockedPassive![0][0],
    energyRegen: skillParam_gen.lockedPassive![1][0],
    cd: skillParam_gen.lockedPassive![2][0],
  },
  constellation1: {
    shieldHp_: skillParam_gen.constellation1[0],
  },
  constellation4: {
    skillDmg: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
  },
  constellation6: {
    electroResShred_: -1 * skillParam_gen.constellation6[0],
    cryoResShred_: -1 * skillParam_gen.constellation6[1],
    eleMas: skillParam_gen.constellation6[2],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { burst: burstTalent, ascension, constellation },
} = own
// WR cond(key, 'burst' | 'Ascension4' | 'lockRevelation' | 'lockStellarRadianceSc')
const { burst, Ascension4, lockRevelation, lockStellarRadianceSc } =
  allBoolConditionals(info.key)

const skillDmgOneHit = dm.skill.dmgBase.map(
  (d, i) => d + dm.skill.onHitDmgBonus[i]!
)
const skillDmgTwoHits = dm.skill.dmgBase.map(
  (d, i) => d + 2 * dm.skill.onHitDmgBonus[i]!
)

const a4Bonus = Ascension4.ifOn(
  cmpGE(ascension, 4, percent(dm.ascension4.normalDmg_))
)
// WR teamBuff dmgRed_ — no Pando tag; listing-only customParam
const burst_dmgRed_ = burst.ifOn(
  percent(talentSubscript(burstTalent, dm.burst.damageReduction))
)
const c6EleMas = burst.ifOn(
  lockRevelation.ifOn(
    lockStellarRadianceSc.ifOn(
      cmpGE(constellation, 6, cmpNE(destIsActive, 0, dm.constellation6.eleMas))
    )
  )
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Tidecaller (skill); C5 Stormbreaker (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  // A4 Lightning Storm (WR own premod normal_dmg_ / charged_dmg_ / atkSPD_)
  ownBuff.premod.dmg_.normal.add(a4Bonus),
  ownBuff.premod.dmg_.charged.add(a4Bonus),
  ownBuff.premod.atkSPD_.add(a4Bonus),

  // C6 Bane of Evil (WR teamBuff electro_enemyRes_ / cryo_enemyRes_, keep sign)
  enemyDebuff.common.preRes.electro.add(
    burst.ifOn(
      cmpGE(constellation, 6, percent(dm.constellation6.electroResShred_))
    )
  ),
  enemyDebuff.common.preRes.cryo.add(
    lockRevelation.ifOn(
      lockStellarRadianceSc.ifOn(
        burst.ifOn(
          cmpGE(constellation, 6, percent(dm.constellation6.cryoResShred_))
        )
      )
    )
  ),
  // WR teamBuff eleMas during burst, active char only
  teamBuff.premod.eleMas.add(c6EleMas),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_spinning', info, 'atk', dm.charged.spinningDmg, 'charged'),
  dmg('charged_final', info, 'atk', dm.charged.finalDmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  shield(
    'skill_shield',
    'hp',
    dm.skill.shieldHp_,
    dm.skill.shieldFlat,
    'skill'
  ),
  shield(
    'skill_electroShield',
    'hp',
    dm.skill.shieldHp_,
    dm.skill.shieldFlat,
    'skill',
    { ele: 'electro' }
  ),
  dmg('skill_press', info, 'atk', dm.skill.dmgBase, 'skill'),
  dmg('skill_hold1', info, 'atk', skillDmgOneHit, 'skill'),
  dmg('skill_hold2', info, 'atk', skillDmgTwoHits, 'skill'),
  dmg('burst', info, 'atk', dm.burst.burstDmg, 'burst'),
  dmg('burst_lightning', info, 'atk', dm.burst.lightningDmg, 'burst'),
  fixedShield('c1_shield', 'hp', percent(dm.constellation1.shieldHp_), 0, {
    cond: cmpGE(constellation, 1, 'infer', ''),
  }),
  fixedShield(
    'c1_electroShield',
    'hp',
    percent(dm.constellation1.shieldHp_),
    0,
    { ele: 'electro', cond: cmpGE(constellation, 1, 'infer', '') }
  ),
  customDmg(
    'c4',
    info.ele,
    'elemental',
    prod(final.atk, percent(dm.constellation4.skillDmg)),
    { cond: cmpGE(constellation, 4, 'infer', '') }
  ),

  customParam('burst_dmgRed_', burst_dmgRed_),
  customParam('charged_stamina', dm.charged.stamina),
  customParam('charged_duration', dm.charged.duration),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.energyCost),
  customParam('c4_duration', dm.constellation4.duration, {
    cond: cmpGE(constellation, 4, 'infer', ''),
  })
)
