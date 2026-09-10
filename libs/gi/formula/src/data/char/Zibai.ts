import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, min, prod, sum } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allNumConditionals,
  customDmg,
  customParam,
  own,
  ownBuff,
  percent,
  register,
  team,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Zibai'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = -1,
  s = -1,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[++a], // 1
      skillParam_gen.auto[++a], // 2
      skillParam_gen.auto[(a += 2)], // 3x2
      skillParam_gen.auto[++a], // 4
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[(a += 2)], // x2
    stam: skillParam_gen.auto[++a][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[++a],
    low: skillParam_gen.auto[++a],
    high: skillParam_gen.auto[++a],
  },
  skill: {
    stride1Dmg: skillParam_gen.skill[++s],
    stride2Dmg: skillParam_gen.skill[++s],
    shift4GleamDmg: skillParam_gen.skill[++s],
    duration: skillParam_gen.skill[++s][0],
    cd: skillParam_gen.skill[++s][0],
    shift1Dmg: skillParam_gen.skill[++s],
    shift2Dmg: skillParam_gen.skill[++s],
    shift3Dmg: skillParam_gen.skill[(s += 2)], // x2
    shift4Dmg: skillParam_gen.skill[++s],
    shiftCaDmg: skillParam_gen.skill[(s += 2)], // x2
  },
  burst: {
    skill1Dmg: skillParam_gen.burst[b++],
    skill2Dmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    stride_dmgInc: skillParam_gen.passive1[0][0],
    duration: skillParam_gen.passive1[1][0],
  },
  passive2: {
    geo_def_: skillParam_gen.passive2[0][0],
    hydro_eleMas: skillParam_gen.passive2[1][0],
  },
  passive3: {
    base_lunarcrystallize_dmg_: skillParam_gen.passive3![0][0],
    maxBase_lunarcrystallize_dmg_: skillParam_gen.passive3![1][0],
  },
  constellation1: {
    stride_lunarcrystallize_dmg_: skillParam_gen.constellation1[0],
  },
  constellation2: {
    lunarcrystallize_dmg_: skillParam_gen.constellation2[0],
    stride_dmgInc: skillParam_gen.constellation2[1],
  },
  constellation4: {
    shift4_mult_: skillParam_gen.constellation4[0],
  },
  constellation6: {
    stride_lunarcrystallize_dmg_: skillParam_gen.constellation6[0],
    duration: 3,
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill, burst, ascension, constellation },
} = own
// WR cond(key, 'a1Moonfall' | 'c1FirstStride' | 'c2ShiftMode' | 'c4Splendor')
const { a1Moonfall, c1FirstStride, c2ShiftMode, c4Splendor } =
  allBoolConditionals(info.key)
// WR lookup(cond(key, 'c6Point'), 1..30 → n, else 0)
const { c6Point } = allNumConditionals(info.key, true, 0, 30)

const a0_lunarcrystallize_baseDmg_ = min(
  prod(final.def, 1 / 100, percent(dm.passive3.base_lunarcrystallize_dmg_)),
  percent(dm.passive3.maxBase_lunarcrystallize_dmg_)
)
const a1Moonfall_stride_dmgInc = a1Moonfall.ifOn(
  cmpGE(ascension, 1, prod(percent(dm.passive1.stride_dmgInc), final.def))
)
const a4Geo_def_ = cmpGE(
  ascension,
  4,
  prod(sum(team.common.count.geo, -1), percent(dm.passive2.geo_def_))
)
const a4Hydro_eleMas = cmpGE(
  ascension,
  4,
  prod(team.common.count.hydro, dm.passive2.hydro_eleMas)
)
const c1FirstStride_stride_lunarcrystallize_dmg_ = c1FirstStride.ifOn(
  cmpGE(
    constellation,
    1,
    percent(dm.constellation1.stride_lunarcrystallize_dmg_)
  )
)
const c2ShiftMode_lunarcrystallize_dmg_ = c2ShiftMode.ifOn(
  cmpGE(constellation, 2, percent(dm.constellation2.lunarcrystallize_dmg_))
)
const c2Moonfall_stride_dmgInc = a1Moonfall.ifOn(
  cmpGE(
    constellation,
    2,
    cmpGE(
      ascension,
      1,
      cmpGE(
        team.common.moonsign,
        2,
        prod(percent(dm.constellation2.stride_dmgInc), final.def)
      )
    )
  )
)
const stride_dmgInc = sum(a1Moonfall_stride_dmgInc, c2Moonfall_stride_dmgInc)
const c4Splendor_shift_mult_ = sum(
  1,
  c4Splendor.ifOn(
    cmpGE(constellation, 4, percent(dm.constellation4.shift4_mult_ - 1))
  )
)
const c6Point_lunar_specialDmg_ = cmpGE(
  constellation,
  6,
  prod(percent(dm.constellation6.stride_lunarcrystallize_dmg_), c6Point)
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Free From Constraints and Worldly Ties (skill); C5 Perceive the Worthless and Debate It Not (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  // A4 Layered Peaks — WR other geo (tally.geo - 1) def_; hydro count EM
  ownBuff.premod.def_.add(a4Geo_def_),
  ownBuff.premod.eleMas.add(a4Hydro_eleMas),
  // A0 Moonsign Benediction — WR teamBuff lunarcrystallize_baseDmg_ (no Pando baseDmg_ tag)
  teamBuff.premod.dmg_.lunarcrystallize.add(a0_lunarcrystallize_baseDmg_),
  // C2 Shift mode — WR teamBuff lunarcrystallize_dmg_
  teamBuff.premod.dmg_.lunarcrystallize.add(c2ShiftMode_lunarcrystallize_dmg_),
  // C6 — WR lunarcrystallize_specialDmg_ (no Pando specialDmg_ tag)
  ownBuff.premod.dmg_.lunarcrystallize.add(c6Point_lunar_specialDmg_),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  // WR dmgNode(..., hitEle.geo, undefined, 'skill'): separate Shift listings, not infusion.
  (
    [
      ['skill_shift1Dmg', dm.skill.shift1Dmg, 'normal'],
      ['skill_shift2Dmg', dm.skill.shift2Dmg, 'normal'],
      ['skill_shift3Dmg', dm.skill.shift3Dmg, 'normal'],
      ['skill_shift4Dmg', dm.skill.shift4Dmg, 'normal'],
      ['skill_shiftCaDmg', dm.skill.shiftCaDmg, 'charged'],
    ] as const
  ).flatMap(([name, arr, move]) =>
    customDmg(
      name,
      info.ele,
      move,
      prod(final.def, percent(talentSubscript(skill, arr)))
    )
  ),
  dmg('skill_stride1Dmg', info, 'def', dm.skill.stride1Dmg, 'skill'),
  // WR lunarDmgNode (special reaction ×3 / transDef / lunarcrystallize_*). No Pando lunarDmg.
  // WR strideAddl: lunarcrystallize_dmgInc + lunarcrystallize_dmg_ on stride hits;
  // only stride2 (lunar) reads them. dmgInc → formula.base; dmg_ → name-scoped dmg_.skill.
  customDmg(
    'skill_stride2Dmg',
    info.ele,
    'skill',
    prod(final.def, percent(talentSubscript(skill, dm.skill.stride2Dmg))),
    undefined,
    ownBuff.formula.base.add(stride_dmgInc),
    ownBuff.premod.dmg_.skill.add(c1FirstStride_stride_lunarcrystallize_dmg_)
  ),
  customDmg(
    'skill_shift4GleamDmg',
    info.ele,
    'normal',
    prod(
      final.def,
      percent(talentSubscript(skill, dm.skill.shift4GleamDmg)),
      cmpGE(team.common.moonsign, 2, 1),
      c4Splendor_shift_mult_
    )
  ),
  dmg('burst_skill1Dmg', info, 'def', dm.burst.skill1Dmg, 'burst'),
  customDmg(
    'burst_skill2Dmg',
    info.ele,
    'burst',
    prod(final.def, percent(talentSubscript(burst, dm.burst.skill2Dmg)))
  ),

  customParam('a1Moonfall_stride_dmgInc', a1Moonfall_stride_dmgInc, {
    cond: cmpGE(ascension, 1, 'infer', ''),
  }),
  customParam('a0_lunarcrystallize_baseDmg_', a0_lunarcrystallize_baseDmg_),
  customParam('c2Moonfall_stride_dmgInc', c2Moonfall_stride_dmgInc, {
    cond: cmpGE(constellation, 2, 'infer', ''),
  }),
  customParam('charged_stam', dm.charged.stam),
  customParam('skill_duration', dm.skill.duration),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
