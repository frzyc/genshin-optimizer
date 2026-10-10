import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, cmpNE, prod, sum } from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import {
  allBoolConditionals,
  allListConditionals,
  customHeal,
  customParam,
  hexereiTally,
  notOwnBuff,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Qiqi'
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
      skillParam_gen.auto[a++], // 3x2
      skillParam_gen.auto[a++], // 4x2
      skillParam_gen.auto[a++], // 5
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
    // Encoding {{N}} matches gen indices, not skillParams UI rows:
    // hit regen {{0}}+{{1}}, cont regen {{2}}+{{3}}, tick {{4}}, dur {{5}},
    // cd {{6}}, cast {{7}}, frost coord {{8}}, frost cd {{9}}, new cd {{10}}
    hitRegenPercent: skillParam_gen.skill[s++],
    hitRegenFlat: skillParam_gen.skill[s++],
    contRegenPercent: skillParam_gen.skill[s++],
    contRegenFlat: skillParam_gen.skill[s++],
    tickDmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
    castDmg: skillParam_gen.skill[s++],
    frostCoordDmg: skillParam_gen.skill[s++],
    frostCoordCd: skillParam_gen.skill[s++][0],
    newCd: skillParam_gen.skill[s++][0],
  },
  burst: {
    // heal {{0}}+{{1}}, dmg {{2}}, dur {{3}}, cd {{4}}, cost {{5}}, stellar {{6}}
    healPercent: skillParam_gen.burst[b++],
    healFlat: skillParam_gen.burst[b++],
    dmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    cost: skillParam_gen.burst[b++][0],
    stellarDmg: skillParam_gen.burst[b++],
  },
  passive2: {
    addlChance: skillParam_gen.passive2[0][0],
    cdReduce: skillParam_gen.passive2[1][0],
  },
  lockedPassive: {
    newCd: skillParam_gen.lockedPassive![0][0],
    sc_dmg_: skillParam_gen.lockedPassive![1][0],
  },
  constellation1: {
    energyRestore: skillParam_gen.constellation1[0],
    cd: skillParam_gen.constellation1[1],
  },
  constellation2: {
    atk_: skillParam_gen.constellation2[0],
  },
  constellation4: {
    heal: skillParam_gen.constellation4[0],
  },
  constellation6: {
    duration: skillParam_gen.constellation6[0],
    stellarconduct_dmgInc: skillParam_gen.constellation6[1],
    stacks: skillParam_gen.constellation6[2],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill, burst, ascension, constellation },
} = own
// WR cond(key, 'lockRevelation' | 'QiqiLk' | 'QiqiA1' | 'QiqiC2' | 'QiqiC6')
const { lockRevelation, QiqiLk, QiqiA1, QiqiC2, QiqiC6 } = allBoolConditionals(
  info.key
)
// WR cond(key, 'lockStellarRadianceSc') states on | ss
const { lockStellarRadianceSc } = allListConditionals(info.key, ['on', 'ss'])

const hexereiOn = lockRevelation.ifOn(1)
const radianceOn = lockStellarRadianceSc.map({ on: 1, ss: 0 })
const radianceSs = lockStellarRadianceSc.map({ on: 0, ss: 1 })
const radianceSet = cmpNE(lockStellarRadianceSc.value, 0, 1)

const c2_naCa_dmg_ = QiqiC2.ifOn(cmpGE(constellation, 2, percent(0.15)))
const c2_atk_ = cmpGE(
  constellation,
  2,
  lockRevelation.ifOn(cmpNE(radianceSet, 0, percent(dm.constellation2.atk_)))
)
const a1_incHeal_ = QiqiA1.ifOn(
  cmpGE(ascension, 1, cmpNE(destIsActive, 0, percent(0.2)))
)
const lkSc_dmg_ = QiqiLk.ifOn(
  lockRevelation.ifOn(prod(percent(dm.lockedPassive.sc_dmg_), radianceOn))
)
const lkSs_dmg_ = QiqiLk.ifOn(
  lockRevelation.ifOn(prod(percent(dm.lockedPassive.sc_dmg_), radianceSs))
)
// WR teamBuff.premod.stellarconduct_dmgInc; no flat dmgInc tag.
const c6_stellarconduct_dmgIncDisp = QiqiC6.ifOn(
  lockRevelation.ifOn(
    cmpGE(
      constellation,
      6,
      prod(percent(dm.constellation6.stellarconduct_dmgInc), final.atk)
    )
  )
)
const c6_stellarconduct_dmgInc = cmpNE(
  destIsActive,
  0,
  c6_stellarconduct_dmgIncDisp
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Adeptus Art: Preserver of Fortune (burst); C5 Adeptus Art: Herald of Frost (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  hexereiTally(hexereiOn),

  ownBuff.premod.dmg_.normal.add(c2_naCa_dmg_),
  ownBuff.premod.dmg_.charged.add(c2_naCa_dmg_),
  ownBuff.premod.atk_.add(c2_atk_),

  teamBuff.premod.incHeal_.add(a1_incHeal_),
  teamBuff.premod.dmg_.superconduct.add(lkSc_dmg_),
  teamBuff.premod.dmg_.stellarconduct.add(lkSc_dmg_),
  teamBuff.premod.dmg_.swirl.add(lkSs_dmg_),
  teamBuff.premod.dmg_.stellarswirl.add(lkSs_dmg_),
  // WR active ≠ Qiqi; notOwnBuff is teammates-only.
  notOwnBuff.formula.base.stellarconduct.add(c6_stellarconduct_dmgInc),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill', info, 'atk', dm.skill.castDmg, 'skill'),
  customHeal(
    'skill_hitRegen',
    sum(
      prod(
        percent(talentSubscript(skill, dm.skill.hitRegenPercent)),
        final.atk
      ),
      talentSubscript(skill, dm.skill.hitRegenFlat)
    )
  ),
  customHeal(
    'skill_contRegen',
    sum(
      prod(
        percent(talentSubscript(skill, dm.skill.contRegenPercent)),
        final.atk
      ),
      talentSubscript(skill, dm.skill.contRegenFlat)
    )
  ),
  dmg('skill_tick', info, 'atk', dm.skill.tickDmg, 'skill'),
  dmg('skill_frostCoord', info, 'atk', dm.skill.frostCoordDmg, 'skill', {
    cond: cmpGE(hexereiOn, 1, 'infer', ''),
  }),
  dmg('burst', info, 'atk', dm.burst.dmg, 'burst'),
  customHeal(
    'burst_heal',
    sum(
      prod(percent(talentSubscript(burst, dm.burst.healPercent)), final.atk),
      talentSubscript(burst, dm.burst.healFlat)
    )
  ),
  // WR stellarDmgNode (stellarconduct / cryo); talent-style listing until trans pipeline exists.
  dmg('burst_stellar', info, 'atk', dm.burst.stellarDmg, 'burst', {
    cond: cmpGE(lockRevelation.ifOn(radianceOn), 1, 'infer', ''),
  }),
  customHeal('c4_heal', prod(percent(dm.constellation4.heal), final.atk), {
    cond: cmpGE(constellation, 4, cmpGE(hexereiOn, 1, 'infer', ''), ''),
  }),
  customParam('c6_stellarconduct_dmgInc', c6_stellarconduct_dmgIncDisp, {
    cond: cmpGE(constellation, 6, cmpGE(hexereiOn, 1, 'infer', ''), ''),
  }),

  customParam('charged_stamina', dm.charged.stamina),
  customParam('skill_duration', dm.skill.duration),
  customParam('skill_cd', lockRevelation.ifOn(dm.skill.newCd, dm.skill.cd)),
  customParam('skill_frostCoordCd', dm.skill.frostCoordCd, {
    cond: cmpGE(hexereiOn, 1, 'infer', ''),
  }),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.cost)
)
