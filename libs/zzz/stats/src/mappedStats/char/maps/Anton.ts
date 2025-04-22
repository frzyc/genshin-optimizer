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
} as const

export default dm
