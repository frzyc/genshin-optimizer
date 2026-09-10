import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allElementWithPhyKeys } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod } from '@genshin-optimizer/pando/engine'
import { infusionPrio } from '../common/dmg'
import {
  allBoolConditionals,
  allNumConditionals,
  customParam,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'AratakiItto'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[0],
      skillParam_gen.auto[1],
      skillParam_gen.auto[2],
      skillParam_gen.auto[3],
    ],
  },
  charged: {
    sSlash: skillParam_gen.auto[4],
    akSlash: skillParam_gen.auto[5],
    akFinal: skillParam_gen.auto[6],
    stam: skillParam_gen.auto[7][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[8],
    low: skillParam_gen.auto[9],
    high: skillParam_gen.auto[10],
  },
  ss: {
    //Superlative Superstrength
    duration: skillParam_gen.auto[11][0],
  },
  skill: {
    dmg: skillParam_gen.skill[0],
    hp: skillParam_gen.skill[1],
    duration: skillParam_gen.skill[2][0],
    ss_cd: skillParam_gen.skill[3][0],
    cd: skillParam_gen.skill[4][0],
  },
  burst: {
    atkSpd: skillParam_gen.burst[0][0],
    defConv: skillParam_gen.burst[1],
    resDec: skillParam_gen.burst[2][0],
    duration: skillParam_gen.burst[3][0],
    cd: skillParam_gen.burst[4][0],
    cost: skillParam_gen.burst[5][0],
  },
  passive1: {
    maxStacks: 3,
    atkSPD_: 0.1,
  },
  passive2: {
    def_: skillParam_gen.passive2[0][0],
  },
  constellation1: {
    initialStacks: skillParam_gen.constellation1[0],
    timedStacks: skillParam_gen.constellation1[1],
  },
  constellation2: {
    burstCdRed: skillParam_gen.constellation2[0],
    energyRegen: skillParam_gen.constellation2[1],
  },
  constellation4: {
    def_: skillParam_gen.constellation4[0],
    atk_: skillParam_gen.constellation4[1],
    duration: skillParam_gen.constellation4[2],
  },
  constellation6: {
    charged_critDMG_: skillParam_gen.constellation6[0],
  },
}

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill, burst, ascension, constellation },
} = own
// WR cond(key, 'burst' | 'passive1' | 'constellation4')
const { burst: burstCond, constellation4 } = allBoolConditionals(info.key)
const { passive1 } = allNumConditionals(
  info.key,
  true,
  0,
  dm.passive1.maxStacks
)

// Read DEF at sheet:agg so this premod.atk write does not cycle through final.def.
const burstAtkFromDef = burstCond.ifOn(
  prod(
    own.premod.def.sheet('agg'),
    percent(talentSubscript(burst, dm.burst.defConv))
  )
)
const burstAtkSpd_ = burstCond.ifOn(percent(dm.burst.atkSpd))
const burstRes_ = burstCond.ifOn(percent(-dm.burst.resDec))
// WR greaterEq(asc, 4, lookup(passive1, 1..3 → 10% * i)). Kit A1 is asc 1.
const p1AtkSpd_ = cmpGE(
  ascension,
  4,
  prod(passive1, percent(dm.passive1.atkSPD_))
)
// WR dmgNode overlay premod.charged_dmgInc on Kesagiri listings only.
const a4KesagiriDmgInc = cmpGE(
  ascension,
  4,
  prod(percent(dm.passive2.def_), own.premod.def.sheet('agg'))
)
const c4_atk_ = constellation4.ifOn(
  cmpGE(constellation, 4, percent(dm.constellation4.atk_))
)
const c4_def_ = constellation4.ifOn(
  cmpGE(constellation, 4, percent(dm.constellation4.def_))
)
const c6_charged_critDMG_ = cmpGE(
  constellation,
  6,
  percent(dm.constellation6.charged_critDMG_)
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Masatsu Zetsugi: Akaushi Burst! (skill); C5 Royal Descent (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.atk.add(burstAtkFromDef),
  ownBuff.premod.atkSPD_.add(burstAtkSpd_),
  ownBuff.premod.atkSPD_.add(p1AtkSpd_),
  ownBuff.premod.critDMG_.charged.add(c6_charged_critDMG_),
  ownBuff.reaction.infusionIndex.add(
    burstCond.ifOn(infusionPrio.nonOverridable.geo)
  ),
  allElementWithPhyKeys.map((ele) => ownBuff.premod.res_[ele].add(burstRes_)),
  teamBuff.premod.atk_.add(c4_atk_),
  teamBuff.premod.def_.add(c4_def_),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_sSlash', info, 'atk', dm.charged.sSlash, 'charged'),
  dmg(
    'charged_akSlash',
    info,
    'atk',
    dm.charged.akSlash,
    'charged',
    undefined,
    ownBuff.formula.base.add(a4KesagiriDmgInc)
  ),
  dmg(
    'charged_akFinal',
    info,
    'atk',
    dm.charged.akFinal,
    'charged',
    undefined,
    ownBuff.formula.base.add(a4KesagiriDmgInc)
  ),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill', info, 'atk', dm.skill.dmg, 'skill'),
  customParam(
    'skill_hp',
    prod(percent(talentSubscript(skill, dm.skill.hp)), final.hp)
  ),
  customParam('burst_atkFromDef', burstAtkFromDef),
  customParam('a4_kesagiri_dmgInc', a4KesagiriDmgInc, {
    cond: cmpGE(ascension, 4, 'infer', ''),
  }),

  customParam('charged_stam', dm.charged.stam),
  customParam('ss_duration', dm.ss.duration),
  customParam('skill_duration', dm.skill.duration),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_cost', dm.burst.cost)
)
