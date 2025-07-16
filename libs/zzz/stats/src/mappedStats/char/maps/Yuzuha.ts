import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Yuzuha'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackTanukiClaws:
      data_gen.skillParams['basic']['BasicAttackTanukiClaws'],
    BasicAttackTanukiCloak:
      data_gen.skillParams['basic']['BasicAttackTanukiCloak'],
    BasicAttackHardCandyShot:
      data_gen.skillParams['basic']['BasicAttackHardCandyShot'],
    BasicAttackSugarburstSparkles:
      data_gen.skillParams['basic']['BasicAttackSugarburstSparkles'],
    BasicAttackSugarburstSparklesMax:
      data_gen.skillParams['basic']['BasicAttackSugarburstSparklesMax'],
    BasicAttackTanukiHelper:
      data_gen.skillParams['basic']['BasicAttackTanukiHelper'],
  },
  dodge: {
    DodgeDidIScareYou: data_gen.skillParams['dodge']['DodgeDidIScareYou'],
    DashAttackYoureOuttaLuck:
      data_gen.skillParams['dodge']['DashAttackYoureOuttaLuck'],
    DodgeCounterTimeForPayback:
      data_gen.skillParams['dodge']['DodgeCounterTimeForPayback'],
  },
  special: {
    SpecialAttackGummyBombardment:
      data_gen.skillParams['special']['SpecialAttackGummyBombardment'],
    EXSpecialAttackCavityAlert:
      data_gen.skillParams['special']['EXSpecialAttackCavityAlert'],
    EXSpecialAttackCavityAlertRightNow:
      data_gen.skillParams['special']['EXSpecialAttackCavityAlertRightNow'],
    SweetScare: data_gen.skillParams['special']['SweetScare'],
  },
  chain: {
    ChainAttackPrankAssault:
      data_gen.skillParams['chain']['ChainAttackPrankAssault'],
    UltimateSurrenderOrSufferTheMischief:
      data_gen.skillParams['chain']['UltimateSurrenderOrSufferTheMischief'],
  },
  assist: {
    QuickAssistDessertTime:
      data_gen.skillParams['assist']['QuickAssistDessertTime'],
    DefensiveAssistReplenishYourFun:
      data_gen.skillParams['assist']['DefensiveAssistReplenishYourFun'],
    AssistFollowUpWeHaveCookies:
      data_gen.skillParams['assist']['AssistFollowUpWeHaveCookies'],
    AssistFollowUpStuffedHardCandyShot:
      data_gen.skillParams['assist']['AssistFollowUpStuffedHardCandyShot'],
  },
} as const

export default dm
