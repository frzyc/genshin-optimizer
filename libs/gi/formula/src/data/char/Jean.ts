import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod, sum } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  customHeal,
  customParam,
  enemyDebuff,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Jean'
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
      skillParam_gen.auto[a++], // 5
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
    dmg: skillParam_gen.skill[s++],
    stamina: skillParam_gen.skill[s++][0],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    enterExitDmg: skillParam_gen.burst[b++],
    burstActivationAtkModifier: skillParam_gen.burst[b++],
    burstActionFlatModifier: skillParam_gen.burst[b++],
    burstRegenAtkModifier: skillParam_gen.burst[b++],
    burstRegenFlatModifier: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    chance: skillParam_gen.passive1[p1++][0],
    atkPercentage: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    energyRegen: skillParam_gen.passive2[p2++][0],
  },
  constellation1: {
    increaseDmg: skillParam_gen.constellation1[0],
  },
  constellation2: {
    moveSpd: skillParam_gen.constellation2[0],
    atkSpd: skillParam_gen.constellation2[1],
    duration: skillParam_gen.constellation2[2],
  },
  constellation4: {
    anemoRes: skillParam_gen.constellation4[0],
  },
  constellation6: {
    dmgReduction: skillParam_gen.constellation6[0],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { burst, ascension, constellation },
} = own
// WR cond(key, 'c1' | 'c2' | 'c4' | 'c6')
const { c1, c2, c4, c6 } = allBoolConditionals(info.key)

const c1_skill_dmg_ = c1.ifOn(
  cmpGE(constellation, 1, percent(dm.constellation1.increaseDmg))
)
const c2_atkSPD_ = c2.ifOn(
  cmpGE(constellation, 2, percent(dm.constellation2.atkSpd))
)
const c2_moveSPD_ = c2.ifOn(
  cmpGE(constellation, 2, percent(dm.constellation2.moveSpd))
)
const c4_anemo_enemyRes_ = c4.ifOn(
  cmpGE(constellation, 4, percent(-Math.abs(dm.constellation4.anemoRes)))
)
// WR C6 teamBuff dmgRed_ is destIsActive (activeCharBuff). No Pando dmgRed_
// tag; listing matches WR `dmgRed_disp` (ungated display).
const c6_dmgRed_ = c6.ifOn(
  cmpGE(constellation, 6, percent(dm.constellation6.dmgReduction))
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Dandelion Breeze (burst); C5 Gale Blade (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.dmg_.skill.add(c1_skill_dmg_),
  // WR teamBuff on all party (not dest-gated)
  teamBuff.premod.atkSPD_.add(c2_atkSPD_),
  teamBuff.premod.moveSPD_.add(c2_moveSPD_),
  // WR teamBuff.premod.anemo_enemyRes_
  enemyDebuff.common.preRes.anemo.add(c4_anemo_enemyRes_),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill', info, 'atk', dm.skill.dmg, 'skill'),
  dmg('burst', info, 'atk', dm.burst.dmg, 'burst'),
  dmg('burst_enterExit', info, 'atk', dm.burst.enterExitDmg, 'burst'),
  customHeal(
    'burst_regen',
    sum(
      prod(
        percent(talentSubscript(burst, dm.burst.burstActivationAtkModifier)),
        final.atk
      ),
      talentSubscript(burst, dm.burst.burstActionFlatModifier)
    )
  ),
  customHeal(
    'burst_contRegen',
    sum(
      prod(
        percent(talentSubscript(burst, dm.burst.burstRegenAtkModifier)),
        final.atk
      ),
      talentSubscript(burst, dm.burst.burstRegenFlatModifier)
    )
  ),
  customHeal('a1_heal', prod(percent(dm.passive1.atkPercentage), final.atk), {
    cond: cmpGE(ascension, 1, 'infer', ''),
  }),

  customParam('charged_stamina', dm.charged.stamina),
  customParam('skill_stamina', dm.skill.stamina),
  customParam('skill_duration', dm.skill.duration),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_duration', 11),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost),
  customParam('a4_energyRegen', dm.passive2.energyRegen, {
    cond: cmpGE(ascension, 4, 'infer', ''),
  }),
  customParam('c6_dmgRed_', c6_dmgRed_)
)
