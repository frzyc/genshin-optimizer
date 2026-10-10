import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod } from '@genshin-optimizer/pando/engine'
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
import {
  dataGenToCharInfo,
  dmg,
  entriesForChar,
  splitScaleDmg,
  talentSubscript,
} from './util'

const key: CharacterKey = 'Sethos'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = 0,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2.1
      skillParam_gen.auto[a++], // 2.2
      skillParam_gen.auto[a++], // 3
    ],
  },
  charged: {
    aimed: skillParam_gen.auto[a++],
    fullyAimed: skillParam_gen.auto[a++],
    shadowAtk: skillParam_gen.auto[a++],
    shadowEm: skillParam_gen.auto[a++],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    dmg: skillParam_gen.skill[s++],
    energyRegen: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dusk_dmgInc: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    maxEnergyConsume: skillParam_gen.passive1[0][0],
    level1ConsumeRatio: skillParam_gen.passive1[1][0],
  },
  passive2: {
    cd: skillParam_gen.passive2[0][0],
    dmg: skillParam_gen.passive2[1][0],
    duration: skillParam_gen.passive2[2][0],
    maxShots: skillParam_gen.passive2[3][0],
  },
  constellation1: {
    shadow_crit_rate_: skillParam_gen.constellation1[0],
  },
  constellation2: {
    electro_dmg_: skillParam_gen.constellation2[0],
    maxStacks: skillParam_gen.constellation2[1],
    duration: skillParam_gen.constellation2[2],
  },
  constellation4: {
    teamEleMas: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
  },
  constellation6: {
    cd: skillParam_gen.constellation6[0],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { burst, ascension, constellation },
} = own
const { a4Sandshade, c4Strike } = allBoolConditionals(info.key)
const { c2Stacks } = allNumConditionals(info.key, true, 0, 2)

const burst_dusk_dmgInc = prod(
  percent(talentSubscript(burst, dm.burst.dusk_dmgInc)),
  own.premod.eleMas.sheet('agg')
)
const a4Sandshade_shadow_dmgInc = a4Sandshade.ifOn(
  cmpGE(ascension, 4, prod(percent(dm.passive2.dmg), final.eleMas))
)
const c1_shadow_critRate_ = cmpGE(
  constellation,
  1,
  percent(dm.constellation1.shadow_crit_rate_)
)
const c2Stacks_electro_dmg_ = cmpGE(
  constellation,
  2,
  prod(percent(dm.constellation2.electro_dmg_), c2Stacks)
)
const c4Strike_eleMas = c4Strike.ifOn(
  cmpGE(constellation, 4, dm.constellation4.teamEleMas)
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Thoth's Revelation (auto); C5 Sacred Rite: Wolf's Swiftness (burst)
  ownBuff.char.auto.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.dmg_.electro.add(c2Stacks_electro_dmg_),
  teamBuff.premod.eleMas.add(c4Strike_eleMas),

  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_aimed', info, 'atk', dm.charged.aimed, 'charged', {
    ele: 'physical',
  }),
  dmg('charged_fullyAimed', info, 'atk', dm.charged.fullyAimed, 'charged', {
    ele: 'electro',
  }),
  splitScaleDmg(
    'charged_shadow',
    info,
    ['atk', 'eleMas'],
    [dm.charged.shadowAtk, dm.charged.shadowEm],
    'charged',
    { ele: 'electro' },
    ownBuff.formula.base.add(a4Sandshade_shadow_dmgInc),
    ownBuff.premod.critRate_.charged.add(c1_shadow_critRate_)
  ),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill', info, 'atk', dm.skill.dmg, 'skill'),
  customParam('dusk_dmgInc', burst_dusk_dmgInc),
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(
      `dusk_${i}`,
      info,
      'atk',
      arr,
      'charged',
      { ele: 'electro' },
      ownBuff.formula.base.add(burst_dusk_dmgInc)
    )
  ),

  customParam('skill_energyRegen', dm.skill.energyRegen),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
