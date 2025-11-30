import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Dialyn'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackHappyToBeOfService:
      data_gen.skillParams['basic']['BasicAttackHappyToBeOfService'],
    BasicAttackRockPaperScissors:
      data_gen.skillParams['basic']['BasicAttackRockPaperScissors'],
  },
  dodge: {
    DodgeLineBusy: data_gen.skillParams['dodge']['DodgeLineBusy'],
    DashAttackSuddenCall: data_gen.skillParams['dodge']['DashAttackSuddenCall'],
    DodgeCounterNumberUnavailable:
      data_gen.skillParams['dodge']['DodgeCounterNumberUnavailable'],
  },
  special: {
    EXSpecialAttackGetLost:
      data_gen.skillParams['special']['EXSpecialAttackGetLost'],
    SpecialAttackWelcomeGesture:
      data_gen.skillParams['special']['SpecialAttackWelcomeGesture'],
    EXSpecialAttackRock: data_gen.skillParams['special']['EXSpecialAttackRock'],
    EXSpecialAttackScissors:
      data_gen.skillParams['special']['EXSpecialAttackScissors'],
    EXSpecialAttackPaper:
      data_gen.skillParams['special']['EXSpecialAttackPaper'],
  },
  chain: {
    ChainAttackWelcomeMat:
      data_gen.skillParams['chain']['ChainAttackWelcomeMat'],
    UltimateServiceStoppedForNumberDialed:
      data_gen.skillParams['chain']['UltimateServiceStoppedForNumberDialed'],
  },
  assist: {
    QuickAssistForwardCall:
      data_gen.skillParams['assist']['QuickAssistForwardCall'],
    DefensiveAssistDeclineCall:
      data_gen.skillParams['assist']['DefensiveAssistDeclineCall'],
    AssistFollowUpBacktoBackCalls:
      data_gen.skillParams['assist']['AssistFollowUpBacktoBackCalls'],
  },
} as const

export default dm
