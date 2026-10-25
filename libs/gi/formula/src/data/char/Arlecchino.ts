import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allElementWithPhyKeys } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, max, min, prod, sum } from '@genshin-optimizer/pando/engine'
import { infusionPrio } from '../common/dmg'
import {
  allBoolConditionals,
  allListConditionals,
  customDmg,
  own,
  ownBuff,
  percent,
  register,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Arlecchino'
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
      skillParam_gen.auto[++a], // 3
      skillParam_gen.auto[++a], // 4x2
      skillParam_gen.auto[++a], // 5
      skillParam_gen.auto[++a], // 6
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[++a], // x2
    stam: skillParam_gen.auto[++a][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[++a],
    low: skillParam_gen.auto[++a],
    high: skillParam_gen.auto[++a],
  },
  infusion: {
    normal_dmgInc: skillParam_gen.auto[++a],
    bondConsumption: skillParam_gen.auto[++a][0],
    bondLimit: skillParam_gen.auto[++a][0],
  },
  charged_dash_stam: skillParam_gen.auto[++a][0],
  skill: {
    spikeDmg: skillParam_gen.skill[s++],
    finalDmg: skillParam_gen.skill[s++],
    sigilDmg: skillParam_gen.skill[s++],
    maxInstances: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
    dmgInterval: skillParam_gen.skill[s++][0],
    bond: skillParam_gen.skill[s++][0],
  },
  burst: {
    burstDmg: skillParam_gen.burst[b++],
    idk: skillParam_gen.burst[b++][0],
    healBond: skillParam_gen.burst[b++][0],
    healAtk: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    interval: skillParam_gen.passive1[0][0],
    baseBond: skillParam_gen.passive1[1][0],
    bond: skillParam_gen.passive1[2][0],
  },
  passive2: {
    atkThresh: skillParam_gen.passive2[0][0],
    res: skillParam_gen.passive2[1][0],
    maxRes: skillParam_gen.passive2[2][0],
    maxAttack: skillParam_gen.passive2[3][0],
  },
  passive3: {
    pyro_dmg_: skillParam_gen.passive3![0][0],
    idk1: skillParam_gen.passive3![1][0],
    idk2: skillParam_gen.passive3![2][0],
  },
  constellation1: {
    infusionDmgInc: skillParam_gen.constellation1[0],
  },
  constellation2: {
    bloodfireDmg: skillParam_gen.constellation2[0],
    cd: skillParam_gen.constellation2[1],
    all_res_: skillParam_gen.constellation2[2],
    duration: skillParam_gen.constellation2[3],
  },
  constellation4: {
    cdReduce: skillParam_gen.constellation4[0],
    energyRegen: skillParam_gen.constellation4[1],
    cd: skillParam_gen.constellation4[2],
  },
  constellation6: {
    normal_burst_critRate_: skillParam_gen.constellation6[0],
    normal_burst_critDMG_: skillParam_gen.constellation6[1],
    duration: skillParam_gen.constellation6[2],
    cd: skillParam_gen.constellation6[3],
    burstDmg: skillParam_gen.constellation6[4],
  },
} as const

const bondPercentArr = range(10, 200, 5).map(String)

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { auto, ascension, constellation },
} = own
// WR lookup(cond(key, 'bondPercent'), 10..200 by 5 → percent(n/100))
const { bondPercent } = allListConditionals(info.key, [...bondPercentArr])
// WR cond(key, 'c2AfterAbsorb' | 'c6AfterSkill') `'on'`
const { c2AfterAbsorb, c6AfterSkill } = allBoolConditionals(info.key)

// Subscript `ex` must be primitives; wrap the lookup, not each table cell.
const bondPercentVal = percent(
  bondPercent.map(objKeyMap(bondPercentArr, (per) => Number(per) / 100))
)
// WR premod.normal_dmgInc from total.atk. No HP in the Masque ratio.
const bond_normal_dmgInc = prod(
  percent(talentSubscript(auto, dm.infusion.normal_dmgInc)),
  final.atk,
  bondPercentVal
)
const a0_pyro_dmg_ = percent(dm.passive3.pyro_dmg_)
const a4_res_ = cmpGE(
  ascension,
  4,
  min(
    prod(
      max(sum(final.atk, -dm.passive2.atkThresh), 0),
      percent(1 / (dm.passive2.maxAttack / dm.passive2.maxRes))
    ),
    percent(dm.passive2.maxRes)
  )
)
const c1_normal_dmgInc = cmpGE(
  constellation,
  1,
  prod(percent(dm.constellation1.infusionDmgInc), final.atk, bondPercentVal)
)
const c2AfterAbsorb_res_ = c2AfterAbsorb.ifOn(
  cmpGE(constellation, 2, dm.constellation2.all_res_)
)
const c6BondPercent_dmgInc = cmpGE(
  constellation,
  6,
  prod(percent(dm.constellation6.burstDmg), final.atk, bondPercentVal)
)
const c6AfterSkill_critRate_ = c6AfterSkill.ifOn(
  cmpGE(constellation, 6, dm.constellation6.normal_burst_critRate_)
)
const c6AfterSkill_critDMG_ = c6AfterSkill.ifOn(
  cmpGE(constellation, 6, dm.constellation6.normal_burst_critDMG_)
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Invitation to a Beheading (auto); C5 Balemoon Rising (burst)
  ownBuff.char.auto.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.dmg_.pyro.add(a0_pyro_dmg_),
  allElementWithPhyKeys.map((ele) =>
    ownBuff.premod.res_[ele].add(sum(a4_res_, c2AfterAbsorb_res_))
  ),
  // WR infusion.nonOverridableSelf pyro when bond ≥ limit
  ownBuff.reaction.infusionIndex.add(
    cmpGE(
      bondPercentVal,
      dm.infusion.bondLimit,
      infusionPrio.nonOverridable.pyro
    )
  ),
  // WR premod.normal_dmgInc (Masque) / burst_dmgInc (C6)
  ownBuff.formula.base.normal.add(bond_normal_dmgInc),
  ownBuff.formula.base.burst.add(c6BondPercent_dmgInc),
  ownBuff.premod.critRate_.normal.add(c6AfterSkill_critRate_),
  ownBuff.premod.critDMG_.normal.add(c6AfterSkill_critDMG_),
  ownBuff.premod.critRate_.burst.add(c6AfterSkill_critRate_),
  ownBuff.premod.critDMG_.burst.add(c6AfterSkill_critDMG_),

  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(
      `normal_${i}`,
      info,
      'atk',
      arr,
      'normal',
      undefined,
      // WR C1 extra on premod.normal_dmgInc; name-scoped on infused NA
      ownBuff.formula.base.add(c1_normal_dmgInc)
    )
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill_spikeDmg', info, 'atk', dm.skill.spikeDmg, 'skill'),
  dmg('skill_finalDmg', info, 'atk', dm.skill.finalDmg, 'skill'),
  dmg('skill_sigilDmg', info, 'atk', dm.skill.sigilDmg, 'skill'),
  dmg('burst', info, 'atk', dm.burst.burstDmg, 'burst'),
  customDmg(
    'bloodfireDmg',
    'pyro',
    'elemental',
    prod(percent(dm.constellation2.bloodfireDmg), final.atk),
    { cond: cmpGE(constellation, 2, cmpGE(ascension, 1, 'infer', ''), '') }
  )
)
