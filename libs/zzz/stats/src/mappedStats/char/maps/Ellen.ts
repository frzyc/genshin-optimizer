import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Ellen'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackSawTeethTrimming:
      data_gen.skillParams['basic']['BasicAttackSawTeethTrimming'],
    BasicAttackFlashFreezeTrimming:
      data_gen.skillParams['basic']['BasicAttackFlashFreezeTrimming'],
  },
  dodge: {
    DodgeVortex: data_gen.skillParams['dodge']['DodgeVortex'],
    DashRoamingHunt: data_gen.skillParams['dodge']['DashRoamingHunt'],
    DashAttackArcticAmbush:
      data_gen.skillParams['dodge']['DashAttackArcticAmbush'],
    FlashFreeze: data_gen.skillParams['dodge']['FlashFreeze'],
    DashAttackMonstrousWave:
      data_gen.skillParams['dodge']['DashAttackMonstrousWave'],
    DashAttackColdSnap: data_gen.skillParams['dodge']['DashAttackColdSnap'],
    DodgeCounterReefRock: data_gen.skillParams['dodge']['DodgeCounterReefRock'],
  },
  special: {
    SpecialAttackDrift: data_gen.skillParams['special']['SpecialAttackDrift'],
    EXSpecialAttackTailSwipe:
      data_gen.skillParams['special']['EXSpecialAttackTailSwipe'],
    EXSpecialAttackSharknami:
      data_gen.skillParams['special']['EXSpecialAttackSharknami'],
  },
  chain: {
    ChainAttackAvalanche: data_gen.skillParams['chain']['ChainAttackAvalanche'],
    UltimateEndlessWinter:
      data_gen.skillParams['chain']['UltimateEndlessWinter'],
  },
  assist: {
    QuickAssistSharkSentinel:
      data_gen.skillParams['assist']['QuickAssistSharkSentinel'],
    DefensiveAssistWavefrontImpact:
      data_gen.skillParams['assist']['DefensiveAssistWavefrontImpact'],
    AssistFollowUpSharkCruiser:
      data_gen.skillParams['assist']['AssistFollowUpSharkCruiser'],
  },
} as const

export default dm
