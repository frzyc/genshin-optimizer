import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, min, prod, sum } from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import { infusionPrio } from '../common/dmg'
import {
  allBoolConditionals,
  allListConditionals,
  allNumConditionals,
  customParam,
  notOwnBuff,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'TravelerCryo'
const data_gen = allStats.char.data['Traveler']
// TODO: Fix gender 🏳
const skillParam_gen = allStats.char.skillParam['TravelerCryoF']

let s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[0],
      skillParam_gen.auto[1],
      skillParam_gen.auto[2],
      skillParam_gen.auto[3],
      skillParam_gen.auto[4],
    ],
  },
  charged: {
    dmg1: skillParam_gen.auto[5],
    dmg2: skillParam_gen.auto[6],
    stamina: skillParam_gen.auto[7][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[8],
    low: skillParam_gen.auto[9],
    high: skillParam_gen.auto[10],
  },
  skill: {
    skillDmg: skillParam_gen.skill[s++],
    crystalDmg: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
    starDuration: skillParam_gen.skill[s++][0],
  },
  burst: {
    javelinDmg: skillParam_gen.burst[b++],
    frostglowMult_: skillParam_gen.burst[b++],
    numStrikes: skillParam_gen.burst[b++][0],
    addlStrikes: skillParam_gen.burst[b++][0],
    maxFrostglow: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
    javelinStellarconductDmg: skillParam_gen.burst[b++],
    frostglowStellarconductMult_: skillParam_gen.burst[b++],
    javelinStellarswirlDmg: skillParam_gen.burst[b++],
    frostglowStellarswirlMult_: skillParam_gen.burst[b++],
  },
  passive1: {
    addlDmg: skillParam_gen.passive1[0][0],
  },
  passive2: {
    eleMas: skillParam_gen.passive2[0][0],
    maxEleMas: skillParam_gen.passive2[1][0],
  },
  passive3: {
    base_stellarconduct_dmg_: skillParam_gen.passive3![0][0],
    maxBase_stellarconduct_dmg_: skillParam_gen.passive3![1][0],
    base_stellarswirl_dmg_: skillParam_gen.passive3![2][0],
    maxBase_stellarswirl_dmg_: skillParam_gen.passive3![3][0],
  },
  lockedPassive: {
    anemo: skillParam_gen.lockedPassive![0][0],
    geo: skillParam_gen.lockedPassive![1][0],
    electro: skillParam_gen.lockedPassive![2][0],
    dendro: skillParam_gen.lockedPassive![3][0],
    hydro: skillParam_gen.lockedPassive![4][0],
    pyro: skillParam_gen.lockedPassive![5][0],
    cryo: skillParam_gen.lockedPassive![6][0],
    charged_dmgInc: skillParam_gen.lockedPassive![7][0],
    cd: skillParam_gen.lockedPassive![8][0],
  },
  constellation1: {
    energyRegen: skillParam_gen.constellation1[0],
    cd: skillParam_gen.constellation1[1],
  },
  constellation2: {
    eleMas: skillParam_gen.constellation2[0],
    duration: skillParam_gen.constellation2[1],
    mult: skillParam_gen.constellation2[2],
  },
  constellation4: {
    durationInc_: skillParam_gen.constellation4[0],
  },
  constellation6: {
    stellar_dmg_: skillParam_gen.constellation6[0],
    duration: skillParam_gen.constellation6[1],
  },
} as const

const info = dataGenToCharInfo(data_gen, 'cryo')
const {
  final,
  char: { burst, ascension, constellation },
} = own
// WR cond('TravelerCryo', 'a1ScStar' | 'c2Crystal' | 'c2ActiveStellar') `'on'`
const { a1ScStar, c2Crystal, c2ActiveStellar } = allBoolConditionals(info.key)
// WR cond('Traveler', …) — register on this key
const { lockedPassive, bonusCanned, bonusSkirk1, bonusSkirk2, bonusSkirk3 } =
  allBoolConditionals(info.key)
const {
  traveleranemo,
  travelergeo,
  travelerelectro,
  travelerdendro,
  travelerhydro,
  travelerpyro,
  travelercryo,
} = allBoolConditionals('Traveler')
// WR cond(key, 'a0StellarRadiance') states `'sc'` / `'ss'`
const { a0StellarRadiance } = allListConditionals(info.key, ['sc', 'ss'])
// WR lookup burstFrostglow 1..maxFrostglow (unset = 0)
const { burstFrostglow } = allNumConditionals(
  info.key,
  true,
  0,
  dm.burst.maxFrostglow
)

const radianceSc = a0StellarRadiance.map({ sc: 1, ss: 0 })
const radianceSs = a0StellarRadiance.map({ sc: 0, ss: 1 })
const radianceOn = sum(radianceSc, radianceSs)
const unsetOn = cmpGE(radianceOn, 1, '', 'infer')
const scOn = cmpGE(radianceSc, 1, 'infer', '')
const ssOn = cmpGE(radianceSs, 1, 'infer', '')
const lockedOn = lockedPassive.ifOn(1)
const lockedUnsetOn = cmpGE(
  prod(lockedOn, cmpGE(radianceOn, 1, 0, 1)),
  1,
  'infer',
  ''
)
const lockedScOn = cmpGE(prod(lockedOn, radianceSc), 1, 'infer', '')
const lockedSsOn = cmpGE(prod(lockedOn, radianceSs), 1, 'infer', '')

const a0_stellarconduct_baseDmg_ = min(
  prod(percent(dm.passive3.base_stellarconduct_dmg_), final.atk),
  percent(dm.passive3.maxBase_stellarconduct_dmg_)
)
const a0_stellarswirl_baseDmg_ = min(
  prod(percent(dm.passive3.base_stellarswirl_dmg_), final.atk),
  percent(dm.passive3.maxBase_stellarswirl_dmg_)
)

// WR premod.*_dmgInc → formula.base (no flat dmgInc tag). Needs sc.
const a1ScStar_dmgInc = a1ScStar.ifOn(
  cmpGE(
    ascension,
    1,
    cmpGE(radianceSc, 1, prod(percent(dm.passive1.addlDmg), final.atk))
  )
)
// WR total.eleMas from premod.atk. Read agg so this write cannot cycle.
const a4_eleMas = cmpGE(
  ascension,
  4,
  min(
    prod(percent(dm.passive2.eleMas), own.premod.atk.sheet('agg')),
    dm.passive2.maxEleMas
  )
)
const lockedPassive_charged_dmgInc = lockedPassive.ifOn(
  prod(percent(dm.lockedPassive.charged_dmgInc), final.atk)
)
// WR A1 dmg inc doesn't apply to special CA (overlay subtract).
const lockedPassive_noA1 = ownBuff.formula.base.add(prod(-1, a1ScStar_dmgInc))
const lockedPassive_caBase = ownBuff.formula.base.charged.add(
  lockedPassive_charged_dmgInc
)

const c2Crystal_eleMas = c2Crystal.ifOn(
  cmpGE(constellation, 2, dm.constellation2.eleMas)
)
const c2ActiveStellar_eleMas = c2Crystal.ifOn(
  c2ActiveStellar.ifOn(cmpGE(constellation, 2, dm.constellation2.eleMas))
)
const c2_eleMas = prod(
  destIsActive,
  sum(c2Crystal_eleMas, c2ActiveStellar_eleMas)
)
const c6Frostglow_stellar_dmg_ = cmpGE(
  constellation,
  6,
  prod(percent(dm.constellation6.stellar_dmg_), burstFrostglow)
)

function burstJavelin(
  name: string,
  table: number[],
  frostglowTable: number[],
  cond: typeof unsetOn
) {
  return dmg(
    name,
    info,
    'atk',
    table,
    'burst',
    { ele: 'cryo', cond },
    ownBuff.formula.base.add(
      prod(
        percent(talentSubscript(burst, frostglowTable)),
        burstFrostglow,
        final.atk
      )
    )
  )
}

function lockedPassiveCa(
  name: string,
  table: number[],
  cond: typeof lockedUnsetOn
) {
  return dmg(
    name,
    info,
    'atk',
    table,
    'charged',
    { ele: 'cryo', cond },
    lockedPassive_caBase,
    lockedPassive_noA1
  )
}

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Glacial Shard (burst); C5 Bittercold Fog (skill) — WR skillBoost C5, burstBoost C3
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  ownBuff.base.atk.add(bonusCanned.ifOn(3)),
  ownBuff.base.atk.add(bonusSkirk1.ifOn(7)),
  ownBuff.premod.eleMas.add(bonusSkirk2.ifOn(15)),
  ownBuff.base.hp.add(bonusSkirk3.ifOn(50)),
  ownBuff.premod.critRate_.add(
    lockedPassive.ifOn(traveleranemo.ifOn(percent(dm.lockedPassive.anemo)))
  ),
  ownBuff.premod.def_.add(
    lockedPassive.ifOn(travelergeo.ifOn(percent(dm.lockedPassive.geo)))
  ),
  ownBuff.premod.enerRech_.add(
    lockedPassive.ifOn(travelerelectro.ifOn(percent(dm.lockedPassive.electro)))
  ),
  ownBuff.premod.eleMas.add(
    lockedPassive.ifOn(travelerdendro.ifOn(dm.lockedPassive.dendro))
  ),
  ownBuff.premod.hp_.add(
    lockedPassive.ifOn(travelerhydro.ifOn(percent(dm.lockedPassive.hydro)))
  ),
  ownBuff.premod.atk_.add(
    lockedPassive.ifOn(travelerpyro.ifOn(percent(dm.lockedPassive.pyro)))
  ),
  ownBuff.premod.critDMG_.add(
    lockedPassive.ifOn(travelercryo.ifOn(percent(dm.lockedPassive.cryo)))
  ),
  // WR total.eleMas
  ownBuff.final.eleMas.add(a4_eleMas),
  // WR premod.normal_dmgInc / charged_dmgInc / plunging_dmgInc → formula.base
  ownBuff.formula.base.normal.add(a1ScStar_dmgInc),
  ownBuff.formula.base.charged.add(a1ScStar_dmgInc),
  ownBuff.formula.base.plunging.add(a1ScStar_dmgInc),
  // WR infusion.nonOverridableSelf cryo (A1 + Frostpierce Star / sc)
  ownBuff.reaction.infusionIndex.add(
    a1ScStar.ifOn(
      cmpGE(
        ascension,
        1,
        cmpGE(radianceSc, 1, infusionPrio.nonOverridable.cryo)
      )
    )
  ),
  // A0 Stellar Jubilee — WR teamBuff stellarconduct_baseDmg_ / stellarswirl_baseDmg_
  // (no Pando baseDmg_ tag)
  teamBuff.premod.dmg_.stellarconduct.add(a0_stellarconduct_baseDmg_),
  teamBuff.premod.dmg_.stellarswirl.add(a0_stellarswirl_baseDmg_),
  // WR teamBuff dest-gated to active character
  teamBuff.premod.eleMas.add(c2_eleMas),
  // WR teamBuff.premod.*_dmg_ unequal(target.charKey, key)
  notOwnBuff.premod.dmg_.stellarconduct.add(c6Frostglow_stellar_dmg_),
  notOwnBuff.premod.dmg_.stellarswirl.add(c6Frostglow_stellar_dmg_),

  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_1', info, 'atk', dm.charged.dmg1, 'charged'),
  dmg('charged_2', info, 'atk', dm.charged.dmg2, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill', info, 'atk', dm.skill.skillDmg, 'skill'),
  dmg('skill_crystalDmg', info, 'atk', dm.skill.crystalDmg, 'skill'),
  burstJavelin(
    'burst_javelinDmg',
    dm.burst.javelinDmg,
    dm.burst.frostglowMult_,
    unsetOn
  ),
  // WR stellarDmgNode (stellarconduct/stellarswirl / cryo); talent-style listing until trans pipeline exists.
  burstJavelin(
    'burst_javelinStellarconductDmg',
    dm.burst.javelinStellarconductDmg,
    dm.burst.frostglowStellarconductMult_,
    scOn
  ),
  burstJavelin(
    'burst_javelinStellarswirlDmg',
    dm.burst.javelinStellarswirlDmg,
    dm.burst.frostglowStellarswirlMult_,
    ssOn
  ),
  lockedPassiveCa('lockedPassive_dmg1', dm.charged.dmg1, lockedUnsetOn),
  lockedPassiveCa('lockedPassive_dmg2', dm.charged.dmg2, lockedUnsetOn),
  lockedPassiveCa(
    'lockedPassive_stellarconductDmg1',
    dm.charged.dmg1,
    lockedScOn
  ),
  lockedPassiveCa(
    'lockedPassive_stellarconductDmg2',
    dm.charged.dmg2,
    lockedScOn
  ),
  lockedPassiveCa(
    'lockedPassive_stellarswirlDmg1',
    dm.charged.dmg1,
    lockedSsOn
  ),
  lockedPassiveCa(
    'lockedPassive_stellarswirlDmg2',
    dm.charged.dmg2,
    lockedSsOn
  ),

  customParam('a4_eleMas', a4_eleMas, {
    cond: cmpGE(ascension, 4, 'infer', ''),
  }),
  customParam('a0_stellarconduct_baseDmg_', a0_stellarconduct_baseDmg_),
  customParam('a0_stellarswirl_baseDmg_', a0_stellarswirl_baseDmg_)
)
