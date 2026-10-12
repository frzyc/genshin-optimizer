import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpEq, cmpGE, min, prod, sum } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allNumConditionals,
  customDmg,
  customHeal,
  customParam,
  enemyDebuff,
  own,
  ownBuff,
  percent,
  register,
  team,
  teamBuff,
} from '../util'
import {
  dataGenToCharInfo,
  dmg,
  entriesForChar,
  splitScaleDmg,
  talentSubscript,
} from './util'

const key: CharacterKey = 'Lauma'
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
    ],
  },
  charged: {
    spiritMoveStam: skillParam_gen.auto[a++][0],
    spiritJumpStam: skillParam_gen.auto[a++][0],
    spiritDuration: skillParam_gen.auto[a++][0],
    spiritCd: skillParam_gen.auto[a++][0],
    spiritcallCost: skillParam_gen.auto[a++][0],
    dmg: skillParam_gen.auto[a++],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    pressDmg: skillParam_gen.skill[s++],
    hold1Dmg: skillParam_gen.skill[s++],
    hold2Dmg: skillParam_gen.skill[s++],
    frostgroveAtkDmg: skillParam_gen.skill[s++],
    frostgroveEleMasDmg: skillParam_gen.skill[s++],
    frostgroveDuration: skillParam_gen.skill[s++][0],
    moonDuration: skillParam_gen.skill[s++][0],
    res_: skillParam_gen.skill[s++].map((v) => -v),
    resDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    stacksGained: skillParam_gen.burst[b++][0],
    moonToPale: skillParam_gen.burst[b++][0],
    bloomDmgInc: skillParam_gen.burst[b++],
    lunarBloomDmgInc: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    bloom_critRate_: skillParam_gen.passive1[0][0],
    bloom_critDMG_: skillParam_gen.passive1[1][0],
    lunarBloom_critRate_: skillParam_gen.passive1[2][0],
    lunarBloom_critDMG_: skillParam_gen.passive1[3][0],
    duration: skillParam_gen.passive1[4][0],
  },
  passive2: {
    skill_dmg_: skillParam_gen.passive2[0][0],
    max_skill_dmg_: skillParam_gen.passive2[1][0],
    charged_cdRed_: skillParam_gen.passive2[2][0],
    max_charged_cdRed_: skillParam_gen.passive2[3][0],
  },
  passive3: {
    base_lunarBloom_dmg_: skillParam_gen.passive3![0][0],
    maxBase_lunarBloom_dmg_: skillParam_gen.passive3![1][0],
  },
  constellation1: {
    duration: skillParam_gen.constellation1[0],
    heal_: skillParam_gen.constellation1[1],
    cd: skillParam_gen.constellation1[2],
    spiritStam_red_: skillParam_gen.constellation1[3],
    spiritDuration_inc: skillParam_gen.constellation1[4],
  },
  constellation2: {
    bloom_dmgInc: skillParam_gen.constellation2[0],
    lunarBloom_dmgInc: skillParam_gen.constellation2[1],
    lunarBloom_dmg_: skillParam_gen.constellation2[2],
  },
  constellation4: {
    energyRegen: skillParam_gen.constellation4[0],
    cd: skillParam_gen.constellation4[1],
  },
  constellation6: {
    dmg1: skillParam_gen.constellation6[0],
    paleStacks: skillParam_gen.constellation6[1],
    paleDurationRefresh: skillParam_gen.constellation6[2],
    triggerQuota: skillParam_gen.constellation6[3],
    dmg2: skillParam_gen.constellation6[4],
    lunarBloom_specialMult_: skillParam_gen.constellation6[5],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill, burst, ascension, constellation },
} = own
// WR cond(key, 'skillAfterHit' | 'burstPaleHymn' | 'a1AfterSkill') `'on'`
const { skillAfterHit, burstPaleHymn, a1AfterSkill } = allBoolConditionals(
  info.key
)
// WR lookup(cond(key, 'skillVerdantDew'), 1..3); default off = 0
const { skillVerdantDew } = allNumConditionals(info.key, true, 0, 3)

const gleam = cmpGE(team.common.moonsign, 2, 1)

const skillAfterHit_res_ = skillAfterHit.ifOn(
  percent(talentSubscript(skill, dm.skill.res_))
)

const burstPaleHymn_bloom_dmgInc = burstPaleHymn.ifOn(
  prod(percent(talentSubscript(burst, dm.burst.bloomDmgInc)), final.eleMas)
)
const burstPaleHymn_lunarbloom_dmgInc = burstPaleHymn.ifOn(
  prod(percent(talentSubscript(burst, dm.burst.lunarBloomDmgInc)), final.eleMas)
)
const c2PaleHymn_bloom_dmgInc = burstPaleHymn.ifOn(
  cmpGE(
    constellation,
    2,
    prod(percent(dm.constellation2.bloom_dmgInc), final.eleMas)
  )
)
const c2PaleHymn_lunarbloom_dmgInc = burstPaleHymn.ifOn(
  cmpGE(
    constellation,
    2,
    prod(percent(dm.constellation2.lunarBloom_dmgInc), final.eleMas)
  )
)
const lunarbloom_dmgInc = sum(
  burstPaleHymn_lunarbloom_dmgInc,
  c2PaleHymn_lunarbloom_dmgInc
)

const a1AfterSkill_bloom_critRate_ = a1AfterSkill.ifOn(
  cmpGE(
    ascension,
    1,
    cmpEq(team.common.moonsign, 1, percent(dm.passive1.bloom_critRate_))
  )
)
const a1AfterSkill_bloom_critDMG_ = a1AfterSkill.ifOn(
  cmpGE(
    ascension,
    1,
    cmpEq(team.common.moonsign, 1, percent(dm.passive1.bloom_critDMG_))
  )
)
const a1AfterSkill_lunarBloom_critRate_ = a1AfterSkill.ifOn(
  cmpGE(
    ascension,
    1,
    cmpGE(gleam, 1, percent(dm.passive1.lunarBloom_critRate_))
  )
)
const a1AfterSkill_lunarBloom_critDMG_ = a1AfterSkill.ifOn(
  cmpGE(ascension, 1, cmpGE(gleam, 1, percent(dm.passive1.lunarBloom_critDMG_)))
)

const a4_skill_dmg_ = cmpGE(
  ascension,
  4,
  min(
    prod(percent(dm.passive2.skill_dmg_), own.premod.eleMas.sheet('agg')),
    percent(dm.passive2.max_skill_dmg_)
  )
)
const a4_charged_cdRed_ = cmpGE(
  ascension,
  4,
  min(
    prod(percent(dm.passive2.charged_cdRed_), own.premod.eleMas.sheet('agg')),
    percent(dm.passive2.max_charged_cdRed_)
  )
)

const a0_lunarbloom_baseDmg_ = min(
  prod(percent(dm.passive3.base_lunarBloom_dmg_), final.eleMas),
  percent(dm.passive3.maxBase_lunarBloom_dmg_)
)

const c2Ascendant_lunarbloom_dmg_ = cmpGE(
  constellation,
  2,
  cmpGE(gleam, 1, percent(dm.constellation2.lunarBloom_dmg_))
)
const c6Ascendant_lunarbloom_specialDmg_ = cmpGE(
  constellation,
  6,
  cmpGE(gleam, 1, percent(dm.constellation6.lunarBloom_specialMult_))
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 "Seek Not to Tread the Sly Fox's Path" (burst); C5 "If Truth May Be Subject to Witness" (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.dmg_.skill.add(a4_skill_dmg_),
  // A0 Moonsign Benediction — WR teamBuff lunarbloom_baseDmg_ (no Pando baseDmg_ tag)
  teamBuff.premod.dmg_.lunarbloom.add(a0_lunarbloom_baseDmg_),
  // C2 Gleam — WR teamBuff lunarbloom_dmg_
  teamBuff.premod.dmg_.lunarbloom.add(c2Ascendant_lunarbloom_dmg_),
  // C6 Gleam — WR lunarbloom_specialDmg_ (no Pando specialDmg_ tag)
  ownBuff.premod.dmg_.lunarbloom.add(c6Ascendant_lunarbloom_specialDmg_),
  // Skill hit RES — WR teamBuff dendro_enemyRes_ / hydro_enemyRes_; dm.skill.res_ already negated
  enemyDebuff.common.preRes.dendro.add(skillAfterHit_res_),
  enemyDebuff.common.preRes.hydro.add(skillAfterHit_res_),
  // A1 Nascent — WR teamBuff bloom/hyperbloom/burgeon crit (nonStack bloomcd → add)
  teamBuff.premod.critRate_.bloom.add(a1AfterSkill_bloom_critRate_),
  teamBuff.premod.critRate_.hyperbloom.add(a1AfterSkill_bloom_critRate_),
  teamBuff.premod.critRate_.burgeon.add(a1AfterSkill_bloom_critRate_),
  teamBuff.premod.critDMG_.bloom.add(a1AfterSkill_bloom_critDMG_),
  teamBuff.premod.critDMG_.hyperbloom.add(a1AfterSkill_bloom_critDMG_),
  teamBuff.premod.critDMG_.burgeon.add(a1AfterSkill_bloom_critDMG_),
  // A1 Gleam — WR teamBuff lunarbloom crit
  teamBuff.premod.critRate_.lunarbloom.add(a1AfterSkill_lunarBloom_critRate_),
  teamBuff.premod.critDMG_.lunarbloom.add(a1AfterSkill_lunarBloom_critDMG_),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill_pressDmg', info, 'atk', dm.skill.pressDmg, 'skill'),
  dmg('skill_hold1Dmg', info, 'atk', dm.skill.hold1Dmg, 'skill'),
  // WR lunarDmgNode (special reaction / transDef / lunarbloom_*). No Pando lunarDmg.
  customDmg(
    'skill_hold2Dmg',
    info.ele,
    'elemental',
    prod(
      final.eleMas,
      skillVerdantDew,
      percent(talentSubscript(skill, dm.skill.hold2Dmg))
    ),
    undefined,
    ownBuff.formula.base.add(lunarbloom_dmgInc)
  ),
  splitScaleDmg(
    'skill_frostgroveDmg',
    info,
    ['atk', 'eleMas'],
    [dm.skill.frostgroveAtkDmg, dm.skill.frostgroveEleMasDmg],
    'skill'
  ),
  customHeal('c1_heal', prod(percent(dm.constellation1.heal_), final.eleMas), {
    cond: cmpGE(constellation, 1, 'infer', ''),
  }),
  customDmg(
    'c6_dmg1',
    info.ele,
    'elemental',
    prod(final.eleMas, percent(dm.constellation6.dmg1)),
    { cond: cmpGE(constellation, 6, 'infer', '') },
    ownBuff.formula.base.add(lunarbloom_dmgInc)
  ),
  customDmg(
    'c6_dmg2',
    info.ele,
    'elemental',
    prod(final.eleMas, percent(dm.constellation6.dmg2)),
    { cond: cmpGE(constellation, 6, 'infer', '') },
    ownBuff.formula.base.add(lunarbloom_dmgInc)
  ),

  customParam('a0_lunarbloom_baseDmg_', a0_lunarbloom_baseDmg_),
  customParam('a4_skill_dmg_', a4_skill_dmg_, {
    cond: cmpGE(ascension, 4, 'infer', ''),
  }),
  customParam('a4_charged_cdRed_', a4_charged_cdRed_, {
    cond: cmpGE(ascension, 4, 'infer', ''),
  }),
  customParam('burstPaleHymn_bloom_dmgInc', burstPaleHymn_bloom_dmgInc),
  customParam('burstPaleHymn_hyperbloom_dmgInc', burstPaleHymn_bloom_dmgInc),
  customParam('burstPaleHymn_burgeon_dmgInc', burstPaleHymn_bloom_dmgInc),
  customParam(
    'burstPaleHymn_lunarbloom_dmgInc',
    burstPaleHymn_lunarbloom_dmgInc
  ),
  customParam('c2PaleHymn_bloom_dmgInc', c2PaleHymn_bloom_dmgInc, {
    cond: cmpGE(constellation, 2, 'infer', ''),
  }),
  customParam('c2PaleHymn_hyperbloom_dmgInc', c2PaleHymn_bloom_dmgInc, {
    cond: cmpGE(constellation, 2, 'infer', ''),
  }),
  customParam('c2PaleHymn_burgeon_dmgInc', c2PaleHymn_bloom_dmgInc, {
    cond: cmpGE(constellation, 2, 'infer', ''),
  }),
  customParam('c2PaleHymn_lunarbloom_dmgInc', c2PaleHymn_lunarbloom_dmgInc, {
    cond: cmpGE(constellation, 2, 'infer', ''),
  }),
  customParam('charged_spiritMoveStam', dm.charged.spiritMoveStam),
  customParam('charged_spiritJumpStam', dm.charged.spiritJumpStam),
  customParam('charged_spiritDuration', dm.charged.spiritDuration),
  customParam('charged_spiritCd', dm.charged.spiritCd),
  customParam('charged_spiritcallCost', dm.charged.spiritcallCost),
  customParam('skill_frostgroveDuration', dm.skill.frostgroveDuration),
  customParam('skill_moonDuration', dm.skill.moonDuration),
  customParam('skill_resDuration', dm.skill.resDuration),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_stacksGained', dm.burst.stacksGained),
  customParam('burst_moonToPale', dm.burst.moonToPale),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost),
  customParam('c1_spiritStam_red_', dm.constellation1.spiritStam_red_, {
    cond: cmpGE(constellation, 1, 'infer', ''),
  }),
  customParam('c1_spiritDuration_inc', dm.constellation1.spiritDuration_inc, {
    cond: cmpGE(constellation, 1, 'infer', ''),
  })
)
