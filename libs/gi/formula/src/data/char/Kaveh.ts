import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allNumConditionals,
  customDmg,
  customHeal,
  customParam,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Kaveh'
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
      skillParam_gen.auto[a++], // 4
    ],
  },
  charged: {
    spin: skillParam_gen.auto[a++],
    final: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
    duration: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    dmg: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    bloom_dmg_: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    cd: skillParam_gen.passive1[0][0],
    heal_eleMas: skillParam_gen.passive1[1][0],
  },
  passive2: {
    maxStacks: skillParam_gen.passive2[0][0],
    eleMas: skillParam_gen.passive2[1][0],
  },
  c1: {
    duration: skillParam_gen.constellation1[0],
    dendro_res_: skillParam_gen.constellation1[1],
    incHeal_: skillParam_gen.constellation1[2],
  },
  c2: {
    atkSPD_: skillParam_gen.constellation2[0],
  },
  c4: {
    bloom_dmg_: skillParam_gen.constellation4[0],
  },
  c6: {
    dmg_: skillParam_gen.constellation6[0],
    cd: skillParam_gen.constellation6[1],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { burst, ascension, constellation },
} = own
// WR cond(key, 'afterBurst' | 'c1AfterSkill'); lookup('a4Stacks') → num 0–4
const { afterBurst, c1AfterSkill } = allBoolConditionals(info.key)
const { a4Stacks } = allNumConditionals(info.key, true, 0, 4)

const afterBurst_bloom_dmg_ = afterBurst.ifOn(
  percent(talentSubscript(burst, dm.burst.bloom_dmg_))
)
const a4_eleMas = afterBurst.ifOn(
  cmpGE(ascension, 4, prod(a4Stacks, dm.passive2.eleMas))
)
const c1AfterSkill_dendro_res_ = c1AfterSkill.ifOn(
  cmpGE(constellation, 1, percent(dm.c1.dendro_res_))
)
const c1AfterSkill_incHeal_ = c1AfterSkill.ifOn(
  cmpGE(constellation, 1, percent(dm.c1.incHeal_))
)
const c2_atkSPD_ = afterBurst.ifOn(
  cmpGE(constellation, 2, percent(dm.c2.atkSPD_))
)
const c4_bloom_dmg_ = cmpGE(constellation, 4, percent(dm.c4.bloom_dmg_))

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Pairidaeza's Dreams (burst); C5 In Ready's Treasuring (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.eleMas.add(a4_eleMas),
  ownBuff.premod.res_.dendro.add(c1AfterSkill_dendro_res_),
  ownBuff.premod.incHeal_.add(c1AfterSkill_incHeal_),
  ownBuff.premod.atkSPD_.add(c2_atkSPD_),
  ownBuff.premod.dmg_.bloom.add(c4_bloom_dmg_),
  teamBuff.premod.dmg_.bloom.add(afterBurst_bloom_dmg_),
  // WR infusion.nonOverridableSelf dendro. infusionPrio has no dendro channel —
  // listing-local `{ ele: 'dendro' }` on afterBurst NA/CA/plunge.

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) => [
    ...dmg(`normal_${i}`, info, 'atk', arr, 'normal'),
    ...dmg(`normal_${i}_dendro`, info, 'atk', arr, 'normal', {
      ele: 'dendro',
      cond: cmpGE(afterBurst.ifOn(1), 1, 'infer', ''),
    }),
  ]),
  dmg('charged_spin', info, 'atk', dm.charged.spin, 'charged'),
  dmg('charged_final', info, 'atk', dm.charged.final, 'charged'),
  dmg('charged_spin_dendro', info, 'atk', dm.charged.spin, 'charged', {
    ele: 'dendro',
    cond: cmpGE(afterBurst.ifOn(1), 1, 'infer', ''),
  }),
  dmg('charged_final_dendro', info, 'atk', dm.charged.final, 'charged', {
    ele: 'dendro',
    cond: cmpGE(afterBurst.ifOn(1), 1, 'infer', ''),
  }),
  Object.entries(dm.plunging).flatMap(([k, v]) => [
    ...dmg(`plunging_${k}`, info, 'atk', v, 'plunging'),
    ...dmg(`plunging_${k}_dendro`, info, 'atk', v, 'plunging', {
      ele: 'dendro',
      cond: cmpGE(afterBurst.ifOn(1), 1, 'infer', ''),
    }),
  ]),
  dmg('skill', info, 'atk', dm.skill.dmg, 'skill'),
  dmg('burst', info, 'atk', dm.burst.dmg, 'burst'),
  customHeal('a1Heal', prod(percent(dm.passive1.heal_eleMas), final.eleMas), {
    cond: cmpGE(ascension, 1, 'infer', ''),
  }),
  customDmg('c6', info.ele, 'elemental', prod(percent(dm.c6.dmg_), final.atk), {
    cond: cmpGE(constellation, 6, 'infer', ''),
  }),

  customParam('charged_stamina', dm.charged.stamina),
  customParam('charged_duration', dm.charged.duration),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
