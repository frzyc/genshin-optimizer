import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod } from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import {
  allListConditionals,
  allNumConditionals,
  customParam,
  enemyDebuff,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Shenhe'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let s = 0,
  b = 0,
  p1 = 0,
  p2 = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[0], // 1
      skillParam_gen.auto[1], // 2
      skillParam_gen.auto[2], // 3
      skillParam_gen.auto[3], // 4x2
      skillParam_gen.auto[5], // 5
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[6],
    stamina: skillParam_gen.auto[7][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[8],
    low: skillParam_gen.auto[9],
    high: skillParam_gen.auto[10],
  },
  skill: {
    press: skillParam_gen.skill[s++],
    hold: skillParam_gen.skill[s++],
    dmgAtk_: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    durationHold: skillParam_gen.skill[s++][0],
    trigger: skillParam_gen.skill[s++][0],
    triggerHold: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
    cdHold: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    res_: skillParam_gen.burst[b++],
    dot: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    cryo_dmg_: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    press_dmg_: skillParam_gen.passive2[p2++][0],
    durationPress: skillParam_gen.passive2[p2++][0],
    hold_dmg_: skillParam_gen.passive2[p2++][0],
    durationHold: skillParam_gen.passive2[p2++][0],
  },
  constellation2: {
    durationInc: skillParam_gen.constellation2[0],
  },
  constellation4: {
    dmg_: skillParam_gen.constellation4[0],
    maxStacks: skillParam_gen.constellation4[1],
  },
  constellation6: {
    auto_: skillParam_gen.constellation6[0],
    duration: skillParam_gen.constellation6[1],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill, burst, ascension, constellation },
} = own
const { quill } = allListConditionals(info.key, ['quill'])
const { burst: burstCond } = allListConditionals(info.key, ['burst'])
const { asc1 } = allListConditionals(info.key, ['field'])
const { asc4 } = allListConditionals(info.key, ['press'])
const { asc4Hold } = allListConditionals(info.key, ['hold'])
const { c4 } = allNumConditionals(
  info.key,
  true,
  0,
  dm.constellation4.maxStacks
)

const quillOn = quill.map({ quill: 1 })
const quillDmgInc = prod(
  quillOn,
  final.atk,
  percent(talentSubscript(skill, dm.skill.dmgAtk_))
)
const burstRes_ = prod(
  burstCond.map({ burst: 1 }),
  percent(
    talentSubscript(
      burst,
      dm.burst.res_.map((x) => -x)
    )
  )
)
const a1_cryo_dmg_ = prod(
  destIsActive,
  cmpGE(ascension, 1, percent(asc1.map({ field: dm.passive1.cryo_dmg_ })))
)
const a4Press_dmg_ = cmpGE(
  ascension,
  4,
  percent(asc4.map({ press: dm.passive2.press_dmg_ }))
)
const a4Hold_dmg_ = cmpGE(
  ascension,
  4,
  percent(asc4Hold.map({ hold: dm.passive2.hold_dmg_ }))
)
const c2_cryo_critDMG_ = prod(
  destIsActive,
  cmpGE(constellation, 2, percent(asc1.map({ field: dm.passive1.cryo_dmg_ })))
)
const c4Inc = cmpGE(constellation, 4, prod(c4, percent(dm.constellation4.dmg_)))

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Billet Reinforcing (skill); C5 Divine Compendium (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.dmg_.skill.add(c4Inc),
  // WR teamBuff.premod.cryo_dmgInc → formula.base.cryo
  teamBuff.formula.base.cryo.add(quillDmgInc),
  enemyDebuff.common.preRes.cryo.add(burstRes_),
  enemyDebuff.common.preRes.physical.add(burstRes_),
  teamBuff.premod.dmg_.cryo.add(a1_cryo_dmg_),
  teamBuff.premod.dmg_.skill.add(a4Press_dmg_),
  teamBuff.premod.dmg_.burst.add(a4Press_dmg_),
  teamBuff.premod.dmg_.normal.add(a4Hold_dmg_),
  teamBuff.premod.dmg_.charged.add(a4Hold_dmg_),
  teamBuff.premod.dmg_.plunging.add(a4Hold_dmg_),
  teamBuff.premod.critDMG_.cryo.add(c2_cryo_critDMG_),

  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg(
    'skill_press',
    info,
    'atk',
    dm.skill.press,
    'skill',
    undefined,
    ownBuff.premod.dmg_.add(c4Inc)
  ),
  dmg(
    'skill_hold',
    info,
    'atk',
    dm.skill.hold,
    'skill',
    undefined,
    ownBuff.premod.dmg_.add(c4Inc)
  ),
  customParam('quillDmgInc', quillDmgInc),
  dmg('burst', info, 'atk', dm.burst.dmg, 'burst'),
  dmg('burst_dot', info, 'atk', dm.burst.dot, 'burst'),

  customParam('charged_stamina', dm.charged.stamina),
  customParam('skill_cd', dm.skill.cd),
  customParam('skill_cdHold', dm.skill.cdHold),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
