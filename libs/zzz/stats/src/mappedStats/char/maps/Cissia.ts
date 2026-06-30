import type { CharacterKey } from '@genshin-optimizer/zzz-consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Cissia'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackTongueFlick:
      data_gen.skillParams['basic']['BasicAttackTongueFlick'],
    BasicAttackSerpentsKiss:
      data_gen.skillParams['basic']['BasicAttackSerpentsKiss'],
    CorrodeBone: data_gen.skillParams['basic']['CorrodeBone'],
  },
  dodge: {
    DodgeSlither: data_gen.skillParams['dodge']['DodgeSlither'],
    DashAttackBiteMark: data_gen.skillParams['dodge']['DashAttackBiteMark'],
    DodgeCounterBiteBack: data_gen.skillParams['dodge']['DodgeCounterBiteBack'],
  },
  special: {
    SpecialAttackBaredFangs:
      data_gen.skillParams['special']['SpecialAttackBaredFangs'],
    EXSpecialAttackVenomousBite:
      data_gen.skillParams['special']['EXSpecialAttackVenomousBite'],
  },
  chain: {
    ChainAttackGangOperation:
      data_gen.skillParams['chain']['ChainAttackGangOperation'],
    UltimateOphidiophobia:
      data_gen.skillParams['chain']['UltimateOphidiophobia'],
  },
  assist: {
    QuickAssistAlarmSystem:
      data_gen.skillParams['assist']['QuickAssistAlarmSystem'],
    DefensiveAssistExtraPrisonRations:
      data_gen.skillParams['assist']['DefensiveAssistExtraPrisonRations'],
    AssistFollowUpPartnersInCrime:
      data_gen.skillParams['assist']['AssistFollowUpPartnersInCrime'],
  },
} as const

export default dm
