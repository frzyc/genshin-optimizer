import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod } from '@genshin-optimizer/pando/engine'
import {
  allListConditionals,
  enemyDebuff,
  own,
  ownBuff,
  percent,
  register,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar } from './util'

const key: CharacterKey = 'KamisatoAyaka'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = 0,
  s = 0,
  b = 0,
  sp = 0,
  p1 = 0,
  p2 = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3
      skillParam_gen.auto[a++], // 4x3
      skillParam_gen.auto[a++], // 5
    ],
  },
  charged: {
    dmg1: skillParam_gen.auto[a++], // 1x3
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
    cutDmg: skillParam_gen.burst[b++],
    bloomDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  sprint: {
    active_stam: skillParam_gen?.sprint?.[sp++]?.[0],
    drain_stam: skillParam_gen?.sprint?.[sp++]?.[0],
    duration: skillParam_gen?.sprint?.[sp++]?.[0],
  },
  passive1: {
    dmg_bonus: skillParam_gen.passive1[p1++][0],
    duration: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    stamina: skillParam_gen.passive2[p2++][0],
    cryo: skillParam_gen.passive2[p2++][0],
    duration: skillParam_gen.passive2[p2++][0],
  },
  constellation2: {
    snowflake: skillParam_gen.constellation2[0],
  },
  constellation4: {
    def_red: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
  },
  constellation6: {
    cd: skillParam_gen.constellation6[0],
    charged_bonus: skillParam_gen.constellation6[1],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  char: { ascension, constellation },
} = own
// WR cond(key, 'afterSprint' | 'afterSkillA1' | 'afterApplySprint' | 'afterBurst' | 'C6')
const { afterSprint } = allListConditionals(info.key, ['afterSprint'])
const { afterSkillA1 } = allListConditionals(info.key, ['afterSkill'])
const { afterApplySprint } = allListConditionals(info.key, ['afterApplySprint'])
const { afterBurst } = allListConditionals(info.key, ['c4'])
const { C6 } = allListConditionals(info.key, ['c6'])

const afterSprintOn = afterSprint.map({ afterSprint: 1 })
const afterSkillOn = afterSkillA1.map({ afterSkill: 1 })
const afterApplySprintOn = afterApplySprint.map({ afterApplySprint: 1 })
const afterBurstOn = afterBurst.map({ c4: 1 })
const c6On = C6.map({ c6: 1 })

const afterSprintInfusionOn = cmpGE(afterSprintOn, 1, 'infer', '')
const a1_naCa_dmg_ = cmpGE(
  ascension,
  1,
  prod(afterSkillOn, percent(dm.passive1.dmg_bonus))
)
const afterApplySprint_cryo_dmg_ = cmpGE(
  ascension,
  4,
  prod(afterApplySprintOn, percent(dm.passive2.cryo))
)
const afterBurst_defRed_ = cmpGE(
  constellation,
  4,
  prod(afterBurstOn, percent(dm.constellation4.def_red))
)
const c6_charged_dmg_ = cmpGE(
  constellation,
  6,
  prod(c6On, percent(dm.constellation6.charged_bonus))
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Frostbloom Kamifubuki (burst); C5 Blossom Cloud Irutsuki (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.dmg_.normal.add(a1_naCa_dmg_),
  ownBuff.premod.dmg_.charged.add(a1_naCa_dmg_),
  ownBuff.premod.dmg_.charged.add(c6_charged_dmg_),
  ownBuff.premod.dmg_.cryo.add(afterApplySprint_cryo_dmg_),
  // WR teamBuff.premod.enemyDefRed_ — party-wide enemy shred, not dest-gated.
  enemyDebuff.common.defRed_.add(afterBurst_defRed_),

  // WR infusion.overridableSelf cryo after sprint. infusionPrio has no cryo
  // channel — listing-local `{ ele: 'cryo' }` on NA/CA/plunge.
  dm.normal.hitArr.flatMap((arr, i) => [
    ...dmg(`normal_${i}`, info, 'atk', arr, 'normal'),
    ...dmg(`normal_${i}_cryo`, info, 'atk', arr, 'normal', {
      ele: 'cryo',
      cond: afterSprintInfusionOn,
    }),
  ]),
  dmg('charged', info, 'atk', dm.charged.dmg1, 'charged'),
  dmg('charged_cryo', info, 'atk', dm.charged.dmg1, 'charged', {
    ele: 'cryo',
    cond: afterSprintInfusionOn,
  }),
  Object.entries(dm.plunging).flatMap(([k, v]) => [
    ...dmg(`plunging_${k}`, info, 'atk', v, 'plunging'),
    ...dmg(`plunging_${k}_cryo`, info, 'atk', v, 'plunging', {
      ele: 'cryo',
      cond: afterSprintInfusionOn,
    }),
  ]),
  dmg('skill', info, 'atk', dm.skill.press, 'skill'),
  dmg('burst_cutting', info, 'atk', dm.burst.cutDmg, 'burst'),
  dmg('burst_bloom', info, 'atk', dm.burst.bloomDmg, 'burst'),
  dmg('c2_cutting', info, 'atk', dm.burst.cutDmg, 'burst', {
    baseMulti: percent(dm.constellation2.snowflake),
    cond: cmpGE(constellation, 2, 'infer', ''),
  }),
  dmg('c2_bloom', info, 'atk', dm.burst.bloomDmg, 'burst', {
    baseMulti: percent(dm.constellation2.snowflake),
    cond: cmpGE(constellation, 2, 'infer', ''),
  })
)
