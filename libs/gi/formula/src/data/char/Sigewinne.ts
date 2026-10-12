import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, max, min, prod, sum } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allListConditionals,
  customHeal,
  customParam,
  customShield,
  enemyDebuff,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Sigewinne'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = 0,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
    ],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  charged: {
    aimed: skillParam_gen.auto[a++],
    fullyAimed: skillParam_gen.auto[a++],
    bubble: skillParam_gen.auto[a++],
  },
  skill: {
    dmg: skillParam_gen.skill[s++],
    teammateHealMult: skillParam_gen.skill[s++],
    teammateHealFlat: skillParam_gen.skill[s++],
    selfHealMult: skillParam_gen.skill[s++][0],
    bond: skillParam_gen.skill[s++][0],
    bladeDmg: skillParam_gen.skill[s++],
    bladeInterval: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
    energyGainPerHp: skillParam_gen.skill[s++][0],
    maxEnergyGain: skillParam_gen.skill[s++][0],
    tier_dmg: 0.05,
    tier_heal: 0.05,
  },
  burst: {
    spoutDmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
    duration: skillParam_gen.burst[b++][0],
  },
  passive1: {
    dmgInc: skillParam_gen.passive1[0][0],
    maxDmgInc: skillParam_gen.passive1[1][0],
    duration: skillParam_gen.passive1[2][0],
    hydro_dmg_: skillParam_gen.passive1[3][0],
    triggers: skillParam_gen.passive1[4][0],
    hpThresh: skillParam_gen.passive1[5][0],
  },
  passive2: {
    heal_: skillParam_gen.passive2[0][0],
    maxHeal_: skillParam_gen.passive2[1][0],
  },
  // TODO: Updaet once DM is fixed
  constellation1: {
    dmgInc: 100,
    maxDmgInc: 3500,
  },
  constellation2: {
    shield: skillParam_gen.constellation2[0],
    hydro_enemyRes_: skillParam_gen.constellation2[1],
    duration: skillParam_gen.constellation2[2],
  },
  constellation4: {
    durationInc: 3,
  },
  constellation6: {
    critRate_: skillParam_gen.constellation6[0],
    critDMG_: skillParam_gen.constellation6[1],
    duration: skillParam_gen.constellation6[2],
    maxCritRate_: skillParam_gen.constellation6[3],
    maxCritDMG_: skillParam_gen.constellation6[4],
  },
} as const

const a4TeamBondArr = [
  '1000',
  '2000',
  '3000',
  '4000',
  '5000',
  '6000',
  '7000',
  '8000',
  '9000',
  '10000',
] as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill, ascension, constellation },
} = own
// WR cond(key, 'a1BedRest' | 'a1Conva' | 'c2AfterHit' | 'c6AfterHeal') `'on'`.
// C6 burst crit is always-on at C6 in WR data (UI cond unused).
const {
  a1BedRest,
  a1Conva,
  c2AfterHit,
  c6AfterHeal: _c6AfterHeal,
} = allBoolConditionals(info.key)
// WR lookup(condSkillTier, { 1, 2 })
const { skillTier } = allListConditionals(info.key, ['1', '2'])
// WR lookup(condA4TeamBond, { 1000, …, 10000 })
const { a4TeamBond } = allListConditionals(info.key, [...a4TeamBondArr])

const skillTierVal = skillTier.map({ '1': 1, '2': 2 })
const a4TeamBondVal = a4TeamBond.map({
  '1000': 1000,
  '2000': 2000,
  '3000': 3000,
  '4000': 4000,
  '5000': 5000,
  '6000': 6000,
  '7000': 7000,
  '8000': 8000,
  '9000': 9000,
  '10000': 10000,
})

const skillTier_skill_dmg_ = prod(percent(dm.skill.tier_dmg), skillTierVal)
const skillTier_heal_ = prod(percent(dm.skill.tier_heal), skillTierVal)

const a1BedRest_hydro_dmg_ = a1BedRest.ifOn(
  cmpGE(ascension, 1, percent(dm.passive1.hydro_dmg_))
)

// WR skill_dmgInc from HP above 30k. Read premod.hp@agg so formula.base write cannot cycle.
const convaAdjustedHp = max(
  0,
  sum(own.premod.hp.sheet('agg'), -dm.passive1.hpThresh)
)
const convaMaxDmgInc = cmpGE(
  constellation,
  1,
  dm.constellation1.maxDmgInc,
  dm.passive1.maxDmgInc
)
const convaDmgInc = cmpGE(
  constellation,
  1,
  dm.constellation1.dmgInc / 1000,
  dm.passive1.dmgInc / 1000
)
const a1Conva_skill_dmgInc = a1Conva.ifOn(
  cmpGE(ascension, 1, min(convaMaxDmgInc, prod(convaAdjustedHp, convaDmgInc)))
)

const a4TeamBond_heal_ = cmpGE(
  ascension,
  4,
  prod(percent(dm.passive2.heal_ / 1000), a4TeamBondVal)
)

const c2Shield = prod(percent(dm.constellation2.shield), final.hp)
const c2AfterHit_hydro_enemyRes_ = c2AfterHit.ifOn(
  cmpGE(constellation, 2, percent(-dm.constellation2.hydro_enemyRes_))
)

const c6AfterHeal_burst_critRate_ = cmpGE(
  constellation,
  6,
  min(
    prod(final.hp, 1 / 1000, percent(dm.constellation6.critRate_)),
    percent(dm.constellation6.maxCritRate_)
  )
)
const c6AfterHeal_burst_critDMG_ = cmpGE(
  constellation,
  6,
  min(
    prod(final.hp, 1 / 1000, percent(dm.constellation6.critDMG_)),
    percent(dm.constellation6.maxCritDMG_)
  )
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Rebound Hydrotherapy (skill); C5 Super Saturated Syringing (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.dmg_.hydro.add(a1BedRest_hydro_dmg_),
  ownBuff.premod.dmg_.skill.add(skillTier_skill_dmg_),
  ownBuff.premod.heal_.add(a4TeamBond_heal_),
  ownBuff.premod.critRate_.burst.add(c6AfterHeal_burst_critRate_),
  ownBuff.premod.critDMG_.burst.add(c6AfterHeal_burst_critDMG_),
  // WR teamBuff.premod.skill_dmgInc → formula.base.skill (no flat dmgInc tag)
  teamBuff.formula.base.skill.add(a1Conva_skill_dmgInc),
  // WR teamBuff.premod.hydro_enemyRes_; Pando enemy preRes. Keep WR sign.
  enemyDebuff.common.preRes.hydro.add(c2AfterHit_hydro_enemyRes_),

  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_aimed', info, 'atk', dm.charged.aimed, 'charged', {
    ele: 'physical',
  }),
  dmg('charged_aimedCharged', info, 'atk', dm.charged.fullyAimed, 'charged', {
    ele: 'hydro',
  }),
  dmg('charged_bubble', info, 'atk', dm.charged.bubble, 'charged', {
    ele: 'hydro',
  }),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill', info, 'hp', dm.skill.dmg, 'skill'),
  customHeal(
    'skill_teammateHeal',
    sum(
      prod(
        percent(talentSubscript(skill, dm.skill.teammateHealMult)),
        final.hp
      ),
      talentSubscript(skill, dm.skill.teammateHealFlat)
    ),
    {},
    // WR healNodeTalent overlay premod.heal_ on teammate heal only
    ownBuff.premod.heal_.add(skillTier_heal_)
  ),
  customHeal('skill_selfHeal', prod(percent(dm.skill.selfHealMult), final.hp)),
  // WR bladeDmg sets hit.reaction to '' (Arkhe); Pando has no no-react overlay.
  dmg('skill_bladeDmg', info, 'hp', dm.skill.bladeDmg, 'skill'),
  dmg('burst', info, 'hp', dm.burst.spoutDmg, 'burst'),
  customShield('c2_shield', undefined, c2Shield, {
    cond: cmpGE(constellation, 2, 'infer', ''),
  }),
  customShield('c2_hydroShield', 'hydro', c2Shield, {
    cond: cmpGE(constellation, 2, 'infer', ''),
  }),
  customParam('a1Conva_skill_dmgInc', a1Conva_skill_dmgInc, {
    cond: cmpGE(ascension, 1, 'infer', ''),
  }),
  customParam('c6AfterHeal_burst_critRate_', c6AfterHeal_burst_critRate_, {
    cond: cmpGE(constellation, 6, 'infer', ''),
  }),
  customParam('c6AfterHeal_burst_critDMG_', c6AfterHeal_burst_critDMG_, {
    cond: cmpGE(constellation, 6, 'infer', ''),
  }),

  customParam('skill_bladeInterval', dm.skill.bladeInterval),
  customParam('skill_cd', dm.skill.cd),
  customParam(
    'burst_duration',
    sum(
      dm.burst.duration,
      cmpGE(constellation, 4, dm.constellation4.durationInc)
    )
  ),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
