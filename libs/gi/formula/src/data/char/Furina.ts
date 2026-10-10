import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, max, min, prod, sum } from '@genshin-optimizer/pando/engine'
import { infusionPrio } from '../common/dmg'
import {
  allBoolConditionals,
  allNumConditionals,
  customHeal,
  customParam,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Furina'
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
    bladeThornDmg: skillParam_gen.auto[9],
    bladeThornInterval: skillParam_gen.auto[10][0],
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
  skill: {
    bubbleDmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    usherDmg: skillParam_gen.skill[s++],
    chevalDmg: skillParam_gen.skill[s++],
    crabDmg: skillParam_gen.skill[s++],
    usherHp: skillParam_gen.skill[s++][0],
    chevalHp: skillParam_gen.skill[s++][0],
    crabHp: skillParam_gen.skill[s++][0],
    streamsHealBase: skillParam_gen.skill[s++],
    streamsHealFlat: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    fanfarePerHp: skillParam_gen.burst[b++][0],
    maxFanfare: skillParam_gen.burst[b++][0],
    dmgIncRatio: skillParam_gen.burst[b++],
    heal_ratio: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    duration: skillParam_gen.passive1[0][0],
    interval: skillParam_gen.passive1[1][0],
    heal: skillParam_gen.passive1[2][0],
  },
  passive2: {
    member_dmg_: skillParam_gen.passive2[0][0],
    max_member_dmg_: skillParam_gen.passive2[1][0],
    interval_dec_: skillParam_gen.passive2[2][0],
    max_interval_dec_: skillParam_gen.passive2[3][0],
  },
  constellation1: {
    bonusFanfare: skillParam_gen.constellation1[0],
    fanfareLimitInc: skillParam_gen.constellation1[1],
  },
  constellation2: {
    idk: skillParam_gen.constellation2[0],
    hp_: skillParam_gen.constellation2[1],
    stacks: skillParam_gen.constellation2[2],
    fanfare_gain_: skillParam_gen.constellation2[3],
    max_hp_: skillParam_gen.constellation2[4],
  },
  constellation4: {
    energyRegen: skillParam_gen.constellation4[0],
    cd: skillParam_gen.constellation4[1],
  },
  constellation6: {
    duration: skillParam_gen.constellation6[0],
    auto_dmgInc: skillParam_gen.constellation6[1],
    ousiaCd: skillParam_gen.constellation6[2],
    ousiaHeal: skillParam_gen.constellation6[3],
    ousiaDuration: skillParam_gen.constellation6[4],
    pneumaHpCost: skillParam_gen.constellation6[5],
    pneumaAuto_dmgInc: skillParam_gen.constellation6[6],
    triggers: skillParam_gen.constellation6[7],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill, burst, ascension, constellation },
} = own
// WR cond(key, 'skillHpConsumeStacks' | 'burstFanfare' | 'c2Overstack' | 'c6' | 'c6Pneuma')
const { c6, c6Pneuma } = allBoolConditionals(info.key)
const { skillHpConsumeStacks } = allNumConditionals(info.key, true, 0, 4)
const { burstFanfare } = allNumConditionals(
  info.key,
  true,
  0,
  dm.burst.maxFanfare + dm.constellation1.fanfareLimitInc
)
const { c2Overstack } = allNumConditionals(
  info.key,
  true,
  0,
  dm.constellation2.stacks
)

// WR lookup 1–4 → 110/120/130/140%; unset → 1.
const member_mult_ = sum(percent(1), prod(skillHpConsumeStacks, percent(0.1)))
const fanfareCap = sum(
  dm.burst.maxFanfare,
  cmpGE(constellation, 1, dm.constellation1.fanfareLimitInc)
)
const clampedFanfare = min(burstFanfare, fanfareCap)
const burstFanfare_all_dmg_ = prod(
  clampedFanfare,
  percent(talentSubscript(burst, dm.burst.dmgIncRatio))
)
const burstFanfare_incHeal_ = prod(
  clampedFanfare,
  percent(talentSubscript(burst, dm.burst.heal_ratio))
)

const a4Member_dmg_ = cmpGE(
  ascension,
  4,
  min(
    prod(final.hp, 1 / 1000, percent(dm.passive2.member_dmg_)),
    percent(dm.passive2.max_member_dmg_)
  )
)
const a4HealInterval = cmpGE(
  ascension,
  4,
  max(
    prod(final.hp, 1 / 1000, percent(-dm.passive2.interval_dec_)),
    percent(-dm.passive2.max_interval_dec_)
  )
)

const c2Overstack_hp_ = cmpGE(
  constellation,
  2,
  prod(c2Overstack, percent(dm.constellation2.hp_))
)

// WR normal_dmgInc / charged_dmgInc / plunging_dmgInc → formula.base (no flat dmgInc tag)
const c6_auto_dmgInc = cmpGE(
  constellation,
  6,
  c6.ifOn(prod(percent(dm.constellation6.auto_dmgInc), final.hp))
)
const c6Pneuma_auto_dmgInc = cmpGE(
  constellation,
  6,
  c6.ifOn(
    c6Pneuma.ifOn(prod(percent(dm.constellation6.pneumaAuto_dmgInc), final.hp))
  )
)

function salonMember(name: string, table: number[]) {
  return dmg(
    name,
    info,
    'hp',
    table,
    'skill',
    { baseMulti: member_mult_ },
    // WR data() overlay: premod.skill_dmg_ on salon members only
    ownBuff.premod.dmg_.skill.add(a4Member_dmg_)
  )
}

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Let the People Rejoice (burst); C5 Salon Solitaire (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.hp_.add(c2Overstack_hp_),
  // WR teamBuff.premod.all_dmg_ / incHeal_ — whole party, not dest-gated
  teamBuff.premod.dmg_.add(burstFanfare_all_dmg_),
  teamBuff.premod.incHeal_.add(burstFanfare_incHeal_),
  // WR infusion.nonOverridableSelf hydro
  ownBuff.reaction.infusionIndex.add(
    cmpGE(constellation, 6, c6.ifOn(infusionPrio.nonOverridable.hydro))
  ),
  // WR charged_dmgInc = c6 + pneuma; plunging_dmgInc = c6 only (all plunging)
  ownBuff.formula.base.normal.add(c6_auto_dmgInc),
  ownBuff.formula.base.charged.add(sum(c6_auto_dmgInc, c6Pneuma_auto_dmgInc)),
  ownBuff.formula.base.plunging.add(c6_auto_dmgInc),

  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(
      `normal_${i}`,
      info,
      'atk',
      arr,
      'normal',
      undefined,
      // WR overlay: pneuma extra on NA hits, not Arkhe thorn
      ownBuff.formula.base.add(c6Pneuma_auto_dmgInc)
    )
  ),
  dmg('thornBladeDmg', info, 'atk', dm.normal.bladeThornDmg, 'normal', {
    ele: 'hydro',
  }),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  dmg('plunging_dmg', info, 'atk', dm.plunging.dmg, 'plunging'),
  dmg(
    'plunging_low',
    info,
    'atk',
    dm.plunging.low,
    'plunging',
    undefined,
    // WR plunging_impact_dmgInc: pneuma extra on impact only
    ownBuff.formula.base.add(c6Pneuma_auto_dmgInc)
  ),
  dmg(
    'plunging_high',
    info,
    'atk',
    dm.plunging.high,
    'plunging',
    undefined,
    ownBuff.formula.base.add(c6Pneuma_auto_dmgInc)
  ),
  dmg('skill_bubbleDmg', info, 'hp', dm.skill.bubbleDmg, 'skill'),
  salonMember('skill_usherDmg', dm.skill.usherDmg),
  salonMember('skill_chevalDmg', dm.skill.chevalDmg),
  salonMember('skill_crabDmg', dm.skill.crabDmg),
  customHeal(
    'skill_streamsHeal',
    sum(
      prod(percent(talentSubscript(skill, dm.skill.streamsHealBase)), final.hp),
      talentSubscript(skill, dm.skill.streamsHealFlat)
    )
  ),
  dmg('burst_skillDmg', info, 'hp', dm.burst.skillDmg, 'burst'),
  customHeal('a1_heal', prod(percent(dm.passive1.heal), final.hp), {
    cond: cmpGE(ascension, 1, 'infer', ''),
  }),
  customHeal('c6_heal', prod(percent(dm.constellation6.ousiaHeal), final.hp), {
    cond: cmpGE(constellation, 6, 'infer', ''),
  }),

  customParam('a4_member_dmg_', a4Member_dmg_, {
    cond: cmpGE(ascension, 4, 'infer', ''),
  }),
  customParam('a4_healInterval', a4HealInterval, {
    cond: cmpGE(ascension, 4, 'infer', ''),
  }),
  customParam('charged_stam', dm.charged.stam),
  customParam('bladeThornInterval', dm.normal.bladeThornInterval),
  customParam('skill_duration', dm.skill.duration),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
