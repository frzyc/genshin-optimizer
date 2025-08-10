import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Anton'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackEnthusiasticDrills:
      data_gen.skillParams['basic']['BasicAttackEnthusiasticDrills'],
    BasicAttackEnthusiasticDrillsBurstMode:
      data_gen.skillParams['basic']['BasicAttackEnthusiasticDrillsBurstMode'],
  },
  dodge: {
    DodgeLetsMove: data_gen.skillParams['dodge']['DodgeLetsMove'],
    DashAttackFireWithFire:
      data_gen.skillParams['dodge']['DashAttackFireWithFire'],
    DodgeCounterRetaliation:
      data_gen.skillParams['dodge']['DodgeCounterRetaliation'],
    DodgeCounterOverloadDrillBurstMode:
      data_gen.skillParams['dodge']['DodgeCounterOverloadDrillBurstMode'],
  },
  special: {
    SpecialAttackSpinBro:
      data_gen.skillParams['special']['SpecialAttackSpinBro'],
    EXSpecialAttackSmashTheHorizonBro:
      data_gen.skillParams['special']['EXSpecialAttackSmashTheHorizonBro'],
    SpecialAttackExplosiveDrillBurstMode:
      data_gen.skillParams['special']['SpecialAttackExplosiveDrillBurstMode'],
  },
  chain: {
    ChainAttackGoGoGo: data_gen.skillParams['chain']['ChainAttackGoGoGo'],
    UltimateGoGoGoGoGo: data_gen.skillParams['chain']['UltimateGoGoGoGoGo'],
  },
  assist: {
    QuickAssistShoulderToShoulder:
      data_gen.skillParams['assist']['QuickAssistShoulderToShoulder'],
    QuickAssistProtectiveDrillBurstMode:
      data_gen.skillParams['assist']['QuickAssistProtectiveDrillBurstMode'],
    DefensiveAssistIronWrist:
      data_gen.skillParams['assist']['DefensiveAssistIronWrist'],
    AssistFollowUpLimitBurst:
      data_gen.skillParams['assist']['AssistFollowUpLimitBurst'],
  },
  core: {
    piledriver_dmg_: data_gen.coreParams[0],
    drill_dmg_: data_gen.coreParams[1],
  },
  ability: {
    crit_hits: data_gen.abilityParams[0],
    dmg: data_gen.abilityParams[1],
    cooldown: data_gen.abilityParams[2],
  },
  m1: {
    energy: data_gen.mindscapeParams[0][0],
  },
  m2: {
    shield: data_gen.mindscapeParams[1][0],
    cooldown: data_gen.mindscapeParams[1][1],
  },
  m4: {
    crit_: data_gen.mindscapeParams[3][0],
    duration: data_gen.mindscapeParams[3][1],
  },
  m6: {
    dmg_: data_gen.mindscapeParams[5][0],
    duration: data_gen.mindscapeParams[5][1],
    stacks: data_gen.mindscapeParams[5][2],
  },
} as const

export default dm
