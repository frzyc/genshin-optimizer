import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  customParam,
  enemyDebuff,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Faruzan'
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
    aimed: skillParam_gen.auto[a++],
    aimedCharged: skillParam_gen.auto[a++],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    skill_dmg: skillParam_gen.skill[s++],
    vortex_dmg: skillParam_gen.skill[s++],
    // WR s++: [2]=18s gale, [3]=6s CD. Encoding UI rows point at {{3}}/{{4}} (6s/5.5s).
    galeDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    anemo_dmg_: skillParam_gen.burst[b++],
    giftDuration: skillParam_gen.burst[b++][0],
    anemo_enemyRes_: -skillParam_gen.burst[b++][0],
    riftDuration: skillParam_gen.burst[b++][0],
    polyDuration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    chargeShotDec_: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    gift_dmgInc: skillParam_gen.passive2[p2++][0],
    cd: skillParam_gen.passive2[p2++][0],
  },
  constellation2: {
    durationInc: skillParam_gen.constellation2[0],
  },
  constellation6: {
    // WR uses constellation6[0] for both critDMG_ and duration.
    anemo_critDMG_: skillParam_gen.constellation6[0],
    duration: skillParam_gen.constellation6[0],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  char: { burst, ascension, constellation },
} = own
// WR cond(key, 'burstBenefit' | 'burstHit' | 'a4Active' | 'c6Crit')
const { burstBenefit, burstHit, a4Active, c6Crit } = allBoolConditionals(
  info.key
)

const burstBenefit_anemo_dmg_ = burstBenefit.ifOn(
  percent(talentSubscript(burst, dm.burst.anemo_dmg_))
)
const burstHit_anemo_enemyRes_ = burstHit.ifOn(
  percent(dm.burst.anemo_enemyRes_)
)
// WR teamBuff.premod.anemo_dmgInc = prod(% gift, input.base.atk). Ele-tagged formula.base.
const a4_anemo_dmgInc = burstBenefit.ifOn(
  a4Active.ifOn(
    cmpGE(ascension, 4, prod(percent(dm.passive2.gift_dmgInc), own.base.atk))
  )
)
const c6Benefit_anemo_critDMG_ = burstBenefit.ifOn(
  c6Crit.ifOn(
    cmpGE(constellation, 6, percent(dm.constellation6.anemo_critDMG_))
  )
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Wind Realm of Nasamjnin (skill); C5 The Wind's Secret Ways (burst) — inverted vs default
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  teamBuff.premod.dmg_.anemo.add(burstBenefit_anemo_dmg_),
  // WR teamBuff.premod.anemo_enemyRes_ (attacker tag); Pando enemy preRes. Keep WR sign.
  enemyDebuff.common.preRes.anemo.add(burstHit_anemo_enemyRes_),
  teamBuff.formula.base.anemo.add(a4_anemo_dmgInc),
  teamBuff.premod.critDMG_.anemo.add(c6Benefit_anemo_critDMG_),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_aimed', info, 'atk', dm.charged.aimed, 'charged', {
    ele: 'physical',
  }),
  dmg('charged_aimedCharged', info, 'atk', dm.charged.aimedCharged, 'charged', {
    ele: 'anemo',
  }),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill', info, 'atk', dm.skill.skill_dmg, 'skill'),
  dmg('vortexDmg', info, 'atk', dm.skill.vortex_dmg, 'skill'),
  dmg('burst', info, 'atk', dm.burst.dmg, 'burst'),

  customParam('skill_galeDuration', dm.skill.galeDuration),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_giftDuration', dm.burst.giftDuration),
  customParam('burst_riftDuration', dm.burst.riftDuration),
  customParam('burst_duration', dm.burst.polyDuration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
