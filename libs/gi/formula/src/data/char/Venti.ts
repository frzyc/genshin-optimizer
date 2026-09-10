import { absorbableEle, type CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, cmpNE, prod, sum } from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import {
  allBoolConditionals,
  allListConditionals,
  customDmg,
  customParam,
  enemyDebuff,
  hexereiTally,
  notOwnBuff,
  own,
  ownBuff,
  percent,
  register,
  team,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Venti'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = 0,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1x2
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3
      skillParam_gen.auto[a++], // 4x2
      skillParam_gen.auto[a++], // 5
      skillParam_gen.auto[a++], // 6
    ],
    windsunder_mult_: skillParam_gen.auto[11],
  },
  charged: {
    aimed: skillParam_gen.auto[a++],
    fully: skillParam_gen.auto[a++],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    pressDmg: skillParam_gen.skill[s++],
    pressCD: skillParam_gen.skill[s++][0],
    holdDmg: skillParam_gen.skill[s++],
    holdCD: skillParam_gen.skill[s++][0],
  },
  burst: {
    baseDmg: skillParam_gen.burst[b++],
    baseTicks: 20,
    absorbDmg: skillParam_gen.burst[b++],
    absorbTicks: 15,
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    duration: skillParam_gen.passive1[0][0],
  },
  passive3: {
    stam_: 0.2,
  },
  lockedPassive: {
    dmg_: skillParam_gen.lockedPassive![0][0],
    burst_mult_: skillParam_gen.lockedPassive![1][0],
    duration: skillParam_gen.lockedPassive![2][0],
  },
  constellation1: {
    dmgRatio: 0.33,
    windsunder_mult_: skillParam_gen.constellation1[0],
  },
  constellation2: {
    res_: -0.12,
    duration: 10,
    resetChance: skillParam_gen.constellation2[0],
    skill_mult_: skillParam_gen.constellation2[1],
    extraSkillDuration: skillParam_gen.constellation2[2],
  },
  constellation4: {
    anemo_dmg_: 0.25,
    duration: 10,
  },
  constellation6: {
    res_: -0.2,
    duration: 10,
    critDMG_: skillParam_gen.constellation6[0],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { auto, constellation },
} = own
const { lockHomework, lockBurstSwirl, lockC4SkillBurst } = allBoolConditionals(
  info.key
)
const { burstAbsorption } = allListConditionals(info.key, [...absorbableEle])
const { c2 } = allListConditionals(info.key, ['hit', 'launched'])
const { c4 } = allListConditionals(info.key, ['pickup'])
const { c6 } = allListConditionals(info.key, ['takeDmg'])

const hex2 = cmpGE(team.common.hexerei, 2, 1)
const hexOn = prod(lockHomework.ifOn(1), hex2)
const hexListOn = cmpGE(hexOn, 1, 'infer', '')
const c2Hit = c2.map({ hit: 1 })
const c2Launched = c2.map({ launched: 1 })
const c2Res = cmpGE(
  constellation,
  2,
  sum(
    prod(
      c2Hit,
      lockHomework.ifOn(dm.constellation2.res_ * 2, dm.constellation2.res_)
    ),
    prod(c2Launched, dm.constellation2.res_ * 2)
  )
)
const c4_anemo_dmg_ = lockHomework.ifOff(
  cmpGE(
    constellation,
    4,
    percent(c4.map({ pickup: dm.constellation4.anemo_dmg_ }))
  )
)
const c6On = cmpGE(constellation, 6, c6.map({ takeDmg: 1 }))
const c6_anemo_res_ = prod(c6On, dm.constellation6.res_)
const lockBurstSwirl_all_dmg_ = lockBurstSwirl.ifOn(
  prod(hexOn, dm.lockedPassive.dmg_)
)
const lockBurstSwirl_burst_mult_ = sum(
  1,
  lockBurstSwirl.ifOn(prod(hexOn, percent(dm.lockedPassive.burst_mult_ - 1)))
)
const lockC4_anemo_dmg_ = lockC4SkillBurst.ifOn(
  lockHomework.ifOn(cmpGE(constellation, 4, dm.constellation4.anemo_dmg_))
)
const lockC6_critDMG_ = lockHomework.ifOn(
  prod(c6On, dm.constellation6.critDMG_)
)
const windsunderMult = percent(
  talentSubscript(auto, dm.normal.windsunder_mult_)
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  hexereiTally(lockHomework.ifOn(1)),
  // C3 Wind's Grand Ode (burst); C5 Concerto dal Cielo (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.dmg_.anemo.add(sum(c4_anemo_dmg_, lockC4_anemo_dmg_)),
  ownBuff.premod.critDMG_.add(lockC6_critDMG_),
  enemyDebuff.common.preRes.anemo.add(sum(c2Res, c6_anemo_res_)),
  enemyDebuff.common.preRes.physical.add(c2Res),
  absorbableEle.map((ele) =>
    enemyDebuff.common.preRes[ele].add(
      prod(
        c6On,
        burstAbsorption.map({
          hydro: ele === 'hydro' ? 1 : 0,
          pyro: ele === 'pyro' ? 1 : 0,
          cryo: ele === 'cryo' ? 1 : 0,
          electro: ele === 'electro' ? 1 : 0,
        }),
        dm.constellation6.res_
      )
    )
  ),
  teamBuff.premod.dmg_.add(cmpNE(destIsActive, 0, lockBurstSwirl_all_dmg_)),
  notOwnBuff.premod.dmg_.anemo.add(cmpNE(destIsActive, 0, lockC4_anemo_dmg_)),

  dm.normal.hitArr.flatMap((arr, i) => [
    ...dmg(`normal_${i}`, info, 'atk', arr, 'normal'),
    ...dmg(`hex_${i}`, info, 'atk', arr, 'normal', {
      ele: 'anemo',
      cond: hexListOn,
      baseMulti: windsunderMult,
    }),
    ...dmg(`c1_hex_${i}`, info, 'atk', arr, 'normal', {
      ele: 'anemo',
      cond: cmpGE(constellation, 1, hexListOn, ''),
      baseMulti: prod(
        windsunderMult,
        percent(dm.constellation1.windsunder_mult_)
      ),
    }),
  ]),
  dmg('charged_aimed', info, 'atk', dm.charged.aimed, 'charged', {
    ele: 'physical',
  }),
  dmg('charged_fully', info, 'atk', dm.charged.fully, 'charged', {
    ele: 'anemo',
  }),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill_press', info, 'atk', dm.skill.pressDmg, 'skill'),
  dmg('skill_hold', info, 'atk', dm.skill.holdDmg, 'skill'),
  dmg('burst', info, 'atk', dm.burst.baseDmg, 'burst', {
    baseMulti: lockBurstSwirl_burst_mult_,
  }),
  absorbableEle.flatMap((ele) =>
    dmg(`burst_absorb_${ele}`, info, 'atk', dm.burst.absorbDmg, 'burst', {
      ele,
      cond: cmpGE(
        burstAbsorption.map({
          hydro: ele === 'hydro' ? 1 : 0,
          pyro: ele === 'pyro' ? 1 : 0,
          cryo: ele === 'cryo' ? 1 : 0,
          electro: ele === 'electro' ? 1 : 0,
        }),
        1,
        'infer',
        ''
      ),
      baseMulti: lockBurstSwirl_burst_mult_,
    })
  ),
  customDmg(
    'c1_aimed',
    undefined,
    'charged',
    prod(
      percent(dm.constellation1.dmgRatio),
      percent(talentSubscript(auto, dm.charged.aimed)),
      final.atk
    ),
    { cond: cmpGE(constellation, 1, 'infer', '') }
  ),
  customDmg(
    'c1_fully',
    'anemo',
    'charged',
    prod(
      percent(dm.constellation1.dmgRatio),
      percent(talentSubscript(auto, dm.charged.fully)),
      final.atk
    ),
    { cond: cmpGE(constellation, 1, 'infer', '') }
  ),
  dmg('c2_skill', info, 'atk', dm.skill.pressDmg, 'skill', {
    cond: cmpGE(
      constellation,
      2,
      cmpGE(lockHomework.ifOn(1), 1, 'infer', ''),
      ''
    ),
    baseMulti: percent(dm.constellation2.skill_mult_),
  }),

  customParam('p3_staminaGlidingDec_', percent(dm.passive3.stam_)),
  customParam('skill_pressCD', dm.skill.pressCD),
  customParam('skill_holdCD', dm.skill.holdCD),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
