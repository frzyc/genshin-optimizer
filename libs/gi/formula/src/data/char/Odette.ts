import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, max, min, prod, sum } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allListConditionals,
  allNumConditionals,
  customDmg,
  customParam,
  enemyDebuff,
  notOwnBuff,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Odette'
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
      skillParam_gen.auto[a++], // 3.1
      skillParam_gen.auto[a++], // 3.2
      skillParam_gen.auto[a++], // 4
      skillParam_gen.auto[a++], // 5
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
  skill: {
    skillDmg: skillParam_gen.skill[s++],
    codaDotDmg: skillParam_gen.skill[s++],
    codaStellarconductDmg: skillParam_gen.skill[s++],
    codaStellarswirlDmg: skillParam_gen.skill[s++],
    plumeDmg: skillParam_gen.skill[s++],
    plumeStellarconductDmg: skillParam_gen.skill[s++],
    plumeStellarswirlDmg: skillParam_gen.skill[s++],
    wingDmg: skillParam_gen.skill[s++],
    wingStellarconductDmg: skillParam_gen.skill[s++],
    wingStellarswirlDmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    codaCd: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    slashDmg: skillParam_gen.burst[b++], // x3
    finalDmg: skillParam_gen.burst[b++],
    stellar_dmg_: skillParam_gen.burst[b++],
    snowDuration: skillParam_gen.burst[b++][0],
    soloDuration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    stackGain: skillParam_gen.passive1[0][0],
    stellar_dmg_: skillParam_gen.passive1[1][0],
    stackLoss: skillParam_gen.passive1[2][0],
  },
  passive2: {
    atkThresh: skillParam_gen.passive2[0][0],
    stellar_mult_: skillParam_gen.passive2[1][0],
    max_stellar_mult_: skillParam_gen.passive2[2][0],
  },
  passive3: {
    base_stellar_dmg_: skillParam_gen.passive3![0][0],
    maxBase_stellar_dmg_: skillParam_gen.passive3![1][0],
  },
  constellation1: {
    stackGain: skillParam_gen.constellation1[0],
    stackLoss: skillParam_gen.constellation1[1],
    four: skillParam_gen.constellation1[2],
    stellarconduct_dmg: skillParam_gen.constellation1[3],
    stellarswirl_dmg: skillParam_gen.constellation1[4],
  },
  constellation2: {
    atk_: skillParam_gen.constellation2[0],
    ele_enemyRes_: -skillParam_gen.constellation2[1],
  },
  constellation4: {
    stellarconduct_dmg: skillParam_gen.constellation4[0],
    stellarswirl_dmg: skillParam_gen.constellation4[1],
    cd: skillParam_gen.constellation4[2],
    stellar_dmg_: skillParam_gen.constellation4[3],
  },
  constellation6: {
    team_stellar_specialDmg_: skillParam_gen.constellation6[0],
    self_stellar_specialDmg_: skillParam_gen.constellation6[1],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { burst, ascension, constellation },
} = own
// WR cond(key, 'burst' | 'c2NearOpponent') `'on'`
const { burst: burstCond, c2NearOpponent } = allBoolConditionals(info.key)
// WR cond(key, 'a0StellarRadiance') states `'sc'` / `'ss'`
const { a0StellarRadiance } = allListConditionals(info.key, ['sc', 'ss'])
const maxSplendor = dm.passive1.stackGain + dm.constellation1.stackGain
// WR lookup a1TeamSplendor 0–maxSplendor (C1 unlocks stacks above stackGain)
const { a1TeamSplendor } = allNumConditionals(info.key, true, 0, maxSplendor)

const radianceSc = a0StellarRadiance.map({ sc: 1, ss: 0 })
const radianceSs = a0StellarRadiance.map({ sc: 0, ss: 1 })
const radianceOn = sum(radianceSc, radianceSs)
const scOrUnsetOn = cmpGE(radianceSs, 1, '', 'infer')
const scOn = cmpGE(radianceSc, 1, 'infer', '')
const ssOn = cmpGE(radianceSs, 1, 'infer', '')

const a1TeamSplendorStacks = cmpGE(
  constellation,
  1,
  a1TeamSplendor,
  cmpGE(a1TeamSplendor, dm.passive1.stackGain + 1, 0, a1TeamSplendor)
)
const a1SplendorOn = cmpGE(a1TeamSplendor, 1, 1)
const a1SelfSplendor = prod(
  a1SplendorOn,
  cmpGE(
    constellation,
    6,
    maxSplendor,
    sum(
      cmpGE(constellation, 1, maxSplendor, dm.passive1.stackGain),
      prod(-1, a1TeamSplendorStacks)
    )
  )
)
const a1_stellar_dmg_ = cmpGE(
  ascension,
  1,
  prod(percent(dm.passive1.stellar_dmg_), a1TeamSplendorStacks)
)
const a1Self_stellar_dmg_ = cmpGE(
  ascension,
  1,
  prod(percent(dm.passive1.stellar_dmg_), a1SelfSplendor)
)

const burst_stellar_dmg_ = burstCond.ifOn(
  percent(talentSubscript(burst, dm.burst.stellar_dmg_))
)
const c4Burst_stellar_dmg_ = cmpGE(
  constellation,
  4,
  prod(burst_stellar_dmg_, percent(dm.constellation4.stellar_dmg_))
)

const a0_stellar_baseDmg_ = min(
  prod(percent(dm.passive3.base_stellar_dmg_), final.atk, 1 / 100),
  percent(dm.passive3.maxBase_stellar_dmg_)
)
const a4_stellar_mult_disp = cmpGE(
  ascension,
  4,
  max(
    min(
      prod(
        sum(final.atk, -dm.passive2.atkThresh),
        percent(dm.passive2.stellar_mult_ / 100)
      ),
      percent(dm.passive2.max_stellar_mult_)
    ),
    0
  )
)
const a4_stellar_mult_ = sum(1, a4_stellar_mult_disp)

const c2Self_atk_ = cmpGE(
  constellation,
  2,
  cmpGE(ascension, 1, prod(a1SelfSplendor, percent(dm.constellation2.atk_)))
)
const c2Team_atk_ = cmpGE(
  constellation,
  2,
  cmpGE(
    ascension,
    1,
    prod(a1TeamSplendorStacks, percent(dm.constellation2.atk_))
  )
)
const c2Near_res_ = c2NearOpponent.ifOn(
  cmpGE(constellation, 2, percent(dm.constellation2.ele_enemyRes_))
)
const c2Near_cryo_res_ = prod(c2Near_res_, radianceOn)
const c2Near_electro_res_ = prod(c2Near_res_, radianceSc)
const c2Near_anemo_res_ = prod(c2Near_res_, radianceSs)

const c6Self_stellar_specialDmg_ = cmpGE(
  constellation,
  6,
  percent(dm.constellation6.self_stellar_specialDmg_)
)
const c6Team_stellar_specialDmg_ = cmpGE(
  constellation,
  6,
  prod(a1SplendorOn, percent(dm.constellation6.team_stellar_specialDmg_))
)

function stellarHit(name: string, table: number[], cond: typeof scOn) {
  return dmg(name, info, 'atk', table, 'skill', {
    ele: 'cryo',
    cond,
    baseMulti: a4_stellar_mult_,
  })
}

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Adagio: Phantom Night Dancers (skill); C5 Presto: Bluebird Finale (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.atk_.add(c2Self_atk_),
  ownBuff.premod.dmg_.stellarconduct.add(burst_stellar_dmg_),
  ownBuff.premod.dmg_.stellarswirl.add(burst_stellar_dmg_),
  ownBuff.premod.dmg_.stellarconduct.add(a1Self_stellar_dmg_),
  ownBuff.premod.dmg_.stellarswirl.add(a1Self_stellar_dmg_),
  // C6 — WR stellar*_specialDmg_ (no Pando specialDmg_ tag)
  ownBuff.premod.dmg_.stellarconduct.add(c6Self_stellar_specialDmg_),
  ownBuff.premod.dmg_.stellarswirl.add(c6Self_stellar_specialDmg_),

  // A0 Stellar Jubilee — WR teamBuff stellarconduct_baseDmg_ / stellarswirl_baseDmg_
  // (no Pando baseDmg_ tag; Flins lunarcharged_baseDmg_)
  teamBuff.premod.dmg_.stellarconduct.add(a0_stellar_baseDmg_),
  teamBuff.premod.dmg_.stellarswirl.add(a0_stellar_baseDmg_),
  // WR teamBuff.premod.*_dmg_ unequal(target.charKey, key)
  notOwnBuff.premod.dmg_.stellarconduct.add(a1_stellar_dmg_),
  notOwnBuff.premod.dmg_.stellarswirl.add(a1_stellar_dmg_),
  notOwnBuff.premod.atk_.add(c2Team_atk_),
  notOwnBuff.premod.dmg_.stellarconduct.add(c4Burst_stellar_dmg_),
  notOwnBuff.premod.dmg_.stellarswirl.add(c4Burst_stellar_dmg_),
  notOwnBuff.premod.dmg_.stellarconduct.add(c6Team_stellar_specialDmg_),
  notOwnBuff.premod.dmg_.stellarswirl.add(c6Team_stellar_specialDmg_),
  // WR teamBuff.premod.<ele>_enemyRes_ (attacker tag); Pando enemy preRes.
  enemyDebuff.common.preRes.cryo.add(c2Near_cryo_res_),
  enemyDebuff.common.preRes.electro.add(c2Near_electro_res_),
  enemyDebuff.common.preRes.anemo.add(c2Near_anemo_res_),

  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill', info, 'atk', dm.skill.skillDmg, 'skill'),
  dmg('skill_codaDotDmg', info, 'atk', dm.skill.codaDotDmg, 'skill'),
  stellarHit(
    'skill_codaStellarconductDmg',
    dm.skill.codaStellarconductDmg,
    scOrUnsetOn
  ),
  stellarHit('skill_codaStellarswirlDmg', dm.skill.codaStellarswirlDmg, ssOn),
  dmg('skill_plumeDmg', info, 'atk', dm.skill.plumeDmg, 'skill'),
  stellarHit(
    'skill_plumeStellarconductDmg',
    dm.skill.plumeStellarconductDmg,
    scOn
  ),
  stellarHit('skill_plumeStellarswirlDmg', dm.skill.plumeStellarswirlDmg, ssOn),
  dmg('skill_wingDmg', info, 'atk', dm.skill.wingDmg, 'skill'),
  stellarHit(
    'skill_wingStellarconductDmg',
    dm.skill.wingStellarconductDmg,
    scOn
  ),
  stellarHit('skill_wingStellarswirlDmg', dm.skill.wingStellarswirlDmg, ssOn),
  dmg('burst_slashDmg', info, 'atk', dm.burst.slashDmg, 'burst'),
  dmg('burst_finalDmg', info, 'atk', dm.burst.finalDmg, 'burst'),
  // WR stellarDmgNode (stellarconduct/stellarswirl / cryo); talent-style listing until trans pipeline exists.
  customDmg(
    'c1_stellarconduct_dmg',
    'cryo',
    'elemental',
    prod(
      percent(dm.constellation1.stellarconduct_dmg),
      final.atk,
      a4_stellar_mult_
    ),
    { cond: cmpGE(constellation, 1, scOrUnsetOn, '') }
  ),
  customDmg(
    'c1_stellarswirl_dmg',
    'cryo',
    'elemental',
    prod(
      percent(dm.constellation1.stellarswirl_dmg),
      final.atk,
      a4_stellar_mult_
    ),
    { cond: cmpGE(constellation, 1, ssOn, '') }
  ),
  customDmg(
    'c4_stellarconduct_dmg',
    'cryo',
    'elemental',
    prod(
      percent(dm.constellation4.stellarconduct_dmg),
      final.atk,
      a4_stellar_mult_
    ),
    { cond: cmpGE(constellation, 4, scOrUnsetOn, '') }
  ),
  customDmg(
    'c4_stellarswirl_dmg',
    'cryo',
    'elemental',
    prod(
      percent(dm.constellation4.stellarswirl_dmg),
      final.atk,
      a4_stellar_mult_
    ),
    { cond: cmpGE(constellation, 4, ssOn, '') }
  ),

  customParam('a4_stellar_mult_', a4_stellar_mult_disp, {
    cond: cmpGE(ascension, 4, 'infer', ''),
  }),
  customParam('a0_stellarconduct_baseDmg_', a0_stellar_baseDmg_),
  customParam('a0_stellarswirl_baseDmg_', a0_stellar_baseDmg_),
  customParam('charged_stam', dm.charged.stam),
  customParam('skill_duration', dm.skill.duration),
  customParam('skill_codaCd', dm.skill.codaCd),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_snowDuration', dm.burst.snowDuration),
  customParam('burst_soloDuration', dm.burst.soloDuration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost),
  customParam('c4_cd', dm.constellation4.cd, {
    cond: cmpGE(constellation, 4, 'infer', ''),
  })
)
