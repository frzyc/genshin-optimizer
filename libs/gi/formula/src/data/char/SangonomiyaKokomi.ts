import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod, sum } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  customDmg,
  customHeal,
  customParam,
  own,
  ownBuff,
  percent,
  register,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'SangonomiyaKokomi'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = 0,
  s = 0,
  b = 0,
  c6i = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
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
    heal_: skillParam_gen.skill[s++],
    heal: skillParam_gen.skill[s++],
    dmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    heal_: skillParam_gen.burst[b++],
    heal: skillParam_gen.burst[b++],
    nBonus_: skillParam_gen.burst[b++],
    cBonus_: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
    sBonus_: skillParam_gen.burst[b++],
  },
  p: {
    heal_: 0.25,
    critRate_: -1,
  },
  p2: {
    heal_ratio_: skillParam_gen.passive2[0][0],
  },
  c1: {
    hp_: skillParam_gen.constellation1[0],
  },
  c2: {
    s_heal_: skillParam_gen.constellation2[1],
    nc_heal_: skillParam_gen.constellation2[2],
  },
  c4: {
    atkSPD_: skillParam_gen.constellation4[0],
    energy: skillParam_gen.constellation4[1],
  },
  c6: {
    hp_: skillParam_gen.constellation6[c6i++],
    hydro_: skillParam_gen.constellation6[c6i++],
    duration: skillParam_gen.constellation6[c6i++],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill: skillTalent, burst: burstTalent, ascension, constellation },
} = own
// WR cond(key, 'burst' | 'c2' | 'c6')
const { burst, c2, c6 } = allBoolConditionals(info.key)

// Flawless Strategy (innate): +25% heal_, −100% critRate_. Always on (not A1).
const innateHeal_ = percent(dm.p.heal_)
const innateCritRate_ = percent(dm.p.critRate_)

// WR A4 only on NA/CA HP bonus: heal_ratio_ * premod.heal_.
// Read HP/heal_ at sheet:agg so formula.base writes do not cycle.
const a4_naCa_bonus_ = cmpGE(
  ascension,
  4,
  prod(percent(dm.p2.heal_ratio_), own.premod.heal_.sheet('agg'))
)
const burstNormalDmgInc = burst.ifOn(
  prod(
    own.premod.hp.sheet('agg'),
    sum(percent(talentSubscript(burstTalent, dm.burst.nBonus_)), a4_naCa_bonus_)
  )
)
const burstChargedDmgInc = burst.ifOn(
  prod(
    own.premod.hp.sheet('agg'),
    sum(percent(talentSubscript(burstTalent, dm.burst.cBonus_)), a4_naCa_bonus_)
  )
)
const burstSkillDmgInc = burst.ifOn(
  prod(
    own.premod.hp.sheet('agg'),
    percent(talentSubscript(burstTalent, dm.burst.sBonus_))
  )
)

// WR healNodeTalent overlay premod.healInc — no healInc tag; fold into base.
const c2SkillHeal = c2.ifOn(
  cmpGE(constellation, 2, prod(percent(dm.c2.s_heal_), final.hp))
)
const c2BurstHeal = c2.ifOn(
  cmpGE(constellation, 2, prod(percent(dm.c2.nc_heal_), final.hp))
)

// WR premod.atkSPD_ is C4-only (UI header is burst-gated; data is not).
const c4AtkSpd_ = cmpGE(constellation, 4, percent(dm.c4.atkSPD_))
const c6Hydro_ = c6.ifOn(cmpGE(constellation, 6, percent(dm.c6.hydro_)))

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Nereid's Ascension (burst); C5 Kurage's Oath (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.heal_.add(innateHeal_),
  ownBuff.premod.critRate_.add(innateCritRate_),
  ownBuff.premod.atkSPD_.add(c4AtkSpd_),
  ownBuff.premod.dmg_.hydro.add(c6Hydro_),
  // WR normal_dmgInc / charged_dmgInc / skill_dmgInc → formula.base (no flat dmgInc tag)
  ownBuff.formula.base.normal.add(burstNormalDmgInc),
  ownBuff.formula.base.charged.add(burstChargedDmgInc),
  ownBuff.formula.base.skill.add(burstSkillDmgInc),

  // Formulas — catalyst hydro: NA/CA/plunge inherit hydro
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill', info, 'atk', dm.skill.dmg, 'skill'),
  customHeal(
    'skill_heal',
    sum(
      prod(percent(talentSubscript(skillTalent, dm.skill.heal_)), final.hp),
      talentSubscript(skillTalent, dm.skill.heal),
      c2SkillHeal
    )
  ),
  dmg('burst', info, 'hp', dm.burst.dmg, 'burst'),
  customHeal(
    'burst_heal',
    sum(
      prod(percent(talentSubscript(burstTalent, dm.burst.heal_)), final.hp),
      talentSubscript(burstTalent, dm.burst.heal),
      c2BurstHeal
    )
  ),
  customDmg('c1', info.ele, 'elemental', prod(final.hp, percent(dm.c1.hp_)), {
    cond: cmpGE(constellation, 1, 'infer', ''),
  }),

  customParam('burst_normal_dmgInc', burstNormalDmgInc),
  customParam('burst_charged_dmgInc', burstChargedDmgInc),
  customParam('burst_skill_dmgInc', burstSkillDmgInc),
  customParam('charged_stamina', dm.charged.stamina),
  customParam('skill_duration', dm.skill.duration),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost),
  customParam('c4_energy', dm.c4.energy, {
    cond: cmpGE(constellation, 4, 'infer', ''),
  })
)
