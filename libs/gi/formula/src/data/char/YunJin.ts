import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod, subscript, sum } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  customParam,
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
  shield,
  talentSubscript,
} from './util'

const key: CharacterKey = 'YunJin'
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
      skillParam_gen.auto[a++], // 3.1
      skillParam_gen.auto[a++], // 3.2
      skillParam_gen.auto[a++], // 4.1
      skillParam_gen.auto[a++], // 4.2
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
    shield_: skillParam_gen.skill[s++],
    shield: skillParam_gen.skill[s++],
    dmg: skillParam_gen.skill[s++],
    dmg1: skillParam_gen.skill[s++],
    dmg2: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    dmgInc: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
    triggerNum: skillParam_gen.burst[b++][0],
  },
  passive2: {
    dmgInc: skillParam_gen.passive2.map((a) => a[0]),
  },
  constellation2: {
    normalInc: skillParam_gen.constellation2[0],
  },
  constellation4: {
    def_: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
  },
  constellation6: {
    atkSpd: skillParam_gen.constellation6[0],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  char: { burst, ascension, constellation },
} = own
// WR cond(key, 'skill' | 'c4') — burst flying-cloud toggle is named `skill`.
const { skill, c4 } = allBoolConditionals(info.key)

// WR A4: subscript(sum(tally[ele]>=1), [0, ...passive2]). Distinct elements.
const a4_normal_dmgInc_ = cmpGE(
  ascension,
  4,
  percent(subscript(own.common.eleCount, [0, ...dm.passive2.dmgInc]))
)
// WR teamBuff.premod.normal_dmgInc = prod(premod.def, burst% + A4).
// Read DEF at sheet:agg so this formula.base write does not cycle.
const flyingCloud_normal_base = skill.ifOn(
  prod(
    own.premod.def.sheet('agg'),
    sum(percent(talentSubscript(burst, dm.burst.dmgInc)), a4_normal_dmgInc_)
  )
)
const c2_normal_dmg_ = skill.ifOn(
  cmpGE(constellation, 2, percent(dm.constellation2.normalInc))
)
const c4_def_ = c4.ifOn(
  cmpGE(constellation, 4, percent(dm.constellation4.def_))
)
const c6_atkSPD_ = skill.ifOn(
  cmpGE(constellation, 6, percent(dm.constellation6.atkSpd))
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Cliffbreaker's Banner (burst); C5 Opening Flourish (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  // WR teamBuff is whole-party Flying Cloud — not dest-gated.
  teamBuff.formula.base.normal.add(flyingCloud_normal_base),
  teamBuff.premod.dmg_.normal.add(c2_normal_dmg_),
  teamBuff.premod.atkSPD_.add(c6_atkSPD_),
  ownBuff.premod.def_.add(c4_def_),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill', info, 'def', dm.skill.dmg, 'skill'),
  dmg('skill_dmg1', info, 'def', dm.skill.dmg1, 'skill'),
  dmg('skill_dmg2', info, 'def', dm.skill.dmg2, 'skill'),
  shield('skill_shield', 'hp', dm.skill.shield_, dm.skill.shield, 'skill', {
    ele: 'geo',
  }),
  dmg('burst', info, 'atk', dm.burst.dmg, 'burst'),
  customParam('burst_dmgInc', flyingCloud_normal_base)
)
