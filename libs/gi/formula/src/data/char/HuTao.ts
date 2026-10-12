import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allElementWithPhyKeys } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, min, prod } from '@genshin-optimizer/pando/engine'
import { infusionPrio } from '../common/dmg'
import {
  allBoolConditionals,
  customHeal,
  customParam,
  notOwnBuff,
  own,
  ownBuff,
  percent,
  register,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'HuTao'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = 0,
  s = 0,
  b = 0,
  p1 = 0,
  p2 = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3
      skillParam_gen.auto[a++], // 4
      skillParam_gen.auto[a++], // 5.1
      skillParam_gen.auto[a++], // 5.2
      skillParam_gen.auto[a++], // 6
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
    activationCost: skillParam_gen.skill[s++][0],
    atkInc: skillParam_gen.skill[s++],
    dmg: skillParam_gen.skill[s++],
    bloodBlossomDuration: skillParam_gen.skill[s++][0],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
    maxAtkInc: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    lowHpDmg: skillParam_gen.burst[b++],
    regen: skillParam_gen.burst[b++],
    lowHpRegen: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
    minHp: skillParam_gen.burst[b++][0],
  },
  passive1: {
    critRateInc: skillParam_gen.passive1[p1++][0],
    duration: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    minHp: skillParam_gen.passive2[p2++][0],
    pyroDmgInc: skillParam_gen.passive2[p2++][0],
  },
  constellation2: {
    bloodBlossomDmgInc: skillParam_gen.constellation2[0],
  },
  constellation4: {
    critRateInc: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
  },
  constellation6: {
    minHp: skillParam_gen.constellation6[0],
    duration: skillParam_gen.constellation6[1],
    elePhysResInc: skillParam_gen.constellation6[2],
    critRateInc: skillParam_gen.constellation6[3],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill, burst, ascension, constellation },
} = own
// WR cond(key, 'GuideToAfterlifeVoyage' | 'FlutterBy' | 'SanguineRouge' | 'GardenOfEternalRest' | 'ButterflysEmbrace')
const {
  GuideToAfterlifeVoyage,
  FlutterBy,
  SanguineRouge,
  GardenOfEternalRest,
  ButterflysEmbrace,
} = allBoolConditionals(info.key)

// Read HP at sheet:agg so this premod.atk write does not cycle through final.hp.
const skillAtkFromHp = GuideToAfterlifeVoyage.ifOn(
  min(
    prod(
      percent(talentSubscript(skill, dm.skill.atkInc)),
      own.premod.hp.sheet('agg')
    ),
    prod(percent(dm.skill.maxAtkInc), own.base.atk)
  )
)
const a1_critRate_ = FlutterBy.ifOn(
  cmpGE(ascension, 1, percent(dm.passive1.critRateInc))
)
const a4_pyro_dmg_ = SanguineRouge.ifOn(
  cmpGE(ascension, 4, percent(dm.passive2.pyroDmgInc))
)
const c2_skill_dmgInc = cmpGE(
  constellation,
  2,
  prod(
    percent(dm.constellation2.bloodBlossomDmgInc),
    own.premod.hp.sheet('agg')
  )
)
const c4_critRate_ = GardenOfEternalRest.ifOn(
  cmpGE(constellation, 4, percent(dm.constellation4.critRateInc))
)
const c6_critRate_ = ButterflysEmbrace.ifOn(
  cmpGE(constellation, 6, percent(dm.constellation6.critRateInc))
)
const c6_res_ = ButterflysEmbrace.ifOn(
  cmpGE(constellation, 6, percent(dm.constellation6.elePhysResInc))
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Guide to Afterlife (skill); C5 Spirit Soother (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.atk.add(skillAtkFromHp),
  ownBuff.reaction.infusionIndex.add(
    GuideToAfterlifeVoyage.ifOn(infusionPrio.nonOverridable.pyro)
  ),
  // WR A1/C4 dest ≠ Hu Tao
  notOwnBuff.premod.critRate_.add(a1_critRate_),
  ownBuff.premod.dmg_.pyro.add(a4_pyro_dmg_),
  ownBuff.formula.base.skill.add(c2_skill_dmgInc),
  notOwnBuff.premod.critRate_.add(c4_critRate_),
  ownBuff.premod.critRate_.add(c6_critRate_),
  allElementWithPhyKeys.map((ele) => ownBuff.premod.res_[ele].add(c6_res_)),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  // WR blood blossom sets hit.reaction to ''; Pando has no no-react overlay.
  dmg('skill', info, 'atk', dm.skill.dmg, 'skill'),
  customParam('skill_atk', skillAtkFromHp),
  dmg('burst', info, 'atk', dm.burst.dmg, 'burst'),
  dmg('burst_lowHp', info, 'atk', dm.burst.lowHpDmg, 'burst'),
  customHeal(
    'burst_regen',
    prod(percent(talentSubscript(burst, dm.burst.regen)), final.hp)
  ),
  customHeal(
    'burst_lowHpRegen',
    prod(percent(talentSubscript(burst, dm.burst.lowHpRegen)), final.hp)
  )
)
