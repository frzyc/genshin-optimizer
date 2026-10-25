import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpEq, cmpGE, cmpLT, prod, sum } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  customHeal,
  customParam,
  enemyDebuff,
  own,
  ownBuff,
  percent,
  register,
  target,
  team,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Xilonen'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = -1,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[++a], // 1
      skillParam_gen.auto[(a += 2)], // 2x2
      skillParam_gen.auto[++a], // 3
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[++a],
    stam: skillParam_gen.auto[++a][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[++a],
    low: skillParam_gen.auto[++a],
    high: skillParam_gen.auto[++a],
  },
  nightsoul: {
    hitArr: [
      skillParam_gen.auto[++a],
      skillParam_gen.auto[++a],
      skillParam_gen.auto[++a],
      skillParam_gen.auto[++a],
    ],
  },
  skill: {
    rushDmg: skillParam_gen.skill[s++],
    enemyRes_: skillParam_gen.skill[s++].map((val) => -val),
    sourceDuration: skillParam_gen.skill[s++][0],
    nsPointTimeLimit: skillParam_gen.skill[s++][0],
    nsPointLimit: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    healMult: skillParam_gen.burst[b++],
    healFlat: skillParam_gen.burst[b++],
    healDuration: skillParam_gen.burst[b++][0],
    beatDmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    nsPointGain: skillParam_gen.passive1[0][0],
    dmg_: skillParam_gen.passive1[1][0],
  },
  passive2: {
    cd: skillParam_gen.passive2[0][0],
    def_: skillParam_gen.passive2[1][0],
    duration: skillParam_gen.passive2[2][0],
  },
  constellation1: {
    nsPointConsumeReduce: skillParam_gen.constellation1[0],
  },
  constellation2: {
    pyro_atk_: skillParam_gen.constellation2[0],
    hydro_hp_: skillParam_gen.constellation2[1],
    cryo_critDMG_: skillParam_gen.constellation2[2],
    geo_critDMG_: skillParam_gen.constellation2[3],
    electro_energy: skillParam_gen.constellation2[4],
    electro_burstCdReduce: skillParam_gen.constellation2[5],
  },
  constellation4: {
    dmgInc: skillParam_gen.constellation4[0],
    triggerQuota: skillParam_gen.constellation4[1],
    duration: skillParam_gen.constellation4[2],
  },
  constellation6: {
    duration: skillParam_gen.constellation6[0],
    dmgInc: skillParam_gen.constellation6[1],
    cd: skillParam_gen.constellation6[2],
    heal: skillParam_gen.constellation6[3],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill, burst, ascension, constellation },
} = own
// WR cond(key, 'sourceActive' | 'nsBlessing' | 'nsBurst' | 'c4Blooming' | 'c6Imperishable')
const { sourceActive, nsBlessing, nsBurst, c4Blooming, c6Imperishable } =
  allBoolConditionals(info.key)

const buffableEle = ['pyro', 'hydro', 'cryo', 'electro'] as const
const convertedSources = sum(
  ...buffableEle.map((ele) => team.common.count[ele])
)
const geoSourcePossible = cmpLT(convertedSources, 3, 1)
const skill_enemyRes_ = percent(talentSubscript(skill, dm.skill.enemyRes_))
// Geo sample: sourceActive OR nsBlessing OR C2, and at least one unconverted sampler.
const sourceActive_geo_enemyRes_ = cmpGE(
  sum(sourceActive.ifOn(1), nsBlessing.ifOn(1), cmpGE(constellation, 2, 1)),
  1,
  prod(geoSourcePossible, skill_enemyRes_)
)

const a1_normal_dmg_ = nsBlessing.ifOn(
  cmpGE(ascension, 1, cmpLT(convertedSources, 2, percent(dm.passive1.dmg_)))
)
const a4_nsBurst_def_ = nsBurst.ifOn(
  cmpGE(ascension, 4, percent(dm.passive2.def_))
)

// C2 teamBuffs are `equal(target.charEle, …)` (HakushinRing), not destIsActive.
const c2_sourceActive_geo_all_dmg_ = prod(
  cmpGE(
    constellation,
    2,
    cmpLT(
      sourceActive_geo_enemyRes_,
      -0.01,
      percent(dm.constellation2.geo_critDMG_)
    )
  ),
  cmpEq(target.char.ele, 'geo', 1)
)
const c2_sourceActive_pyro_atk_ = prod(
  sourceActive.ifOn(
    cmpGE(
      constellation,
      2,
      cmpGE(team.common.count.pyro, 1, percent(dm.constellation2.pyro_atk_))
    )
  ),
  cmpEq(target.char.ele, 'pyro', 1)
)
const c2_sourceActive_hydro_hp_ = prod(
  sourceActive.ifOn(
    cmpGE(
      constellation,
      2,
      cmpGE(team.common.count.hydro, 1, percent(dm.constellation2.hydro_hp_))
    )
  ),
  cmpEq(target.char.ele, 'hydro', 1)
)
const c2_sourceActive_cryo_critDMG_ = prod(
  sourceActive.ifOn(
    cmpGE(
      constellation,
      2,
      cmpGE(team.common.count.cryo, 1, percent(dm.constellation2.cryo_critDMG_))
    )
  ),
  cmpEq(target.char.ele, 'cryo', 1)
)

// WR prod(percent(dmgInc), total.def). Read premod.def@agg so formula.base cannot cycle.
const c4_naCaPlunge_dmgInc = c4Blooming.ifOn(
  cmpGE(
    constellation,
    4,
    prod(percent(dm.constellation4.dmgInc), own.premod.def.sheet('agg'))
  )
)
const c6Imperishable_dmgInc = c6Imperishable.ifOn(
  cmpGE(
    constellation,
    6,
    prod(percent(dm.constellation6.dmgInc), own.premod.def.sheet('agg'))
  )
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Yohual's Scratch (skill); C5 Ocelotlicue Point! (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.dmg_.normal.add(a1_normal_dmg_),
  ownBuff.premod.dmg_.plunging.add(a1_normal_dmg_),
  ownBuff.premod.def_.add(a4_nsBurst_def_),
  ownBuff.formula.base.normal.add(c6Imperishable_dmgInc),
  ownBuff.formula.base.plunging.add(c6Imperishable_dmgInc),

  // WR teamBuff.premod.*_enemyRes_ (attacker tag); Pando enemy preRes. Keep WR sign.
  enemyDebuff.common.preRes.geo.add(sourceActive_geo_enemyRes_),
  ...buffableEle.map((ele) =>
    enemyDebuff.common.preRes[ele].add(
      sourceActive.ifOn(cmpGE(team.common.count[ele], 1, skill_enemyRes_))
    )
  ),
  // WR all_dmg_ for geo dest; pyro atk_ / hydro hp_ / cryo critDMG_ dest-gated by ele.
  teamBuff.premod.dmg_.add(c2_sourceActive_geo_all_dmg_),
  teamBuff.premod.atk_.add(c2_sourceActive_pyro_atk_),
  teamBuff.premod.hp_.add(c2_sourceActive_hydro_hp_),
  teamBuff.premod.critDMG_.add(c2_sourceActive_cryo_critDMG_),
  teamBuff.formula.base.normal.add(c4_naCaPlunge_dmgInc),
  teamBuff.formula.base.charged.add(c4_naCaPlunge_dmgInc),
  teamBuff.formula.base.plunging.add(c4_naCaPlunge_dmgInc),

  // Formulas — sword NA/CA physical; plunges + kit scale DEF (Noelle).
  // Nightsoul listings: WR infusion.nonOverridableSelf geo → listing ele only.
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dm.nightsoul.hitArr.flatMap((arr, i) =>
    dmg(`normal_ns${i}`, info, 'def', arr, 'normal', { ele: 'geo' })
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'def', v, 'plunging')
  ),
  dmg('plunging_ns_dmg', info, 'def', dm.plunging.dmg, 'plunging', {
    ele: 'geo',
  }),
  dmg('plunging_ns_low', info, 'def', dm.plunging.low, 'plunging', {
    ele: 'geo',
  }),
  dmg('plunging_ns_high', info, 'def', dm.plunging.high, 'plunging', {
    ele: 'geo',
  }),
  dmg('skill', info, 'def', dm.skill.rushDmg, 'skill'),
  dmg('burst', info, 'def', dm.burst.skillDmg, 'burst'),
  customHeal(
    'burst_heal',
    sum(
      prod(percent(talentSubscript(burst, dm.burst.healMult)), final.def),
      talentSubscript(burst, dm.burst.healFlat)
    )
  ),
  dmg('burst_beat', info, 'def', dm.burst.beatDmg, 'burst'),
  customHeal('c6_heal', prod(percent(dm.constellation6.heal), final.def), {
    cond: cmpGE(constellation, 6, 'infer', ''),
  }),
  customParam('c6Imperishable_normal_dmgInc', c6Imperishable_dmgInc),
  customParam('c6Imperishable_plunging_dmgInc', c6Imperishable_dmgInc),

  customParam('charged_stam', dm.charged.stam),
  customParam('skill_sourceDuration', dm.skill.sourceDuration),
  customParam('skill_nsPointTimeLimit', dm.skill.nsPointTimeLimit),
  customParam('skill_nsPointLimit', dm.skill.nsPointLimit),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_healDuration', dm.burst.healDuration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
