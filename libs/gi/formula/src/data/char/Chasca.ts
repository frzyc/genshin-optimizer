import { absorbableEle, type CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  cmpGE,
  min,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  customDmg,
  customParam,
  own,
  ownBuff,
  percent,
  register,
  team,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Chasca'
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
      skillParam_gen.auto[a++], // 4
    ],
  },
  charged: {
    aimed: skillParam_gen.auto[a++],
    fullyAimed: skillParam_gen.auto[a++],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    activationDmg: skillParam_gen.skill[s++],
    pressDmg: skillParam_gen.skill[s++],
    shellDmg: skillParam_gen.skill[s++],
    shiningShellDmg: skillParam_gen.skill[s++],
    nsPointLimit: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    galesplittingDmg: skillParam_gen.burst[b++],
    shellDmg: skillParam_gen.burst[b++],
    radiantDmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    chances: [
      skillParam_gen.passive1[0][0],
      skillParam_gen.passive1[1][0],
      skillParam_gen.passive1[2][0],
    ],
    shining_dmg_: [
      -1,
      skillParam_gen.passive1[3][0],
      skillParam_gen.passive1[4][0],
      skillParam_gen.passive1[5][0],
    ] as number[],
  },
  passive2: {
    dmg: skillParam_gen.passive2[0][0],
  },
  constellation1: {
    addlChance: skillParam_gen.constellation1[0],
    nsPointConsumption: skillParam_gen.constellation1[1],
  },
  constellation2: {
    dmg: skillParam_gen.constellation2[0],
  },
  constellation4: {
    energyRegen: skillParam_gen.constellation4[0],
    dmg: skillParam_gen.constellation4[1],
  },
  constellation6: {
    duration: skillParam_gen.constellation6[0],
    critDMG_: skillParam_gen.constellation6[1],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill, ascension, constellation },
} = own
// WR cond(key, 'a1InMultitarget' | 'c6FatalRounds')
const { a1InMultitarget, c6FatalRounds } = allBoolConditionals(info.key)

// Unique absorbable types present + C2's free Spirit stack, cap 3 (WR phecElements)
const phecElements = min(
  sum(
    ...absorbableEle.map((ele) => cmpGE(team.common.count[ele], 1, 1)),
    cmpGE(constellation, 2, 1)
  ),
  3
)
const a1InMultitarget_shining_dmg_ = cmpGE(
  ascension,
  1,
  a1InMultitarget.ifOn(
    cmpGE(
      phecElements,
      1,
      percent(subscript(phecElements, [...dm.passive1.shining_dmg_]))
    )
  )
)
const c6FatalRounds_multi_critDMG_ = c6FatalRounds.ifOn(
  cmpGE(constellation, 6, percent(dm.constellation6.critDMG_))
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Spirit Reins, Shadow Hunt (skill); C5 Soul Reaper's Fatal Round (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_aimed', info, 'atk', dm.charged.aimed, 'charged'),
  dmg('charged_fullyAimed', info, 'atk', dm.charged.fullyAimed, 'charged', {
    ele: info.ele,
  }),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill_activationDmg', info, 'atk', dm.skill.activationDmg, 'skill'),
  // WR dmgNode talent=skill, move normal, hitEle anemo + C6 listing-local critDMG_
  customDmg(
    'skill_pressDmg',
    info.ele,
    'normal',
    prod(percent(talentSubscript(skill, dm.skill.pressDmg)), final.atk),
    undefined,
    ownBuff.premod.critDMG_.add(c6FatalRounds_multi_critDMG_)
  ),
  customDmg(
    'skill_shellDmg',
    info.ele,
    'charged',
    prod(percent(talentSubscript(skill, dm.skill.shellDmg)), final.atk)
  ),
  absorbableEle.flatMap((ele) =>
    customDmg(
      `skill_shiningShellDmg_${ele}`,
      ele,
      'charged',
      prod(
        percent(talentSubscript(skill, dm.skill.shiningShellDmg)),
        final.atk
      ),
      undefined,
      ownBuff.premod.dmg_.charged.add(a1InMultitarget_shining_dmg_),
      ownBuff.premod.critDMG_.add(c6FatalRounds_multi_critDMG_)
    )
  ),
  dmg(
    'burst_galeSplittingDmg',
    info,
    'atk',
    dm.burst.galesplittingDmg,
    'burst'
  ),
  dmg('burst_shellDmg', info, 'atk', dm.burst.shellDmg, 'burst'),
  absorbableEle.flatMap((ele) =>
    dmg(`burst_radiantDmg_${ele}`, info, 'atk', dm.burst.radiantDmg, 'burst', {
      ele,
    })
  ),
  customDmg(
    'a4_anemo',
    info.ele,
    'charged',
    prod(
      percent(talentSubscript(skill, dm.skill.shellDmg)),
      final.atk,
      percent(dm.passive2.dmg)
    ),
    { cond: cmpGE(ascension, 4, 'infer', '') }
  ),
  absorbableEle.flatMap((ele) =>
    customDmg(
      `a4_${ele}`,
      ele,
      'charged',
      prod(
        percent(talentSubscript(skill, dm.skill.shiningShellDmg)),
        final.atk,
        percent(dm.passive2.dmg)
      ),
      { cond: cmpGE(ascension, 4, 'infer', '') }
    )
  ),
  absorbableEle.flatMap((ele) =>
    customDmg(
      `c2_${ele}`,
      ele,
      'charged',
      prod(percent(dm.constellation2.dmg), final.atk),
      { cond: cmpGE(constellation, 2, 'infer', '') }
    )
  ),
  absorbableEle.flatMap((ele) =>
    customDmg(
      `c4_${ele}`,
      ele,
      'charged',
      prod(percent(dm.constellation4.dmg * dm.constellation2.dmg), final.atk),
      { cond: cmpGE(constellation, 4, 'infer', '') }
    )
  ),

  customParam('skill_nsPointLimit', dm.skill.nsPointLimit),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
