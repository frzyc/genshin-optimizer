import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod, sum } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allListConditionals,
  customDmg,
  customParam,
  enemyDebuff,
  notOwnBuff,
  own,
  ownBuff,
  percent,
  register,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'RaidenShogun'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = 0,
  s = 0,
  b = 0,
  p2 = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3
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
    skillDmg: skillParam_gen.skill[s++],
    coorDmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    burstDmg_bonus: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    resolveBonus1: skillParam_gen.burst[b++],
    resolveBonus2: skillParam_gen.burst[b++],
    resolveGained: skillParam_gen.burst[b++],
    hit1: skillParam_gen.burst[b++],
    hit2: skillParam_gen.burst[b++],
    hit3: skillParam_gen.burst[b++],
    hit41: skillParam_gen.burst[b++],
    hit42: skillParam_gen.burst[b++],
    hit5: skillParam_gen.burst[b++],
    charged1: skillParam_gen.burst[b++],
    charged2: skillParam_gen.burst[b++],
    stam: skillParam_gen.burst[b++][0],
    plunge: skillParam_gen.burst[b++],
    plungeLow: skillParam_gen.burst[b++],
    plungeHigh: skillParam_gen.burst[b++],
    enerGen: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive2: {
    er: skillParam_gen.passive2[p2++][0],
    energyGen: skillParam_gen.passive2[p2++][0],
    electroDmg_bonus: skillParam_gen.passive2[p2++][0],
  },
  constellation2: {
    def_ignore: skillParam_gen.constellation2[0],
  },
  constellation4: {
    atk_bonus: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
  },
} as const

const energyCosts = ['40', '50', '60', '70', '80', '90'] as const
const resolveStacksArr = ['10', '20', '30', '40', '50', '60'] as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill, burst, ascension, constellation },
} = own
// WR cond(key, 'InBurst') `'on'`; skillEye/c4 states are `'skillEye'` / `'c4'`.
const { InBurst } = allBoolConditionals(info.key)
const { skillEye } = allListConditionals(info.key, ['skillEye'])
const { c4 } = allListConditionals(info.key, ['c4'])
const { skillEyeTeam } = allListConditionals(info.key, [...energyCosts])
const { burstResolve } = allListConditionals(info.key, [...resolveStacksArr])
const skillEyeOn = skillEye.map({ skillEye: 1 })
const c4On = c4.map({ c4: 1 })

const burstDmgPerEnergy = percent(
  talentSubscript(skill, dm.skill.burstDmg_bonus)
)
const skillEye_burst_dmg_ = prod(
  skillEyeOn,
  dm.burst.enerCost,
  burstDmgPerEnergy
)
const skillEyeTeamEnergy = skillEyeTeam.map({
  '40': 40,
  '50': 50,
  '60': 60,
  '70': 70,
  '80': 80,
  '90': 90,
})
const skillEyeTeam_burst_dmg_ = prod(skillEyeTeamEnergy, burstDmgPerEnergy)
const resolveStacks = burstResolve.map({
  '10': 10,
  '20': 20,
  '30': 30,
  '40': 40,
  '50': 50,
  '60': 60,
})
const resolveInitialBonus_ = prod(
  percent(talentSubscript(burst, dm.burst.resolveBonus1)),
  resolveStacks
)
const resolveInfusedBonus_ = prod(
  percent(talentSubscript(burst, dm.burst.resolveBonus2)),
  resolveStacks
)
// WR electro_dmg_: (premod.enerRech_ − 100%) × bonus.
const a4_electro_dmg_ = cmpGE(
  ascension,
  4,
  prod(
    sum(own.premod.enerRech_.sheet('agg'), percent(-dm.passive2.er)),
    percent(dm.passive2.electroDmg_bonus),
    100
  )
)
// WR energy restore: (total.enerRech_ − 100%) × gen.
const a4_energyRestore_ = cmpGE(
  ascension,
  4,
  prod(
    sum(final.enerRech_, percent(-dm.passive2.er)),
    percent(dm.passive2.energyGen),
    100
  )
)
const c2_defIgn_ = InBurst.ifOn(
  cmpGE(constellation, 2, percent(dm.constellation2.def_ignore))
)
const c4_atk_ = prod(
  c4On,
  cmpGE(constellation, 4, percent(dm.constellation4.atk_bonus))
)

function musou(name: string, mvArr: number[], initial = false) {
  // WR customDmgNode(..., 'burst') — Musou Isshin is considered burst DMG.
  return customDmg(
    name,
    'electro',
    'burst',
    prod(
      sum(
        percent(talentSubscript(burst, mvArr)),
        initial ? resolveInitialBonus_ : resolveInfusedBonus_
      ),
      final.atk
    )
  )
}

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Secret Art: Musou Shinsetsu (burst); C5 Transcendence: Baleful Omen (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.dmg_.burst.add(skillEye_burst_dmg_),
  ownBuff.premod.dmg_.electro.add(a4_electro_dmg_),
  // WR teamBuff.premod.burst_dmg_ unequal(key, target.charKey).
  notOwnBuff.premod.dmg_.burst.add(skillEyeTeam_burst_dmg_),
  // WR premod.enemyDefIgn_ while InBurst; no ownBuff.premod.defIgn tag.
  enemyDebuff.common.defIgn.add(c2_defIgn_),
  // WR teamBuff.premod.atk_ unequal(activeCharKey, target.charKey); kit excludes Raiden.
  notOwnBuff.premod.atk_.add(c4_atk_),

  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill', info, 'atk', dm.skill.skillDmg, 'skill'),
  dmg('skill_coorDmg', info, 'atk', dm.skill.coorDmg, 'skill'),
  // Listing-local electro — infusionPrio has no electro channel. Physical NA remain.
  musou('burst', dm.burst.dmg, true),
  musou('burst_hit1', dm.burst.hit1),
  musou('burst_hit2', dm.burst.hit2),
  musou('burst_hit3', dm.burst.hit3),
  musou('burst_hit41', dm.burst.hit41),
  musou('burst_hit42', dm.burst.hit42),
  musou('burst_hit5', dm.burst.hit5),
  musou('burst_charged1', dm.burst.charged1),
  musou('burst_charged2', dm.burst.charged2),
  musou('burst_plunge', dm.burst.plunge),
  musou('burst_plungeLow', dm.burst.plungeLow),
  musou('burst_plungeHigh', dm.burst.plungeHigh),
  customParam(
    'burst_energyGen',
    prod(talentSubscript(burst, dm.burst.enerGen), sum(1, a4_energyRestore_))
  ),
  customParam('a4_energyRestore', a4_energyRestore_, {
    cond: cmpGE(ascension, 4, 'infer', ''),
  }),

  customParam('charged_stamina', dm.charged.stamina),
  customParam('skill_duration', dm.skill.duration),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_stam', dm.burst.stam),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
