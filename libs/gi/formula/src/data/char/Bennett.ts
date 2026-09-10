import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, lookup, prod, sum } from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import {
  allListConditionals,
  customHeal,
  customParam,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Bennett'
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
      skillParam_gen.auto[a++], // 5
    ],
  },
  charged: {
    dmg1: skillParam_gen.auto[a++], // 1
    dmg2: skillParam_gen.auto[a++], // 2
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    press: skillParam_gen.skill[s++],
    hold1_1: skillParam_gen.skill[s++],
    hold1_2: skillParam_gen.skill[s++],
    hold2_1: skillParam_gen.skill[s++],
    hold2_2: skillParam_gen.skill[s++],
    explosion: skillParam_gen.skill[s++],
    cd_press: skillParam_gen.skill[s++][0],
    cd_hold1: skillParam_gen.skill[s++][0],
    cd_hold2: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    regen_: skillParam_gen.burst[b++],
    regenFlat: skillParam_gen.burst[b++],
    atkBonus: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    cd_red: 0.2, // Not in the dm for some reason
  },
  passive2: {
    cd_red: 0.5, // Not in the dm for some reason
  },
  constellation1: {
    atk_inc: skillParam_gen.constellation1[0],
  },
  constellation2: {
    hp_thresh: skillParam_gen.constellation2[0],
    er_inc: skillParam_gen.constellation2[1],
  },
  constellation4: {
    dmg: skillParam_gen.constellation4[0],
  },
  constellation6: {
    pyro_dmg: skillParam_gen.constellation6[0],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { burst, ascension, constellation },
} = own
const { activeInArea } = allListConditionals(info.key, ['activeInArea'])
const { underHP } = allListConditionals(info.key, ['underHP'])

const inArea = activeInArea.map({ activeInArea: 1 })
const inAreaActive = prod(inArea, destIsActive)
const burstAtkRatio = percent(talentSubscript(burst, dm.burst.atkBonus))
const c1AtkRatio = cmpGE(constellation, 1, percent(dm.constellation1.atk_inc))
const activeInAreaAtk = prod(
  inAreaActive,
  sum(burstAtkRatio, c1AtkRatio),
  own.base.atk
)
const underHP_enerRech_ = cmpGE(
  constellation,
  2,
  percent(underHP.map({ underHP: dm.constellation2.er_inc }))
)
const c6PyroDmg_ = prod(
  inAreaActive,
  cmpGE(constellation, 6, percent(dm.constellation6.pyro_dmg))
)
const correctWep = lookup(
  own.common.weaponType,
  { sword: 1, claymore: 1, polearm: 1 },
  0
)
const c6InfusionOn = cmpGE(
  prod(inAreaActive, cmpGE(constellation, 6, 1), correctWep),
  1,
  'infer',
  ''
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Unstoppable Fervor (skill); C5 Fantastic Voyage (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.enerRech_.add(underHP_enerRech_),
  // WR teamBuff.total.atk — dest-gated Inspiration Field.
  teamBuff.final.atk.add(activeInAreaAtk),
  teamBuff.premod.dmg_.pyro.add(c6PyroDmg_),

  dm.normal.hitArr.flatMap((arr, i) => [
    ...dmg(`normal_${i}`, info, 'atk', arr, 'normal'),
    ...dmg(`normal_${i}_pyro`, info, 'atk', arr, 'normal', {
      ele: 'pyro',
      cond: c6InfusionOn,
    }),
  ]),
  dmg('charged_1', info, 'atk', dm.charged.dmg1, 'charged'),
  dmg('charged_2', info, 'atk', dm.charged.dmg2, 'charged'),
  dmg('charged_1_pyro', info, 'atk', dm.charged.dmg1, 'charged', {
    ele: 'pyro',
    cond: c6InfusionOn,
  }),
  dmg('charged_2_pyro', info, 'atk', dm.charged.dmg2, 'charged', {
    ele: 'pyro',
    cond: c6InfusionOn,
  }),
  Object.entries(dm.plunging).flatMap(([k, v]) => [
    ...dmg(`plunging_${k}`, info, 'atk', v, 'plunging'),
    ...dmg(`plunging_${k}_pyro`, info, 'atk', v, 'plunging', {
      ele: 'pyro',
      cond: c6InfusionOn,
    }),
  ]),
  dmg('skill_press', info, 'atk', dm.skill.press, 'skill'),
  dmg('skill_hold1_1', info, 'atk', dm.skill.hold1_1, 'skill'),
  dmg('skill_hold1_2', info, 'atk', dm.skill.hold1_2, 'skill'),
  dmg('skill_hold2_1', info, 'atk', dm.skill.hold2_1, 'skill'),
  dmg('skill_hold2_2', info, 'atk', dm.skill.hold2_2, 'skill'),
  dmg('skill_explosion', info, 'atk', dm.skill.explosion, 'skill'),
  dmg('burst', info, 'atk', dm.burst.dmg, 'burst'),
  customHeal(
    'burst_regen',
    sum(
      prod(percent(talentSubscript(burst, dm.burst.regen_)), final.hp),
      talentSubscript(burst, dm.burst.regenFlat)
    )
  ),
  dmg('c4', info, 'atk', dm.skill.hold1_2, 'skill', {
    baseMulti: dm.constellation4.dmg,
    cond: cmpGE(constellation, 4, 'infer', ''),
  }),

  customParam('charged_stamina', dm.charged.stamina),
  customParam('skill_cd_press', dm.skill.cd_press),
  customParam('skill_cd_hold1', dm.skill.cd_hold1),
  customParam('skill_cd_hold2', dm.skill.cd_hold2),
  customParam('a1_skillCDRed_', percent(dm.passive1.cd_red), {
    cond: cmpGE(ascension, 1, 'infer', ''),
  }),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
