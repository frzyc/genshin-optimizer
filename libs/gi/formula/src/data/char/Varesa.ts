import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, min, prod } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allNumConditionals,
  customDmg,
  customParam,
  own,
  ownBuff,
  percent,
  register,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Varesa'
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
    dmg: skillParam_gen.auto[a++],
    stam: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  fp: {
    normal: {
      hitArr: [
        skillParam_gen.auto[a++], // 1
        skillParam_gen.auto[a++], // 2
        skillParam_gen.auto[a++], // 3
      ],
    },
    charged: {
      dmg: skillParam_gen.auto[a++],
      stam: skillParam_gen.auto[a++][0],
    },
    plunging: {
      dmg: skillParam_gen.auto[a++],
      low: skillParam_gen.auto[a++],
      high: skillParam_gen.auto[a++],
    },
  },
  skill: {
    rushDmg: skillParam_gen.skill[s++],
    fpRushDmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    nsLimit: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    kickDmg: skillParam_gen.burst[b++],
    fpKickDmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
    volcanoDmg: skillParam_gen.burst[b++],
    volcanoCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    impact_dmgInc: skillParam_gen.passive1[0][0],
    fpImpact_dmgInc: skillParam_gen.passive1[1][0],
    duration: 5,
  },
  passive2: {
    atk_: skillParam_gen.passive2[0][0],
    duration: skillParam_gen.passive2[1][0],
    maxStacks: 2,
  },
  constellation1: {
    impact_dmgInc: skillParam_gen.constellation1[0],
    nsConsumptionDec: skillParam_gen.constellation1[1],
  },
  constellation2: {
    energyRestore: skillParam_gen.constellation2[0],
  },
  constellation4: {
    impact_dmgInc: skillParam_gen.constellation4[0],
    max_dmgInc: skillParam_gen.constellation4[1],
    burst_dmg_: skillParam_gen.constellation4[2],
    duration: 15,
  },
  constellation6: {
    critRate_: skillParam_gen.constellation6[0],
    critDMG_: skillParam_gen.constellation6[1],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { burst, ascension, constellation },
} = own
// WR cond(key, 'a1Rainbow' | 'c4Diligent' | 'c4FpApex') `'on'`
const { a1Rainbow, c4Diligent, c4FpApex } = allBoolConditionals(info.key)
// WR lookup(cond(key, 'a4NsBurst'), 1..2 → n, else 0)
const { a4NsBurst } = allNumConditionals(
  info.key,
  true,
  0,
  dm.passive2.maxStacks
)

// WR threshold(C1, fpImpact 180%, else impact 50%) × ATK. Overlay path plunging_impact.
const a1Rainbow_impact_dmgInc = a1Rainbow.ifOn(
  cmpGE(
    ascension,
    1,
    prod(
      cmpGE(
        constellation,
        1,
        percent(dm.passive1.fpImpact_dmgInc),
        percent(dm.passive1.impact_dmgInc)
      ),
      final.atk
    )
  )
)
const a1Rainbow_fpImpact_dmgInc = a1Rainbow.ifOn(
  cmpGE(ascension, 1, prod(percent(dm.passive1.fpImpact_dmgInc), final.atk))
)
const a4NsBurst_atk_ = cmpGE(
  ascension,
  4,
  prod(a4NsBurst, percent(dm.passive2.atk_))
)
const c4Diligent_impact_dmgInc = c4Diligent.ifOn(
  cmpGE(
    constellation,
    4,
    min(
      prod(percent(dm.constellation4.impact_dmgInc), final.atk),
      dm.constellation4.max_dmgInc
    )
  )
)
const c4FpApex_burst_dmg_ = c4FpApex.ifOn(
  cmpGE(constellation, 4, percent(dm.constellation4.burst_dmg_))
)
const c6_plunging_critRate_ = cmpGE(
  constellation,
  6,
  percent(dm.constellation6.critRate_)
)
const c6_plunging_critDMG_ = cmpGE(
  constellation,
  6,
  percent(dm.constellation6.critDMG_)
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Unbowed Resolve (burst); C5 Thoughts Floating on the Warm Breeze (auto)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.auto.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.atk_.add(a4NsBurst_atk_),
  ownBuff.premod.dmg_.burst.add(c4FpApex_burst_dmg_),
  ownBuff.premod.critRate_.burst.add(c6_plunging_critRate_),
  ownBuff.premod.critDMG_.burst.add(c6_plunging_critDMG_),
  ownBuff.premod.critRate_.plunging.add(c6_plunging_critRate_),
  ownBuff.premod.critDMG_.plunging.add(c6_plunging_critDMG_),

  // Catalyst NA/CA/plunge are already Electro. WR has no infusion.
  // infusionPrio has no electro channel — do not add listing-local electro dupes.
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  // WR extra Fiery Passion / Nightsoul auto tables
  dm.fp.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_fp${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_dmg', info, 'atk', dm.charged.dmg, 'charged'),
  dmg('charged_fpDmg', info, 'atk', dm.fp.charged.dmg, 'charged'),
  dmg('plunging_dmg', info, 'atk', dm.plunging.dmg, 'plunging'),
  dmg(
    'plunging_low',
    info,
    'atk',
    dm.plunging.low,
    'plunging',
    undefined,
    // WR plunging_impact_dmgInc on impact only (not collision)
    ownBuff.formula.base.add(a1Rainbow_impact_dmgInc),
    ownBuff.formula.base.add(c4Diligent_impact_dmgInc)
  ),
  dmg(
    'plunging_high',
    info,
    'atk',
    dm.plunging.high,
    'plunging',
    undefined,
    ownBuff.formula.base.add(a1Rainbow_impact_dmgInc),
    ownBuff.formula.base.add(c4Diligent_impact_dmgInc)
  ),
  dmg('plunging_fpdmg', info, 'atk', dm.fp.plunging.dmg, 'plunging'),
  dmg(
    'plunging_fplow',
    info,
    'atk',
    dm.fp.plunging.low,
    'plunging',
    undefined,
    ownBuff.formula.base.add(a1Rainbow_fpImpact_dmgInc),
    ownBuff.formula.base.add(c4Diligent_impact_dmgInc)
  ),
  dmg(
    'plunging_fphigh',
    info,
    'atk',
    dm.fp.plunging.high,
    'plunging',
    undefined,
    ownBuff.formula.base.add(a1Rainbow_fpImpact_dmgInc),
    ownBuff.formula.base.add(c4Diligent_impact_dmgInc)
  ),
  dmg('skill_rushDmg', info, 'atk', dm.skill.rushDmg, 'skill'),
  dmg('skill_fpRushDmg', info, 'atk', dm.skill.fpRushDmg, 'skill'),
  dmg('burst_kickDmg', info, 'atk', dm.burst.kickDmg, 'burst'),
  dmg('burst_fpKickDmg', info, 'atk', dm.burst.fpKickDmg, 'burst'),
  // WR dmgNode talent=burst, move plunging_impact
  customDmg(
    'burst_volcanoDmg',
    info.ele,
    'plunging',
    prod(percent(talentSubscript(burst, dm.burst.volcanoDmg)), final.atk),
    undefined,
    ownBuff.formula.base.add(
      cmpGE(constellation, 1, a1Rainbow_fpImpact_dmgInc)
    ),
    ownBuff.formula.base.add(c4Diligent_impact_dmgInc),
    ownBuff.premod.dmg_.plunging.add(c4FpApex_burst_dmg_)
  ),
  customParam('a1Rainbow_impact_dmgInc', a1Rainbow_impact_dmgInc),
  customParam('a1Rainbow_fpImpact_dmgInc', a1Rainbow_fpImpact_dmgInc),
  customParam('c4Diligent_impact_dmgInc', c4Diligent_impact_dmgInc),

  customParam('charged_stam', dm.charged.stam),
  customParam('charged_fpStam', dm.fp.charged.stam),
  customParam('skill_duration', dm.skill.duration),
  customParam('skill_nsLimit', dm.skill.nsLimit),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost),
  customParam('burst_volcanoCost', dm.burst.volcanoCost)
)
