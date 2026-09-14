import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, cmpLT, cmpNE, prod, sum } from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import {
  allBoolConditionals,
  allListConditionals,
  customDmg,
  customParam,
  enemyDebuff,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Mavuika'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = 0,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2x2
      skillParam_gen.auto[a++], // 3x3
      skillParam_gen.auto[a++], // 4
    ],
  },
  charged: {
    finalDmg: skillParam_gen.auto[a++],
    stam: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    skillDmg: skillParam_gen.skill[s++],
    radianceDmg: skillParam_gen.skill[s++],
    radianceInterval: skillParam_gen.skill[s++][0],
    normalHitArr: [
      skillParam_gen.skill[s++], // 1
      skillParam_gen.skill[s++], // 2
      skillParam_gen.skill[s++], // 3
      skillParam_gen.skill[s++], // 4
      skillParam_gen.skill[s++], // 5
    ],
    sprintDmg: skillParam_gen.skill[s++],
    chargedCyclicDmg: skillParam_gen.skill[s++],
    chargedFinalDmg: skillParam_gen.skill[s++],
    plungeDmg: skillParam_gen.skill[s++],
    nsPointLimit: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    sunfell_dmgInc: skillParam_gen.burst[b++],
    flameNormal_dmgInc: skillParam_gen.burst[b++],
    flameCharged_dmgInc: skillParam_gen.burst[b++],
    nsToSpiritRatio: skillParam_gen.burst[b++][0],
    naToSpiritRatio: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    spiritLimit: skillParam_gen.burst[b++][0],
  },
  passive1: {
    atk_: skillParam_gen.passive1[0][0],
    duration: skillParam_gen.passive1[1][0],
  },
  passive2: {
    // TODO: Surely this will be fixed
    dmg_: skillParam_gen.passive2[0][0] * 20,
    duration: skillParam_gen.passive2[1][0],
    maxSpirit: skillParam_gen.passive2[2][0],
  },
  constellation1: {
    extraNs: skillParam_gen.constellation1[0],
    extraSpiritGain_: skillParam_gen.constellation1[1],
    atk_: skillParam_gen.constellation1[2],
    duration: skillParam_gen.constellation1[3],
  },
  constellation2: {
    base_atk: skillParam_gen.constellation2[0],
    enemyDefRed_: skillParam_gen.constellation2[1],
    normal_dmgInc: skillParam_gen.constellation2[2],
    charged_dmgInc: skillParam_gen.constellation2[3],
    burst_dmgInc: skillParam_gen.constellation2[4],
  },
  constellation4: {
    all_dmg_: skillParam_gen.constellation4[0],
  },
  constellation6: {
    flamestriderDmg: skillParam_gen.constellation6[0],
    ringDmg: skillParam_gen.constellation6[1],
    ringInterval: skillParam_gen.constellation6[2],
    nsGain: skillParam_gen.constellation6[3],
    cd: skillParam_gen.constellation6[4],
  },
} as const

const burstSpiritArr = range(100, dm.burst.spiritLimit, 10).map(String)
const a4TimeSinceBurstArr = range(0, dm.passive2.duration - 1).map(String)

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill, burst, ascension, constellation },
} = own
// WR cond(key, 'a1NsBurst' | 'c1GainSpirit' | 'c2RingForm' | 'c2FlameForm')
const { a1NsBurst, c1GainSpirit, c2RingForm, c2FlameForm } =
  allBoolConditionals(info.key)
// WR lookup(cond(key, 'burstSpirit'), 100..spiritLimit step 10)
const { burstSpirit } = allListConditionals(info.key, burstSpiritArr)
// WR lookup(cond(key, 'a4TimeSinceBurst'), 0..duration-1)
const { a4TimeSinceBurst } = allListConditionals(info.key, a4TimeSinceBurstArr)

const burstSpiritVal = burstSpirit.map(
  objKeyMap(burstSpiritArr, (spirit) => Number(spirit))
)
const a4TimeVal = a4TimeSinceBurst.map(
  objKeyMap(a4TimeSinceBurstArr, (time) => Number(time))
)

const sunfell_dmgInc = prod(
  final.atk,
  percent(talentSubscript(burst, dm.burst.sunfell_dmgInc)),
  burstSpiritVal
)
const flameNormal_dmgInc = prod(
  final.atk,
  percent(talentSubscript(burst, dm.burst.flameNormal_dmgInc)),
  burstSpiritVal
)
const flameCharged_dmgInc = prod(
  final.atk,
  percent(talentSubscript(burst, dm.burst.flameCharged_dmgInc)),
  burstSpiritVal
)

const a1NsBurst_atk_ = a1NsBurst.ifOn(
  cmpGE(ascension, 1, percent(dm.passive1.atk_))
)
const a4TimeSinceBurst_dmg_disp = cmpGE(
  ascension,
  4,
  cmpNE(
    a4TimeSinceBurst.value,
    0,
    prod(
      percent(dm.passive2.dmg_),
      burstSpiritVal,
      1 / dm.passive2.duration,
      sum(dm.passive2.duration, prod(-1, cmpGE(constellation, 4, 0, a4TimeVal)))
    )
  )
)
const c1GainSpirit_atk_ = c1GainSpirit.ifOn(
  cmpGE(constellation, 1, percent(dm.constellation1.atk_))
)
const c2AnyForm_base_atk = cmpGE(
  constellation,
  2,
  cmpGE(
    sum(c2RingForm.ifOn(1), c2FlameForm.ifOn(1)),
    1,
    dm.constellation2.base_atk
  )
)
const c2RingForm_enemyDefRed_ = c2RingForm.ifOn(
  cmpGE(constellation, 2, percent(dm.constellation2.enemyDefRed_))
)
const antiC2RingForm_enemyDefRed_ = cmpLT(
  constellation,
  6,
  prod(-1, c2RingForm_enemyDefRed_)
)
const c2FlameForm_normal_dmgInc = c2FlameForm.ifOn(
  cmpGE(
    constellation,
    2,
    prod(final.atk, percent(dm.constellation2.normal_dmgInc))
  )
)
const c2FlameForm_charged_dmgInc = c2FlameForm.ifOn(
  cmpGE(
    constellation,
    2,
    prod(final.atk, percent(dm.constellation2.charged_dmgInc))
  )
)
const c2FlameForm_burst_dmgInc = c2FlameForm.ifOn(
  cmpGE(
    constellation,
    2,
    prod(final.atk, percent(dm.constellation2.burst_dmgInc))
  )
)
const c4AfterBurst_dmg_disp = cmpGE(
  constellation,
  4,
  cmpGE(
    ascension,
    4,
    cmpNE(a4TimeSinceBurst.value, 0, percent(dm.constellation4.all_dmg_))
  )
)

const antiC2DefRed = enemyDebuff.common.defRed_.add(antiC2RingForm_enemyDefRed_)
const flameNormalBase = ownBuff.formula.base.add(
  sum(flameNormal_dmgInc, c2FlameForm_normal_dmgInc)
)
const flameChargedBase = ownBuff.formula.base.add(
  sum(flameCharged_dmgInc, c2FlameForm_charged_dmgInc)
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Hour of Burning Skies (burst); C5 The Named Moment (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.atk_.add(sum(a1NsBurst_atk_, c1GainSpirit_atk_)),
  ownBuff.base.atk.add(c2AnyForm_base_atk),
  // WR premod.burst_dmgInc → formula.base.burst (no flat dmgInc tag)
  ownBuff.formula.base.burst.add(sum(sunfell_dmgInc, c2FlameForm_burst_dmgInc)),
  // WR teamBuff.premod.all_dmg_ dest-gated to active.
  teamBuff.premod.dmg_.add(
    cmpNE(
      destIsActive,
      0,
      sum(a4TimeSinceBurst_dmg_disp, c4AfterBurst_dmg_disp)
    )
  ),
  // WR teamBuff.premod.enemyDefRed_ — party-wide enemy shred, not dest-gated.
  enemyDebuff.common.defRed_.add(c2RingForm_enemyDefRed_),

  // Formulas — claymore NA/CA/plunge physical. Flamestrider is listing-local
  // pyro (WR hitEle.pyro, no infusion.nonOverridableSelf).
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.finalDmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill', info, 'atk', dm.skill.skillDmg, 'skill'),
  dmg('skill_radianceDmg', info, 'atk', dm.skill.radianceDmg, 'skill'),
  // WR dmgNode talent=skill, move normal/charged/plunging, hitEle pyro + listing-local dmgInc / anti-C2 defRed.
  dm.skill.normalHitArr.flatMap((arr, i) =>
    customDmg(
      `skill_normal_${i}`,
      'pyro',
      'normal',
      prod(percent(talentSubscript(skill, arr)), final.atk),
      undefined,
      flameNormalBase,
      antiC2DefRed
    )
  ),
  customDmg(
    'skill_sprintDmg',
    'pyro',
    'elemental',
    prod(percent(talentSubscript(skill, dm.skill.sprintDmg)), final.atk),
    undefined,
    antiC2DefRed
  ),
  customDmg(
    'skill_chargedCyclicDmg',
    'pyro',
    'charged',
    prod(percent(talentSubscript(skill, dm.skill.chargedCyclicDmg)), final.atk),
    undefined,
    flameChargedBase,
    antiC2DefRed
  ),
  customDmg(
    'skill_chargedFinalDmg',
    'pyro',
    'charged',
    prod(percent(talentSubscript(skill, dm.skill.chargedFinalDmg)), final.atk),
    undefined,
    flameChargedBase,
    antiC2DefRed
  ),
  customDmg(
    'skill_plungeDmg',
    'pyro',
    'plunging',
    prod(percent(talentSubscript(skill, dm.skill.plungeDmg)), final.atk),
    undefined,
    antiC2DefRed
  ),
  dmg(
    'burst',
    info,
    'atk',
    dm.burst.skillDmg,
    'burst',
    undefined,
    antiC2DefRed
  ),
  customParam('sunfell_dmgInc', sunfell_dmgInc),
  customParam('flameNormal_dmgInc', flameNormal_dmgInc),
  customParam('flameCharged_dmgInc', flameCharged_dmgInc),
  customParam('c2FlameForm_normal_dmgInc', c2FlameForm_normal_dmgInc),
  customParam('c2FlameForm_charged_dmgInc', c2FlameForm_charged_dmgInc),
  customParam('c2FlameForm_burst_dmgInc', c2FlameForm_burst_dmgInc),
  customDmg(
    'c6_flamestriderDmg',
    'pyro',
    'skill',
    prod(percent(dm.constellation6.flamestriderDmg), final.atk),
    { cond: cmpGE(constellation, 6, 'infer', '') }
  ),
  customDmg(
    'c6_ringDmg',
    'pyro',
    'skill',
    prod(percent(dm.constellation6.ringDmg), final.atk),
    { cond: cmpGE(constellation, 6, 'infer', '') }
  ),

  customParam('charged_stam', dm.charged.stam),
  customParam('skill_radianceInterval', dm.skill.radianceInterval),
  customParam('skill_nsPointLimit', dm.skill.nsPointLimit),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_spiritLimit', dm.burst.spiritLimit)
)
