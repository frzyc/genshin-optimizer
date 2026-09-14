import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, cmpNE, min, prod, sum } from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import {
  allBoolConditionals,
  allListConditionals,
  customParam,
  enemyDebuff,
  hexereiTally,
  notOwnBuff,
  own,
  ownBuff,
  percent,
  register,
  team,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Durin'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = -1,
  s = 0,
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
    dmg: skillParam_gen.auto[++a],
    stam: skillParam_gen.auto[++a][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[++a],
    low: skillParam_gen.auto[++a],
    high: skillParam_gen.auto[++a],
  },
  skill: {
    purityDmg: skillParam_gen.skill[s++],
    darkDmg1: skillParam_gen.skill[s++],
    darkDmg2: skillParam_gen.skill[s++],
    darkDmg3: skillParam_gen.skill[s++],
    energyRegen: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    purityDmg1: skillParam_gen.burst[b++],
    purityDmg2: skillParam_gen.burst[b++],
    purityDmg3: skillParam_gen.burst[b++],
    darkDmg1: skillParam_gen.burst[b++],
    darkDmg2: skillParam_gen.burst[b++],
    darkDmg3: skillParam_gen.burst[b++],
    whiteDmg: skillParam_gen.burst[b++],
    decayDmg: skillParam_gen.burst[b++],
    whiteDuration: skillParam_gen.burst[b++][0],
    darkDuration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    enemyRes_: skillParam_gen.passive1[0][0],
    duration: skillParam_gen.passive1[1][0],
    vaporize_dmg_: skillParam_gen.passive1[2][0],
    melt_dmg_: skillParam_gen.passive1[3][0],
  },
  passive2: {
    burst_dmg_mult_: skillParam_gen.passive2[0][0],
    max_burst_dmg_mult_: skillParam_gen.passive2[1][0],
    stackGain: skillParam_gen.passive2[2][0],
  },
  lockedPassive: {
    a1Mult_: skillParam_gen.lockedPassive![0][0],
  },
  constellation1: {
    stackGain: skillParam_gen.constellation1[0],
    duration: skillParam_gen.constellation1[1],
    lightStackConsume: skillParam_gen.constellation1[2],
    lightDmgInc: skillParam_gen.constellation1[3],
    darkStackConsume: skillParam_gen.constellation1[4],
    darkDmgInc: skillParam_gen.constellation1[5],
  },
  constellation2: {
    duration: skillParam_gen.constellation2[0],
    buffDuration: skillParam_gen.constellation2[1],
    dmg_: skillParam_gen.constellation2[2],
  },
  constellation4: {
    unknown20: skillParam_gen.constellation4[0],
    chanceNoStacks: skillParam_gen.constellation4[1],
    burst_dmg_: skillParam_gen.constellation4[2],
  },
  constellation6: {
    burst_defIgn_: skillParam_gen.constellation6[0],
    light_defRed_: skillParam_gen.constellation6[1],
    lightDuration: skillParam_gen.constellation6[2],
    dark_defIgn_: skillParam_gen.constellation6[3],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill, ascension, constellation },
} = own
// WR cond(key, 'lockHomework' | 'a4Stack' | 'c1Stacks' | 'c2AfterBurst' | 'c6LightBurstHit')
const { lockHomework, a4Stack, c1Stacks, c2AfterBurst, c6LightBurstHit } =
  allBoolConditionals(info.key)
// WR cond(key, 'burstForm') states white | dark
const { burstForm } = allListConditionals(info.key, ['white', 'dark'])
const { a1WhiteDendro } = allListConditionals(info.key, ['dendro'])
const { a1WhiteElectro } = allListConditionals(info.key, ['electro'])
const { a1WhiteAnemo } = allListConditionals(info.key, ['anemo'])
const { a1WhiteGeo } = allListConditionals(info.key, ['geo'])
const { c2Hydro } = allListConditionals(info.key, ['hydro'])
const { c2Cryo } = allListConditionals(info.key, ['cryo'])

const whiteOn = burstForm.map({ white: 1, dark: 0 })
const darkOn = burstForm.map({ white: 0, dark: 1 })
const dendroOn = a1WhiteDendro.map({ dendro: 1 })
const electroOn = a1WhiteElectro.map({ electro: 1 })
const anemoOn = a1WhiteAnemo.map({ anemo: 1 })
const geoOn = a1WhiteGeo.map({ geo: 1 })
const hydroOn = c2Hydro.map({ hydro: 1 })
const cryoOn = c2Cryo.map({ cryo: 1 })
const a1WhiteAny = cmpGE(sum(dendroOn, electroOn, anemoOn, geoOn), 1, 1)
const c2Any = cmpGE(
  sum(hydroOn, cryoOn, dendroOn, electroOn, anemoOn, geoOn),
  1,
  1
)

const hexereiRite = cmpGE(team.common.hexerei, 2, lockHomework.ifOn(1))
const a1Res_ = percent(-dm.passive1.enemyRes_)
const a1White_pyro_enemyRes_ = cmpGE(
  ascension,
  1,
  prod(whiteOn, a1WhiteAny, a1Res_)
)
const a1White_dendro_enemyRes_ = cmpGE(
  ascension,
  1,
  prod(whiteOn, dendroOn, a1Res_)
)
const a1White_electro_enemyRes_ = cmpGE(
  ascension,
  1,
  prod(whiteOn, electroOn, a1Res_)
)
const a1White_anemo_enemyRes_ = cmpGE(
  ascension,
  1,
  prod(whiteOn, anemoOn, a1Res_)
)
const a1White_geo_enemyRes_ = cmpGE(ascension, 1, prod(whiteOn, geoOn, a1Res_))
const lockA1Mult_ = prod(percent(dm.lockedPassive.a1Mult_), hexereiRite)
const a1Dark_vaporize_dmg_ = cmpGE(
  ascension,
  1,
  prod(darkOn, percent(dm.passive1.vaporize_dmg_))
)
const a1Dark_melt_dmg_ = cmpGE(
  ascension,
  1,
  prod(darkOn, percent(dm.passive1.melt_dmg_))
)

const a4Stack_burstPeriodic_mult_ = sum(
  1,
  cmpGE(
    ascension,
    4,
    a4Stack.ifOn(
      min(
        prod(percent(dm.passive2.burst_dmg_mult_), final.atk, 1 / 100),
        percent(dm.passive2.max_burst_dmg_mult_)
      )
    )
  )
)

const c1StacksWhite_dmgIncDisp = cmpGE(
  constellation,
  1,
  prod(
    whiteOn,
    c1Stacks.ifOn(prod(percent(dm.constellation1.lightDmgInc), final.atk))
  )
)
const c1StacksWhite_dmgInc = cmpNE(destIsActive, 0, c1StacksWhite_dmgIncDisp)
const c1StacksDark_burst_dmgInc = cmpGE(
  constellation,
  1,
  prod(
    darkOn,
    c1Stacks.ifOn(prod(percent(dm.constellation1.darkDmgInc), final.atk))
  )
)

const c2Dmg_ = percent(dm.constellation2.dmg_)
const c2AfterBurst_pyro_dmg_ = cmpGE(
  constellation,
  2,
  c2AfterBurst.ifOn(prod(c2Any, c2Dmg_))
)
const c2AfterBurst_hydro_dmg_ = cmpGE(
  constellation,
  2,
  c2AfterBurst.ifOn(prod(hydroOn, c2Dmg_))
)
const c2AfterBurst_cryo_dmg_ = cmpGE(
  constellation,
  2,
  c2AfterBurst.ifOn(prod(cryoOn, c2Dmg_))
)
const c2AfterBurst_dendro_dmg_ = cmpGE(
  constellation,
  2,
  c2AfterBurst.ifOn(prod(dendroOn, c2Dmg_))
)
const c2AfterBurst_electro_dmg_ = cmpGE(
  constellation,
  2,
  c2AfterBurst.ifOn(prod(electroOn, c2Dmg_))
)
const c2AfterBurst_anemo_dmg_ = cmpGE(
  constellation,
  2,
  c2AfterBurst.ifOn(prod(anemoOn, c2Dmg_))
)
const c2AfterBurst_geo_dmg_ = cmpGE(
  constellation,
  2,
  c2AfterBurst.ifOn(prod(geoOn, c2Dmg_))
)

const c4_burst_dmg_ = cmpGE(
  constellation,
  4,
  percent(dm.constellation4.burst_dmg_)
)
const c6_burst_defIgn_ = cmpGE(
  constellation,
  6,
  percent(dm.constellation6.burst_defIgn_)
)
const c6_dark_burst_defIgn_ = cmpGE(
  constellation,
  6,
  percent(dm.constellation6.dark_defIgn_)
)
const c6LightBurstHit_defRed_ = cmpGE(
  constellation,
  6,
  prod(whiteOn, c6LightBurstHit.ifOn(percent(dm.constellation6.light_defRed_)))
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // WR flags.isHexerei
  hexereiTally(lockHomework.ifOn(1)),
  // C3 Principle of Purity: As the Light Shifts (burst); C5 Binary Form: Convergence and Division (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.dmg_.vaporize.add(
    sum(a1Dark_vaporize_dmg_, prod(a1Dark_vaporize_dmg_, lockA1Mult_))
  ),
  ownBuff.premod.dmg_.melt.add(
    sum(a1Dark_melt_dmg_, prod(a1Dark_melt_dmg_, lockA1Mult_))
  ),
  ownBuff.premod.dmg_.burst.add(c4_burst_dmg_),
  ownBuff.formula.base.burst.add(c1StacksDark_burst_dmgInc),

  notOwnBuff.formula.base.normal.add(c1StacksWhite_dmgInc),
  notOwnBuff.formula.base.charged.add(c1StacksWhite_dmgInc),
  notOwnBuff.formula.base.plunging.add(c1StacksWhite_dmgInc),
  notOwnBuff.formula.base.skill.add(c1StacksWhite_dmgInc),
  notOwnBuff.formula.base.burst.add(c1StacksWhite_dmgInc),

  teamBuff.premod.dmg_.pyro.add(c2AfterBurst_pyro_dmg_),
  teamBuff.premod.dmg_.hydro.add(c2AfterBurst_hydro_dmg_),
  teamBuff.premod.dmg_.cryo.add(c2AfterBurst_cryo_dmg_),
  teamBuff.premod.dmg_.dendro.add(c2AfterBurst_dendro_dmg_),
  teamBuff.premod.dmg_.electro.add(c2AfterBurst_electro_dmg_),
  teamBuff.premod.dmg_.anemo.add(c2AfterBurst_anemo_dmg_),
  teamBuff.premod.dmg_.geo.add(c2AfterBurst_geo_dmg_),

  enemyDebuff.common.preRes.pyro.add(
    sum(a1White_pyro_enemyRes_, prod(a1White_pyro_enemyRes_, lockA1Mult_))
  ),
  enemyDebuff.common.preRes.dendro.add(
    sum(a1White_dendro_enemyRes_, prod(a1White_dendro_enemyRes_, lockA1Mult_))
  ),
  enemyDebuff.common.preRes.electro.add(
    sum(a1White_electro_enemyRes_, prod(a1White_electro_enemyRes_, lockA1Mult_))
  ),
  enemyDebuff.common.preRes.anemo.add(
    sum(a1White_anemo_enemyRes_, prod(a1White_anemo_enemyRes_, lockA1Mult_))
  ),
  enemyDebuff.common.preRes.geo.add(
    sum(a1White_geo_enemyRes_, prod(a1White_geo_enemyRes_, lockA1Mult_))
  ),
  enemyDebuff.common.defRed_.add(c6LightBurstHit_defRed_),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill_purityDmg', info, 'atk', dm.skill.purityDmg, 'skill'),
  dmg('skill_darkDmg1', info, 'atk', dm.skill.darkDmg1, 'skill'),
  dmg('skill_darkDmg2', info, 'atk', dm.skill.darkDmg2, 'skill'),
  dmg('skill_darkDmg3', info, 'atk', dm.skill.darkDmg3, 'skill'),
  dmg('burst_purityDmg1', info, 'atk', dm.burst.purityDmg1, 'burst'),
  dmg('burst_purityDmg2', info, 'atk', dm.burst.purityDmg2, 'burst'),
  dmg('burst_purityDmg3', info, 'atk', dm.burst.purityDmg3, 'burst'),
  dmg('burst_darkDmg1', info, 'atk', dm.burst.darkDmg1, 'burst'),
  dmg('burst_darkDmg2', info, 'atk', dm.burst.darkDmg2, 'burst'),
  dmg('burst_darkDmg3', info, 'atk', dm.burst.darkDmg3, 'burst'),
  dmg('burst_whiteDmg', info, 'atk', dm.burst.whiteDmg, 'burst', {
    baseMulti: a4Stack_burstPeriodic_mult_,
  }),
  dmg('burst_decayDmg', info, 'atk', dm.burst.decayDmg, 'burst', {
    baseMulti: a4Stack_burstPeriodic_mult_,
  }),
  // WR dmgNode additional Data: lightBurstAddl / darkBurstAddl (listing-local
  // premod.enemyDefIgn_). Escalated — not applied to burst listings.

  customParam('charged_stamina', dm.charged.stam),
  customParam(
    'skill_energyRegen',
    talentSubscript(skill, dm.skill.energyRegen)
  ),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_whiteDuration', dm.burst.whiteDuration),
  customParam('burst_darkDuration', dm.burst.darkDuration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost),
  customParam('a4Stack_burstPeriodic_mult_', a4Stack_burstPeriodic_mult_),
  customParam('c1StacksWhite_dmgInc', c1StacksWhite_dmgIncDisp, {
    cond: cmpGE(constellation, 1, 'infer', ''),
  }),
  customParam('c1StacksDark_burst_dmgInc', c1StacksDark_burst_dmgInc, {
    cond: cmpGE(constellation, 1, 'infer', ''),
  }),
  customParam('c6_burst_defIgn_', c6_burst_defIgn_, {
    cond: cmpGE(constellation, 6, 'infer', ''),
  }),
  customParam('c6_dark_burst_defIgn_', c6_dark_burst_defIgn_, {
    cond: cmpGE(constellation, 6, 'infer', ''),
  })
)
