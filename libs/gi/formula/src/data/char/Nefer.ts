import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import type { NumNode } from '@genshin-optimizer/pando/engine'
import { cmpGE, min, prod, sum } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allNumConditionals,
  customDmg,
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

const key: CharacterKey = 'Nefer'
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
      skillParam_gen.auto[a++], // 3x2
      skillParam_gen.auto[a++], // 4
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[a++],
    chargingStam: skillParam_gen.auto[a++][0],
    stam: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    skillDmgAtk: skillParam_gen.skill[s++],
    skillDmgEleMas: skillParam_gen.skill[s++],
    usages: skillParam_gen.skill[s++][0],
    duration: skillParam_gen.skill[s++][0],
    nefer1Atk: skillParam_gen.skill[s++],
    nefer1EleMas: skillParam_gen.skill[s++],
    nefer2Atk: skillParam_gen.skill[s++],
    nefer2EleMas: skillParam_gen.skill[s++],
    shade1: skillParam_gen.skill[s++],
    shade2: skillParam_gen.skill[s++],
    shade3: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    hit1Atk: skillParam_gen.burst[b++],
    hit1EleMas: skillParam_gen.burst[b++],
    hit2Atk: skillParam_gen.burst[b++],
    hit2EleMas: skillParam_gen.burst[b++],
    dmgPerStack: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    maxVeilStacks: skillParam_gen.passive1[0][0],
    veilDuration: skillParam_gen.passive1[1][0],
    maxVeilEleMas: skillParam_gen.passive1[2][0],
    eleMasDuration: skillParam_gen.passive1[3][0],
    conversionDuration: skillParam_gen.passive1[4][0],
    phantasmVeilMult_: skillParam_gen.passive1[5][0],
  },
  passive2: {},
  passive3: {
    base_lunarBloom_dmg_: skillParam_gen.passive3![0][0],
    maxBase_lunarBloom_dmg_: skillParam_gen.passive3![1][0],
  },
  constellation1: {
    lunarbloom_dmgInc: skillParam_gen.constellation1[0],
  },
  constellation2: {
    stackGain: skillParam_gen.constellation2[0],
    durationInc: skillParam_gen.constellation2[1],
    newEleMas: skillParam_gen.constellation2[2],
  },
  constellation4: {
    verdantDewGainSpeed: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
    dendro_enemyRes_: -skillParam_gen.constellation4[2],
  },
  constellation6: {
    nefer2Dmg: skillParam_gen.constellation6[0],
    dmg2: skillParam_gen.constellation6[1],
    lunarbloom_specialDmg_: skillParam_gen.constellation6[2],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill, burst, ascension, constellation },
} = own
// WR cond(key, 'c4ShadowDance') `'on'`
const { c4ShadowDance } = allBoolConditionals(info.key)
// WR lookup(cond(key, 'burstVeilsAbsorbed' | 'a1VeilStacks'), 1..5); 4–5 need C2
const { burstVeilsAbsorbed, a1VeilStacks } = allNumConditionals(
  info.key,
  true,
  0,
  5
)

const veilStacksCapped = (stacks: NumNode) =>
  prod(stacks, cmpGE(stacks, 4, cmpGE(constellation, 2, 1), 1))

const burstVeilsAbsorbed_burst_dmg_ = cmpGE(
  ascension,
  1,
  cmpGE(
    team.common.moonsign,
    2,
    prod(
      veilStacksCapped(burstVeilsAbsorbed),
      percent(talentSubscript(burst, dm.burst.dmgPerStack))
    )
  )
)
const a1VeilStacks_pp_mult_ = sum(
  1,
  cmpGE(
    ascension,
    1,
    cmpGE(
      team.common.moonsign,
      2,
      prod(
        veilStacksCapped(a1VeilStacks),
        percent(dm.passive1.phantasmVeilMult_)
      )
    )
  )
)
const a1VeilStacks_eleMas = cmpGE(
  ascension,
  1,
  cmpGE(
    team.common.moonsign,
    2,
    cmpGE(
      constellation,
      2,
      cmpGE(a1VeilStacks, 5, dm.constellation2.newEleMas),
      cmpGE(a1VeilStacks, 3, dm.passive1.maxVeilEleMas)
    )
  )
)
const a0_lunarbloom_baseDmg_ = min(
  prod(percent(dm.passive3.base_lunarBloom_dmg_), final.eleMas),
  percent(dm.passive3.maxBase_lunarBloom_dmg_)
)
const c1_ppLunarbloom_addlMv = cmpGE(
  constellation,
  1,
  percent(dm.constellation1.lunarbloom_dmgInc)
)
const c4ShadowDance_dendro_enemyRes_ = c4ShadowDance.ifOn(
  cmpGE(constellation, 4, percent(dm.constellation4.dendro_enemyRes_))
)
const c6Gleam_lunarbloom_specialDmg_ = cmpGE(
  constellation,
  6,
  cmpGE(
    team.common.moonsign,
    2,
    percent(dm.constellation6.lunarbloom_specialDmg_)
  )
)

const skillTalentChargedSplit = (atkArr: number[], eleMasArr: number[]) =>
  sum(
    prod(
      final.atk,
      percent(talentSubscript(skill, atkArr)),
      a1VeilStacks_pp_mult_
    ),
    prod(
      final.eleMas,
      percent(talentSubscript(skill, eleMasArr)),
      a1VeilStacks_pp_mult_
    )
  )
const lunarEleMasBase = (mv: NumNode) =>
  prod(final.eleMas, sum(mv, c1_ppLunarbloom_addlMv), a1VeilStacks_pp_mult_)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Deceit Cloaks the Truth (skill); C5 Opportunity Hides in the Margins (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.dmg_.burst.add(burstVeilsAbsorbed_burst_dmg_),
  ownBuff.premod.eleMas.add(a1VeilStacks_eleMas),
  // A0 Moonsign Benediction — WR teamBuff lunarbloom_baseDmg_ (no Pando baseDmg_ tag)
  teamBuff.premod.dmg_.lunarbloom.add(a0_lunarbloom_baseDmg_),
  // C4 Shadow Dance — WR teamBuff.premod.dendro_enemyRes_; keep sign
  enemyDebuff.common.preRes.dendro.add(c4ShadowDance_dendro_enemyRes_),
  // C6 Gleam — WR lunarbloom_specialDmg_ (no Pando specialDmg_ tag)
  ownBuff.premod.dmg_.lunarbloom.add(c6Gleam_lunarbloom_specialDmg_),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  splitScaleDmg(
    'skill_skillDmg',
    info,
    ['atk', 'eleMas'],
    [dm.skill.skillDmgAtk, dm.skill.skillDmgEleMas],
    'skill',
    { baseMulti: a1VeilStacks_pp_mult_ }
  ),
  // WR splitScaleDmgNode(..., 'charged', …, 'skill'): skill talent, charged move
  customDmg(
    'skill_nefer1Dmg',
    info.ele,
    'charged',
    skillTalentChargedSplit(dm.skill.nefer1Atk, dm.skill.nefer1EleMas)
  ),
  customDmg(
    'skill_nefer2Dmg',
    info.ele,
    'charged',
    cmpGE(
      constellation,
      6,
      lunarEleMasBase(percent(dm.constellation6.nefer2Dmg)),
      skillTalentChargedSplit(dm.skill.nefer2Atk, dm.skill.nefer2EleMas)
    )
  ),
  // WR lunarDmgNode (special reaction / transDef / lunarbloom_*). No Pando lunarDmg.
  (
    [
      ['skill_shade1Dmg', dm.skill.shade1],
      ['skill_shade2Dmg', dm.skill.shade2],
      ['skill_shade3Dmg', dm.skill.shade3],
    ] as const
  ).flatMap(([name, arr]) =>
    customDmg(
      name,
      info.ele,
      'elemental',
      lunarEleMasBase(percent(talentSubscript(skill, arr)))
    )
  ),
  splitScaleDmg(
    'burst_hit1',
    info,
    ['atk', 'eleMas'],
    [dm.burst.hit1Atk, dm.burst.hit1EleMas],
    'burst'
  ),
  splitScaleDmg(
    'burst_hit2',
    info,
    ['atk', 'eleMas'],
    [dm.burst.hit2Atk, dm.burst.hit2EleMas],
    'burst'
  ),
  customDmg(
    'c6',
    info.ele,
    'elemental',
    lunarEleMasBase(percent(dm.constellation6.dmg2)),
    { cond: cmpGE(constellation, 6, 'infer', '') }
  ),

  customParam('a0_lunarbloom_baseDmg_', a0_lunarbloom_baseDmg_),
  customParam('a1VeilStacks_eleMas', a1VeilStacks_eleMas, {
    cond: cmpGE(ascension, 1, 'infer', ''),
  }),
  customParam('charged_chargingStam', dm.charged.chargingStam),
  customParam('charged_stam', dm.charged.stam),
  customParam('skill_usages', dm.skill.usages),
  customParam('skill_duration', dm.skill.duration),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
