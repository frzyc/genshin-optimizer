import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, cmpNE, prod } from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import {
  allBoolConditionals,
  allNumConditionals,
  customDmg,
  customParam,
  hexereiTally,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Cyno'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let s = 0,
  b = 5,
  p1 = 0,
  p2 = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[0], // 1
      skillParam_gen.auto[1], // 2
      skillParam_gen.auto[2], // 3x2
      // skillParam_gen.auto[3], // 3x2
      skillParam_gen.auto[4], // 4
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[5],
    stamina: skillParam_gen.auto[6][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[7],
    low: skillParam_gen.auto[8],
    high: skillParam_gen.auto[9],
  },
  skill: {
    skillDmg: skillParam_gen.skill[s++],
    riteDmg: skillParam_gen.skill[s++],
    durationBonus: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
    cdRite: skillParam_gen.skill[s++][0],
  },
  burst: {
    normal: {
      hitArr: [
        skillParam_gen.burst[0], // 1
        skillParam_gen.burst[1], // 2
        skillParam_gen.burst[2], // 3
        skillParam_gen.burst[3], // 4x2
        // skillParam_gen.burst[4], // 4x2
        skillParam_gen.burst[b++], // 5
      ],
    },
    charged: {
      dmg: skillParam_gen.burst[b++],
      stamina: skillParam_gen.burst[b++][0],
    },
    plunging: {
      dmg: skillParam_gen.burst[b++],
      low: skillParam_gen.burst[b++],
      high: skillParam_gen.burst[b++],
    },
    eleMas: skillParam_gen.burst[b++][0],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    skill_dmg_: skillParam_gen.passive1[p1++][0],
    boltDmg: skillParam_gen.passive1[p1++][0],
    boltStellarDmg: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    burst_normal_dmgInc_: skillParam_gen.passive2[p2++][0],
    bolt_dmgInc_: skillParam_gen.passive2[p2++][0],
    boltStellar_dmgInc_: skillParam_gen.passive2[p2++][0],
  },
  constellation1: {
    normal_atkSpd_: skillParam_gen.constellation1[0],
    duration: skillParam_gen.constellation1[1],
    eleMas: skillParam_gen.constellation1[2],
  },
  constellation2: {
    electro_dmg_: skillParam_gen.constellation2[0],
    duration: skillParam_gen.constellation2[1],
    maxStacks: skillParam_gen.constellation2[2],
    cd: skillParam_gen.constellation2[3],
    stellarconduct_dmg_: skillParam_gen.constellation2[4],
  },
  constellation4: {
    energyRestore: skillParam_gen.constellation4[0],
    charges: skillParam_gen.constellation4[1],
    energyRestore2: skillParam_gen.constellation4[2],
    cd: skillParam_gen.constellation4[3],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { burst, ascension, constellation },
} = own
const {
  lockRevelation,
  lockStellarRadianceSc,
  afterBurst,
  a1Judication,
  c1Together,
} = allBoolConditionals(info.key)
const { c2NormHitStacks } = allNumConditionals(
  info.key,
  true,
  0,
  dm.constellation2.maxStacks
)
const { c2TeamHit } = allNumConditionals(info.key, true, 0, 5)

const hexOn = lockRevelation.ifOn(1)
const radianceOn = lockStellarRadianceSc.ifOn(1)
const afterBurst_eleMas = afterBurst.ifOn(dm.burst.eleMas)
const a1Judication_soulfarer_dmg_ = a1Judication.ifOn(
  cmpGE(ascension, 1, dm.passive1.skill_dmg_)
)
const a4_burstNormal_dmgInc = cmpGE(
  ascension,
  4,
  prod(
    percent(dm.passive2.burst_normal_dmgInc_),
    own.premod.eleMas.sheet('agg')
  )
)
const a4_bolt_dmgInc = cmpGE(
  ascension,
  4,
  prod(percent(dm.passive2.bolt_dmgInc_), own.premod.eleMas.sheet('agg'))
)
const a4_boltStellar_dmgInc = cmpGE(
  ascension,
  4,
  prod(
    hexOn,
    radianceOn,
    percent(dm.passive2.boltStellar_dmgInc_),
    own.premod.eleMas.sheet('agg')
  )
)
const c1Together_eleMas = c1Together.ifOn(
  cmpGE(constellation, 1, prod(hexOn, radianceOn, dm.constellation1.eleMas))
)
const c2_electro_dmg_ = cmpGE(
  constellation,
  2,
  prod(c2NormHitStacks, percent(dm.constellation2.electro_dmg_))
)
const c2TeamHit_stellarconduct_dmg_ = cmpGE(
  constellation,
  2,
  prod(
    hexOn,
    radianceOn,
    c1Together.ifOn(1),
    c2TeamHit,
    percent(dm.constellation2.stellarconduct_dmg_)
  )
)

function burstHit(
  name: string,
  table: number[],
  move: 'normal' | 'charged' | 'plunging',
  extraBase = false
) {
  return customDmg(
    name,
    'electro',
    move,
    prod(percent(talentSubscript(burst, table)), final.atk),
    undefined,
    ...(extraBase ? [ownBuff.formula.base.add(a4_burstNormal_dmgInc)] : [])
  )
}

export default register(
  info.key,
  entriesForChar(info, data_gen),
  hexereiTally(hexOn),
  // C3 Sacred Rite: Wolf's Swiftness (burst); C5 Secret Rite: Wolf's Swiftness (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.eleMas.add(afterBurst_eleMas),
  ownBuff.premod.dmg_.electro.add(c2_electro_dmg_),
  // WR dest-gated teamBuff (active dest, includes self).
  teamBuff.premod.eleMas.add(cmpNE(destIsActive, 0, c1Together_eleMas)),
  teamBuff.premod.dmg_.stellarconduct.add(
    cmpNE(destIsActive, 0, c2TeamHit_stellarconduct_dmg_)
  ),

  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg(
    'skill',
    info,
    'atk',
    dm.skill.skillDmg,
    'skill',
    undefined,
    ownBuff.premod.dmg_.skill.add(a1Judication_soulfarer_dmg_)
  ),
  dmg(
    'skill_rite',
    info,
    'atk',
    dm.skill.riteDmg,
    'skill',
    undefined,
    ownBuff.premod.dmg_.skill.add(a1Judication_soulfarer_dmg_)
  ),
  dm.burst.normal.hitArr.flatMap((arr, i) =>
    burstHit(`burst_normal_${i}`, arr, 'normal', true)
  ),
  burstHit('burst_charged', dm.burst.charged.dmg, 'charged'),
  burstHit('burst_plunging_dmg', dm.burst.plunging.dmg, 'plunging'),
  burstHit('burst_plunging_low', dm.burst.plunging.low, 'plunging'),
  burstHit('burst_plunging_high', dm.burst.plunging.high, 'plunging'),
  customDmg(
    'a1_bolt',
    'electro',
    'skill',
    prod(percent(dm.passive1.boltDmg), final.atk),
    { cond: cmpGE(ascension, 1, 'infer', '') },
    ownBuff.formula.base.add(a4_bolt_dmgInc)
  ),
  customDmg(
    'a1_bolt_stellar',
    'electro',
    'skill',
    prod(percent(dm.passive1.boltStellarDmg), final.atk),
    {
      cond: cmpGE(
        prod(hexOn, radianceOn, cmpGE(ascension, 1, 1)),
        1,
        'infer',
        ''
      ),
    },
    ownBuff.formula.base.add(a4_boltStellar_dmgInc)
  ),

  customParam('charged_stamina', dm.charged.stamina),
  customParam('skill_cd', dm.skill.cd),
  customParam('skill_cdRite', dm.skill.cdRite),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
