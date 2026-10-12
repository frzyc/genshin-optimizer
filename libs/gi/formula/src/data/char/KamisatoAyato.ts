import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, cmpNE, prod } from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import {
  allBoolConditionals,
  allNumConditionals,
  customDmg,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'KamisatoAyato'
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
      skillParam_gen.auto[a++], // 4x2
      skillParam_gen.auto[a++], // 5
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[a++], // 1
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    dmgArr: [
      skillParam_gen.skill[s++],
      skillParam_gen.skill[s++],
      skillParam_gen.skill[s++],
    ],
    stateDuration: skillParam_gen.skill[s++][0],
    stackHpDmgInc: skillParam_gen.skill[s++],
    maxStacks: 4,
    illusionDmg: skillParam_gen.skill[s++],
    illusionDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    normal_dmg_: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    stacksGained: skillParam_gen.passive1[0][0],
  },
  passive2: {
    enerThres_: skillParam_gen.passive2[0][0],
    cd: skillParam_gen.passive2[1][0],
    energyRestore: skillParam_gen.passive2[2][0],
  },
  constellation1: {
    oppHpThres_: skillParam_gen.constellation1[0],
    shunDmg_: skillParam_gen.constellation1[1],
  },
  constellation2: {
    extraStacks: skillParam_gen.constellation2[0],
    stackThresh: 3,
    hp_: skillParam_gen.constellation2[1],
  },
  constellation4: {
    atkSPD: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
  },
  constellation6: {
    extraStrikes: 2,
    dmg: skillParam_gen.constellation6[0],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill, burst, constellation },
} = own
// WR cond(key, 'skillStacks' | 'burstInArea' | 'c1OppHp' | 'c4AfterBurst')
const { burstInArea, c1OppHp, c4AfterBurst } = allBoolConditionals(info.key)
const { skillStacks } = allNumConditionals(info.key, true, 0, 5)

// WR lookup: stacks 1–4 always; 5th only at C2+. Unset / C0×5 → 0.
const namisenStacks = cmpGE(
  skillStacks,
  5,
  cmpGE(constellation, 2, skillStacks),
  skillStacks
)
const skillStacks_dmgInc = prod(
  namisenStacks,
  percent(talentSubscript(skill, dm.skill.stackHpDmgInc)),
  final.hp
)
const c1Shun_dmg_ = c1OppHp.ifOn(
  cmpGE(constellation, 1, percent(dm.constellation1.shunDmg_))
)
const c2_hp_ = cmpGE(
  constellation,
  2,
  cmpGE(
    skillStacks,
    dm.constellation2.stackThresh,
    percent(dm.constellation2.hp_)
  )
)
const burst_normal_dmg_ = burstInArea.ifOn(
  percent(talentSubscript(burst, dm.burst.normal_dmg_))
)
const c4_atkSPD_ = c4AfterBurst.ifOn(
  cmpGE(constellation, 4, percent(dm.constellation4.atkSPD))
)

function shun(name: string, table: number[]) {
  return customDmg(
    name,
    'hydro',
    'normal',
    prod(percent(talentSubscript(skill, table)), final.atk),
    undefined,
    // WR data() overlay: premod.normal_dmgInc + normal_dmg_
    ownBuff.formula.base.add(skillStacks_dmgInc),
    ownBuff.premod.dmg_.normal.add(c1Shun_dmg_)
  )
}

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 To Admire the Flowers (skill); C5 Bansui Ichiro (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.hp_.add(c2_hp_),
  // WR equal(activeCharKey, target.charKey) — dest-gated Suiyuu NA dmg_.
  teamBuff.premod.dmg_.normal.add(cmpNE(destIsActive, 0, burst_normal_dmg_)),
  // WR C4 teamBuff is whole-party — not dest-gated.
  teamBuff.premod.atkSPD_.add(c4_atkSPD_),

  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  // WR skill.dmg0–2: Shunsuiken customDmgNode (skill MV, move normal, hydro).
  // Listing-local ele — infusionPrio has no extra hydro-self besides Candace team.
  dm.skill.dmgArr.flatMap((arr, i) => shun(`skill_dmg${i}`, arr)),
  dmg('skill_illusionDmg', info, 'atk', dm.skill.illusionDmg, 'skill'),
  dmg('burst', info, 'atk', dm.burst.dmg, 'burst'),
  // WR C6: hydro normal customDmg; C1 dmg_ only (not Namisen).
  customDmg(
    'c6',
    'hydro',
    'normal',
    prod(percent(dm.constellation6.dmg), final.atk),
    { cond: cmpGE(constellation, 6, 'infer', '') },
    ownBuff.premod.dmg_.normal.add(c1Shun_dmg_)
  )
)
