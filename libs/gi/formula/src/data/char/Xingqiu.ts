import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, min, prod, sum } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  customHeal,
  customParam,
  enemyDebuff,
  own,
  ownBuff,
  percent,
  register,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Xingqiu'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[0], //1
      skillParam_gen.auto[1], //2
      skillParam_gen.auto[2], //3
      // (skillParam_gen.auto[3]),
      skillParam_gen.auto[4], //4
      skillParam_gen.auto[5], //5
      // (skillParam_gen.auto[6]),
    ],
  },
  charged: {
    hit1: skillParam_gen.auto[7],
    hit2: skillParam_gen.auto[8],
    stamina: skillParam_gen.auto[9][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[10],
    low: skillParam_gen.auto[11],
    high: skillParam_gen.auto[12],
  },
  skill: {
    hit1: skillParam_gen.skill[s++],
    hit2: skillParam_gen.skill[s++],
    dmgRed_: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    cost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    healHp_: 0.06,
  },
  passive2: {
    hydro_dmg_: 0.2,
  },
  constellation2: {
    hydro_enemyRes_: -0.15,
    burst_duration: 3,
  },
  constellation4: {
    dmg_: 1.5,
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  premod,
  char: { skill: skillTalent, ascension, constellation },
} = own
// WR cond(key, 'c2' | 'skill' | 'burst')
const { c2, skill, burst } = allBoolConditionals(info.key)

// WR teamBuff dmgRed_ — no Pando tag; listing-only customParam
const skill_dmgRed_ = skill.ifOn(
  sum(
    percent(talentSubscript(skillTalent, dm.skill.dmgRed_)),
    min(percent(0.24), prod(percent(0.2), premod.dmg_.hydro))
  )
)
// WR dmgNode specialMultiplier 1.5 while C4 + burst
const c4_skill_multi = cmpGE(
  constellation,
  4,
  burst.ifOn(percent(dm.constellation4.dmg_), percent(1)),
  percent(1)
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Raincutter (burst); C5 Fatal Rainscreen (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  // A4 Blades Amidst Raindrops — always on at A4 (WR hydro_dmg_)
  ownBuff.premod.dmg_.hydro.add(
    cmpGE(ascension, 4, percent(dm.passive2.hydro_dmg_))
  ),
  // C2 hydro RES shred (WR teamBuff hydro_enemyRes_, keep sign)
  enemyDebuff.common.preRes.hydro.add(
    c2.ifOn(cmpGE(constellation, 2, percent(dm.constellation2.hydro_enemyRes_)))
  ),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_dmg1', info, 'atk', dm.charged.hit1, 'charged'),
  dmg('charged_dmg2', info, 'atk', dm.charged.hit2, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill_press1', info, 'atk', dm.skill.hit1, 'skill', {
    baseMulti: c4_skill_multi,
  }),
  dmg('skill_press2', info, 'atk', dm.skill.hit2, 'skill', {
    baseMulti: c4_skill_multi,
  }),
  dmg('burst', info, 'atk', dm.burst.dmg, 'burst', { ele: 'hydro' }),
  customHeal('a1_heal', prod(percent(dm.passive1.healHp_), final.hp), {
    cond: cmpGE(ascension, 1, 'infer', ''),
  }),

  customParam('skill_dmgRed_', skill_dmgRed_),
  customParam('charged_stamina', dm.charged.stamina),
  customParam('skill_duration', dm.skill.duration),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.cost)
)
