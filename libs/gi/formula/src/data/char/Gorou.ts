import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod, subscript, sum } from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import {
  allListConditionals,
  customHeal,
  customParam,
  own,
  ownBuff,
  percent,
  register,
  team,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Gorou'
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
    aimed: skillParam_gen.auto[a++], // Aimed
    fully: skillParam_gen.auto[a++], // Fully-charged
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    dmg: skillParam_gen.skill[s++],
    defInc: skillParam_gen.skill[s++],
    geo_dmg_: skillParam_gen.skill[s++][0],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg_def: skillParam_gen.burst[b++],
    crystalDmg_def: skillParam_gen.burst[b++],
    crystalHits: 6,
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    def_: skillParam_gen.passive1[0][0],
    duration: skillParam_gen.passive1[1][0],
  },
  passive2: {
    skill_dmgInc: skillParam_gen.passive2[0][0],
    burst_dmgInc: skillParam_gen.passive2[1][0],
  },
  constellation4: {
    heal_def_: skillParam_gen.constellation4[0],
  },
  constellation6: {
    geo_critDMG_: [
      skillParam_gen.constellation6[0],
      skillParam_gen.constellation6[1],
      skillParam_gen.constellation6[2],
      skillParam_gen.constellation6[2],
    ] as number[],
    duration: skillParam_gen.constellation6[3],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill, ascension, constellation },
} = own
// WR cond(key, 'inField' | 'afterBurst' | 'afterSkillBurst') — states are not `'on'`.
const { inField } = allListConditionals(info.key, ['inField'])
const { afterBurst } = allListConditionals(info.key, ['afterBurst'])
const { afterSkillBurst } = allListConditionals(info.key, ['afterSkillBurst'])

const inFieldOn = inField.map({ inField: 1 })
const geoCount = team.common.count.geo
// WR equal(activeCharKey, target.charKey, …) — dest-gated banner.
const skill1_def = prod(
  inFieldOn,
  cmpGE(geoCount, 1, talentSubscript(skill, dm.skill.defInc)),
  destIsActive
)
const skill3_geo_dmg_ = prod(
  inFieldOn,
  cmpGE(geoCount, 3, percent(dm.skill.geo_dmg_)),
  destIsActive
)
// WR A1: whole team, not dest-gated.
const afterBurst_def_ = prod(
  afterBurst.map({ afterBurst: 1 }),
  cmpGE(ascension, 1, percent(dm.passive1.def_))
)
// WR prod(total.def, dm). Read premod.def@agg so this formula.base write cannot cycle.
const a4_skill_dmgInc = cmpGE(
  ascension,
  4,
  prod(percent(dm.passive2.skill_dmgInc), own.premod.def.sheet('agg'))
)
const a4_burst_dmgInc = cmpGE(
  ascension,
  4,
  prod(percent(dm.passive2.burst_dmgInc), own.premod.def.sheet('agg'))
)
// WR geo_critDMG_ via subscript(tally.geo - 1). No prior `critDMG_.geo` writes; Read.ele.
const c6_geo_critDMG_ = prod(
  afterSkillBurst.map({ afterSkillBurst: 1 }),
  cmpGE(
    constellation,
    6,
    percent(subscript(sum(geoCount, -1), dm.constellation6.geo_critDMG_))
  )
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Inuzaka All-Round Defense (skill); C5 Juuga (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  teamBuff.premod.def.add(skill1_def),
  teamBuff.premod.dmg_.geo.add(skill3_geo_dmg_),
  teamBuff.premod.def_.add(afterBurst_def_),
  teamBuff.premod.critDMG_.geo.add(c6_geo_critDMG_),
  ownBuff.formula.base.skill.add(a4_skill_dmgInc),
  ownBuff.formula.base.burst.add(a4_burst_dmgInc),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_aimed', info, 'atk', dm.charged.aimed, 'charged', {
    ele: 'physical',
  }),
  dmg('charged_aimedCharged', info, 'atk', dm.charged.fully, 'charged', {
    ele: 'geo',
  }),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill', info, 'atk', dm.skill.dmg, 'skill'),
  dmg('burst', info, 'def', dm.burst.dmg_def, 'burst'),
  dmg('crystalCollapse', info, 'def', dm.burst.crystalDmg_def, 'burst'),
  customHeal('c4_heal', prod(percent(dm.constellation4.heal_def_), final.def), {
    cond: cmpGE(constellation, 4, 'infer', ''),
  }),

  customParam('skill_duration', dm.skill.duration),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
