import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, cmpNE, min, prod, sum } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allListConditionals,
  allNumConditionals,
  customDmg,
  customParam,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar } from './util'

const key: CharacterKey = 'Sandrone'
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
    sweepDmg: skillParam_gen.auto[a++],
    beamDmg: skillParam_gen.auto[a++],
    beamStellarDmg: skillParam_gen.auto[a++],
    beamSsDmg: skillParam_gen.auto[skillParam_gen.auto.length - 1],
    overdriveDmg: skillParam_gen.auto[a++],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    prismDmg: skillParam_gen.skill[s++],
    prismStellarDmg: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
    prismSsDmg: skillParam_gen.skill[s++],
  },
  burst: {
    bombardDmg: skillParam_gen.burst[b++], // x3
    rayDmg: skillParam_gen.burst[b++],
    rayStellarDmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
    raySsDmg: skillParam_gen.burst[b++],
  },
  passive1: {
    prismAddlMult: skillParam_gen.passive1[0][0],
    rayAddlMult: skillParam_gen.passive1[1][0],
  },
  passive2: {
    eleMas: skillParam_gen.passive2[0][0],
    maxEleMas: skillParam_gen.passive2[1][0],
  },
  passive3: {
    base_stellarconduct_dmg_: skillParam_gen.passive3![0][0],
    maxBase_stellarconduct_dmg_: skillParam_gen.passive3![1][0],
  },
  constellation1: {
    stellarconduct_dmg_: skillParam_gen.constellation1[0],
  },
  constellation2: {
    beam_critDMG_: skillParam_gen.constellation2[0],
    beamStack_critDMG_: skillParam_gen.constellation2[1],
  },
  constellation4: {
    dmg: skillParam_gen.constellation4[0],
    cd: skillParam_gen.constellation4[1],
    ssDmg: skillParam_gen.constellation4[2],
  },
  constellation6: {
    dmg: skillParam_gen.constellation6[0],
    dmg2: skillParam_gen.constellation6[1],
    stellarconduct_specialDmg_: skillParam_gen.constellation6[2],
    ssDmg: skillParam_gen.constellation6[3],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  premod,
  char: { ascension, constellation },
} = own
// WR cond(key, 'a1Decoding' | 'c1Decoding')
const { a1Decoding, c1Decoding } = allBoolConditionals(info.key)
// WR cond(key, 'a0StellarRadianceSc') states on | ss
const { a0StellarRadianceSc } = allListConditionals(info.key, ['on', 'ss'])
// WR lookup a1Tactics 1–10; c2Stacks 1–3
const { a1Tactics } = allNumConditionals(info.key, true, 0, 10)
const { c2Stacks } = allNumConditionals(info.key, true, 0, 3)

const radianceOn = a0StellarRadianceSc.map({ on: 1, ss: 0 })
const radianceSs = a0StellarRadianceSc.map({ on: 0, ss: 1 })
const radianceSet = cmpNE(a0StellarRadianceSc.value, 0, 1)

const a0_stellarconduct_baseDmg_ = min(
  prod(percent(dm.passive3.base_stellarconduct_dmg_), final.atk, 1 / 100),
  percent(dm.passive3.maxBase_stellarconduct_dmg_)
)
const a1Decoding_prism_mult_ = sum(
  1,
  a1Decoding.ifOn(cmpGE(ascension, 1, percent(dm.passive1.prismAddlMult)))
)
const a1Decoding_ray_mult_ = sum(
  1,
  a1Decoding.ifOn(
    cmpGE(ascension, 1, prod(percent(dm.passive1.rayAddlMult), a1Tactics))
  )
)
const a4EleMas = cmpGE(
  ascension,
  4,
  min(prod(premod.atk, dm.passive2.eleMas), dm.passive2.maxEleMas)
)
const c1Decoding_stellar_dmg_ = c1Decoding.ifOn(
  cmpGE(constellation, 1, percent(dm.constellation1.stellarconduct_dmg_))
)
const c2_beam_critDMG_ = cmpGE(
  constellation,
  2,
  sum(
    percent(dm.constellation2.beam_critDMG_),
    prod(radianceSet, c2Stacks, percent(dm.constellation2.beamStack_critDMG_))
  )
)
const c6_stellar_specialDmg_ = cmpGE(
  constellation,
  6,
  percent(dm.constellation6.stellarconduct_specialDmg_)
)
const beamOn = cmpGE(radianceOn, 1, 'infer', '')
const beamSsOn = cmpGE(radianceSs, 1, 'infer', '')
const c2BeamCrit = ownBuff.premod.critDMG_.charged.add(c2_beam_critDMG_)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Self-Evident Proposition (auto); C5 Formule Phenomenale: Q.E.D. (burst)
  ownBuff.char.auto.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  // A4 — WR total.eleMas from premod.atk
  ownBuff.premod.eleMas.add(a4EleMas),
  // A0 Stellar Jubilee — WR teamBuff stellarconduct_baseDmg_ / stellarswirl_baseDmg_
  // (no Pando baseDmg_ tag; Flins lunarcharged_baseDmg_)
  teamBuff.premod.dmg_.stellarconduct.add(a0_stellarconduct_baseDmg_),
  teamBuff.premod.dmg_.stellarswirl.add(a0_stellarconduct_baseDmg_),
  // C1 — WR teamBuff allStellarReactionKeys *_dmg_
  teamBuff.premod.dmg_.stellarconduct.add(c1Decoding_stellar_dmg_),
  teamBuff.premod.dmg_.stellarswirl.add(c1Decoding_stellar_dmg_),
  // C6 — WR stellarconduct_specialDmg_ (no Pando specialDmg_ tag)
  ownBuff.premod.dmg_.stellarconduct.add(c6_stellar_specialDmg_),
  ownBuff.premod.dmg_.stellarswirl.add(c6_stellar_specialDmg_),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_sweepDmg', info, 'atk', dm.charged.sweepDmg, 'charged', {
    ele: 'cryo',
  }),
  dmg(
    'charged_beamDmg',
    info,
    'atk',
    dm.charged.beamDmg,
    'charged',
    { ele: 'cryo' },
    c2BeamCrit
  ),
  // WR stellarDmgNode (stellarconduct / cryo); talent-style listing until trans pipeline exists.
  dmg(
    'charged_beamStellarDmg',
    info,
    'atk',
    dm.charged.beamStellarDmg,
    'charged',
    { ele: 'cryo', cond: beamOn },
    c2BeamCrit
  ),
  // WR beamSs listing scales with beamStellarDmg (auto[5]), not beamSsDmg (auto[last]).
  dmg(
    'charged_beamSsDmg',
    info,
    'atk',
    dm.charged.beamStellarDmg,
    'charged',
    { ele: 'cryo', cond: beamSsOn },
    c2BeamCrit
  ),
  dmg('charged_overdriveDmg', info, 'atk', dm.charged.overdriveDmg, 'charged', {
    ele: 'cryo',
  }),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill_prismDmg1', info, 'atk', dm.skill.prismDmg, 'skill'),
  dmg('skill_prismDmg2', info, 'atk', dm.skill.prismDmg, 'skill', {
    baseMulti: a1Decoding_prism_mult_,
  }),
  dmg('skill_prismStellarDmg', info, 'atk', dm.skill.prismStellarDmg, 'skill', {
    cond: beamOn,
    baseMulti: a1Decoding_prism_mult_,
  }),
  dmg('skill_prismSsDmg', info, 'atk', dm.skill.prismSsDmg, 'skill', {
    cond: beamSsOn,
    baseMulti: a1Decoding_prism_mult_,
  }),
  dmg('burst_bombardDmg', info, 'atk', dm.burst.bombardDmg, 'burst'),
  dmg('burst_rayDmg', info, 'atk', dm.burst.rayDmg, 'burst'),
  dmg('burst_rayStellarDmg', info, 'atk', dm.burst.rayStellarDmg, 'burst', {
    cond: beamOn,
    baseMulti: a1Decoding_ray_mult_,
  }),
  dmg('burst_raySsDmg', info, 'atk', dm.burst.raySsDmg, 'burst', {
    cond: beamSsOn,
    baseMulti: a1Decoding_ray_mult_,
  }),
  customDmg(
    'c4',
    'cryo',
    'elemental',
    prod(percent(dm.constellation4.dmg), final.atk),
    { cond: cmpGE(constellation, 4, beamOn, '') }
  ),
  customDmg(
    'c4_ssDmg',
    'cryo',
    'elemental',
    prod(percent(dm.constellation4.ssDmg), final.atk),
    { cond: cmpGE(constellation, 4, beamSsOn, '') }
  ),
  customDmg(
    'c6',
    'cryo',
    'elemental',
    prod(percent(dm.constellation6.dmg), final.atk),
    { cond: cmpGE(constellation, 6, 'infer', '') }
  ),
  customDmg(
    'c6_dmg2',
    'cryo',
    'elemental',
    prod(percent(dm.constellation6.dmg2), final.atk),
    { cond: cmpGE(constellation, 6, beamOn, '') }
  ),
  customDmg(
    'c6_ssDmg',
    'cryo',
    'elemental',
    prod(percent(dm.constellation6.ssDmg), final.atk),
    { cond: cmpGE(constellation, 6, beamSsOn, '') }
  ),

  customParam('a0_stellarconduct_baseDmg_', a0_stellarconduct_baseDmg_),
  customParam('a0_stellarswirl_baseDmg_', a0_stellarconduct_baseDmg_),
  customParam('a4_eleMas', a4EleMas, {
    cond: cmpGE(ascension, 4, 'infer', ''),
  }),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost),
  customParam('c4_cd', dm.constellation4.cd, {
    cond: cmpGE(constellation, 4, 'infer', ''),
  })
)
