import {
  allElementWithPhyKeys,
  type CharacterKey,
} from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, lookup, prod, sum } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allListConditionals,
  allNumConditionals,
  enemyDebuff,
  own,
  ownBuff,
  percent,
  register,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Somnia'
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
    dmg: skillParam_gen.skill[s++],
    norm_charged_dmgInc: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    pressDmg: skillParam_gen.burst[b++],
    eleMas_: skillParam_gen.burst[b++],
    multDotDmg: skillParam_gen.burst[b++],
    sunderDmg: skillParam_gen.burst[b++],
    addDotDmg: skillParam_gen.burst[b++],
    supernovaDmg: skillParam_gen.burst[b++],
    subDotDmg: skillParam_gen.burst[b++],
    subDmgInc: skillParam_gen.burst[b++],
    subElemRes: skillParam_gen.burst[b++],
    resDuration: skillParam_gen.burst[b++][0],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    energyCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    chargedStamRed: skillParam_gen.passive1[0][0],
    chargedCastSpeed: skillParam_gen.passive1[1][0],
  },
  passive2: {
    elemas: skillParam_gen.passive2[0][0],
    stacks: skillParam_gen.passive2[1][0],
    maxElemas: skillParam_gen.passive2[2][0],
  },
  constellation1: {
    chance: skillParam_gen.constellation1[0],
    dmg: skillParam_gen.constellation1[1],
  },
  constellation2: {
    dmg: skillParam_gen.constellation2[0],
  },
  constellation4: {
    energyRestore: skillParam_gen.constellation4[0],
    cd: skillParam_gen.constellation4[1],
  },
  constellation6: {
    cd: skillParam_gen.constellation6[2],
    critRate_: skillParam_gen.constellation6[3],
    critDMG_: skillParam_gen.constellation6[4],
    maxStacks: skillParam_gen.constellation6[5],
    duration: skillParam_gen.constellation6[6],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  char: { skill, burst, ascension, constellation },
} = own
// WR cond(key, 'superposition' | 'cycloneActive' | 'multiplication' | 'subtraction' | 'lessThan3' | 'c2Prime') `'on'`
const {
  superposition,
  cycloneActive,
  multiplication,
  subtraction,
  lessThan3,
  c2Prime,
} = allBoolConditionals(info.key)
// WR lookup(cond(key, 'a4EnemiesHit'), 1..stacks); lookup(cond(key, 'c6Stacks'), 1..max)
const { a4EnemiesHit } = allNumConditionals(
  info.key,
  true,
  0,
  dm.passive2.stacks
)
const { c6Stacks } = allNumConditionals(
  info.key,
  true,
  0,
  dm.constellation6.maxStacks
)
// WR cond(key, 'c1Mode') states `'average'` | `'always'`
const { c1Mode } = allListConditionals(info.key, ['average', 'always'])

const superposition_normCharged_dmgInc = superposition.ifOn(
  prod(
    percent(talentSubscript(skill, dm.skill.norm_charged_dmgInc)),
    own.final.eleMas
  )
)
const subtraction_normCharged_dmgInc = cycloneActive.ifOn(
  subtraction.ifOn(
    prod(percent(talentSubscript(burst, dm.burst.subDmgInc)), own.final.eleMas)
  )
)
const c2PrimeDmgInc = cmpGE(
  constellation,
  2,
  superposition.ifOn(c2Prime.ifOn(superposition_normCharged_dmgInc))
)
const lessThan3_eleRes_ = lessThan3.ifOn(
  prod(percent(talentSubscript(burst, dm.burst.subElemRes)), own.final.eleMas)
)
const cyclone_eleMas = cycloneActive.ifOn(
  prod(
    percent(talentSubscript(burst, dm.burst.eleMas_)),
    own.premod.eleMas.sheet('agg')
  )
)
const a4_eleMas = cycloneActive.ifOn(
  cmpGE(
    ascension,
    4,
    prod(
      percent(dm.passive2.elemas),
      a4EnemiesHit,
      own.premod.eleMas.sheet('agg')
    )
  )
)
const c1ModeMult = sum(
  1,
  cmpGE(
    constellation,
    1,
    c1Mode.map({
      average: dm.constellation1.chance * dm.constellation1.dmg,
      always: dm.constellation1.dmg,
    })
  )
)
const c6_critRate_ = cmpGE(
  constellation,
  6,
  prod(percent(dm.constellation6.critRate_), c6Stacks)
)
const c6_critDMG_ = cmpGE(
  constellation,
  6,
  prod(percent(dm.constellation6.critDMG_), c6Stacks)
)
const correctWep = lookup(
  own.common.weaponType,
  { sword: 1, claymore: 1, polearm: 1 },
  0
)
// WR teamBuff.infusion.team electro (sword/claymore/polearm). infusionPrio has no electro.
const infusionOn = cmpGE(
  prod(cycloneActive.ifOn(1), multiplication.ifOn(1), correctWep),
  1,
  'infer',
  ''
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Parallax Paws (burst); C5 Cosmic Calculator (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  // WR premod.normal_dmgInc / charged_dmgInc → formula.base
  ownBuff.formula.base.normal.add(
    sum(
      superposition_normCharged_dmgInc,
      subtraction_normCharged_dmgInc,
      c2PrimeDmgInc
    )
  ),
  ownBuff.formula.base.charged.add(
    sum(
      superposition_normCharged_dmgInc,
      subtraction_normCharged_dmgInc,
      c2PrimeDmgInc
    )
  ),
  ownBuff.final.eleMas.add(sum(cyclone_eleMas, a4_eleMas)),
  ownBuff.premod.critRate_.add(c6_critRate_),
  ownBuff.premod.critDMG_.add(c6_critDMG_),
  // WR teamBuff.premod.<ele>_enemyRes_ (attacker tag); Pando enemy preRes. Keep WR sign.
  allElementWithPhyKeys.map((ele) =>
    enemyDebuff.common.preRes[ele].add(lessThan3_eleRes_)
  ),

  // Catalyst NA/CA/plunge are already electro. WR team infusion is listing-local
  // (infusionPrio has no electro); catalyst correctWep hides the extra listings.
  dm.normal.hitArr.flatMap((arr, i) => [
    ...dmg(`normal_${i}`, info, 'atk', arr, 'normal', {
      baseMulti: c1ModeMult,
    }),
    ...dmg(`normal_${i}_electro`, info, 'atk', arr, 'normal', {
      ele: 'electro',
      cond: infusionOn,
      baseMulti: c1ModeMult,
    }),
  ]),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged', {
    baseMulti: c1ModeMult,
  }),
  dmg('charged_electro', info, 'atk', dm.charged.dmg, 'charged', {
    ele: 'electro',
    cond: infusionOn,
    baseMulti: c1ModeMult,
  }),
  Object.entries(dm.plunging).flatMap(([k, v]) => [
    ...dmg(`plunging_${k}`, info, 'atk', v, 'plunging'),
    ...dmg(`plunging_${k}_electro`, info, 'atk', v, 'plunging', {
      ele: 'electro',
      cond: infusionOn,
    }),
  ]),
  dmg('skill', info, 'atk', dm.skill.dmg, 'skill'),
  dmg('burst_initial', info, 'atk', dm.burst.pressDmg, 'burst'),
  dmg('burst_multDot', info, 'atk', dm.burst.multDotDmg, 'burst'),
  dmg('burst_sunder', info, 'eleMas', dm.burst.sunderDmg, 'burst'),
  dmg('burst_addDot', info, 'atk', dm.burst.addDotDmg, 'burst'),
  dmg('burst_supernova', info, 'eleMas', dm.burst.supernovaDmg, 'burst'),
  dmg('burst_subDot', info, 'atk', dm.burst.subDotDmg, 'burst')
)
