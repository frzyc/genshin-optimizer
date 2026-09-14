import { objKeyMap, range } from '@genshin-optimizer/common/util'
import { absorbableEle, type CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod, sum } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allListConditionals,
  customDmg,
  customHeal,
  customParam,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Ifa'
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
    dmg: skillParam_gen.auto[a++],
    stam: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    tonicDmg: skillParam_gen.skill[s++],
    tonicHealPercent: skillParam_gen.skill[s++],
    tonicHealFlat: skillParam_gen.skill[s++],
    nsLimit: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    markDmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    nsConsumed: skillParam_gen.passive1[0][0],
    essentialsGained: skillParam_gen.passive1[1][0],
    maxEssentials: skillParam_gen.passive1[2][0],
    reaction_dmg_perEssential: skillParam_gen.passive1[3][0],
    lunarcharged_dmg_perEssential: 0.002,
    stellarswirl_dmg_perEssential: skillParam_gen.passive1[4][0],
  },
  passive2: {
    eleMas: skillParam_gen.passive2[0][0],
    duration: skillParam_gen.passive2[1][0],
  },
  constellation1: {
    energyRegen: skillParam_gen.constellation1[0],
    cd: skillParam_gen.constellation1[1],
  },
  constellation2: {
    nsThreshold: skillParam_gen.constellation2[0],
    addlEssentials: skillParam_gen.constellation2[1],
    essentialsLimitInc: skillParam_gen.constellation2[2],
  },
  constellation4: {
    eleMas: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
  },
  constellation6: {
    dmg: skillParam_gen.constellation6[0],
    nsConsumption: skillParam_gen.constellation6[1],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill, ascension, constellation },
} = own
// WR cond(key, 'a1Essentials') lookup keys 10..200 step 10 (C2 raises cap).
const a1EssentialsArr = range(
  10,
  dm.passive1.maxEssentials + dm.constellation2.essentialsLimitInc,
  10
).map(String)
const { a1Essentials } = allListConditionals(info.key, a1EssentialsArr)
// WR cond(key, 'a4NsBurst' | 'c4AfterBurst')
const { a4NsBurst, c4AfterBurst } = allBoolConditionals(info.key)

const a1EssentialsRaw = a1Essentials.map(
  objKeyMap(a1EssentialsArr, (ess) => Number(ess))
)
// WR: ess > maxEssentials → greaterEq(constellation, 2, ess), else ess.
const a1EssentialsVal = cmpGE(
  a1EssentialsRaw,
  dm.passive1.maxEssentials + 1,
  cmpGE(constellation, 2, a1EssentialsRaw),
  a1EssentialsRaw
)
const a1_reaction_dmg_ = cmpGE(
  ascension,
  1,
  prod(percent(dm.passive1.reaction_dmg_perEssential), a1EssentialsVal)
)
const a1_lunarcharged_dmg_ = cmpGE(
  ascension,
  1,
  prod(percent(dm.passive1.lunarcharged_dmg_perEssential), a1EssentialsVal)
)
const a1_stellarswirl_dmg_ = cmpGE(
  ascension,
  1,
  prod(percent(dm.passive1.stellarswirl_dmg_perEssential), a1EssentialsVal)
)
const a4NsBurst_eleMas = a4NsBurst.ifOn(cmpGE(ascension, 4, dm.passive2.eleMas))
const c4AfterBurst_eleMas = c4AfterBurst.ifOn(
  cmpGE(constellation, 4, dm.constellation4.eleMas)
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Airborne Disease Prevention (skill); C5 Compound Sedation Field (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  // A1 nearby party (not dest-gated). WR teamBuff swirl/EC/LC/stellar swirl.
  teamBuff.premod.dmg_.swirl.add(a1_reaction_dmg_),
  teamBuff.premod.dmg_.electrocharged.add(a1_reaction_dmg_),
  teamBuff.premod.dmg_.lunarcharged.add(a1_lunarcharged_dmg_),
  teamBuff.premod.dmg_.stellarswirl.add(a1_stellarswirl_dmg_),
  // A4 / C4 are Ifa's own EM (WR premod.eleMas; condTem teamBuff is UI-only).
  ownBuff.premod.eleMas.add(a4NsBurst_eleMas),
  ownBuff.premod.eleMas.add(c4AfterBurst_eleMas),

  // Formulas — catalyst anemo: NA/CA/plunge inherit anemo
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  // WR dmgNode(..., 'normal', ..., 'skill') — NA move, skill talent.
  customDmg(
    'skill_tonicDmg',
    info.ele,
    'normal',
    prod(percent(talentSubscript(skill, dm.skill.tonicDmg)), final.atk)
  ),
  customHeal(
    'skill_tonicHeal',
    sum(
      prod(
        percent(talentSubscript(skill, dm.skill.tonicHealPercent)),
        final.eleMas
      ),
      talentSubscript(skill, dm.skill.tonicHealFlat)
    )
  ),
  dmg('burst', info, 'atk', dm.burst.skillDmg, 'burst'),
  absorbableEle.flatMap((ele) =>
    dmg(`burst_${ele}`, info, 'atk', dm.burst.markDmg, 'burst', { ele })
  ),
  customDmg(
    'c6',
    info.ele,
    'normal',
    prod(percent(dm.constellation6.dmg), final.atk),
    { cond: cmpGE(constellation, 6, 'infer', '') }
  ),

  customParam('charged_stam', dm.charged.stam),
  customParam('skill_nsLimit', dm.skill.nsLimit),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
