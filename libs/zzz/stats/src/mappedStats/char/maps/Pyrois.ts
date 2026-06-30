import type { CharacterKey } from '@genshin-optimizer/zzz-consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Pyrois'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackEmberglow: data_gen.skillParams['basic']['BasicAttackEmberglow'],
    BasicAttackCelestialLight:
      data_gen.skillParams['basic']['BasicAttackCelestialLight'],
  },
  dodge: {
    DodgeTwilight: data_gen.skillParams['dodge']['DodgeTwilight'],
    DashAttackSunrise: data_gen.skillParams['dodge']['DashAttackSunrise'],
    DodgeCounterFirstLight:
      data_gen.skillParams['dodge']['DodgeCounterFirstLight'],
  },
  special: {
    SpecialAttackFadingRays:
      data_gen.skillParams['special']['SpecialAttackFadingRays'],
    EXSpecialAttackSunsHalo:
      data_gen.skillParams['special']['EXSpecialAttackSunsHalo'],
    SpecialAttackAssaultDirective:
      data_gen.skillParams['special']['SpecialAttackAssaultDirective'],
    '': data_gen.skillParams['special'][''],
  },
  chain: {
    ChainAttackCeremonialMarch:
      data_gen.skillParams['chain']['ChainAttackCeremonialMarch'],
    UltimateTotalAnnihilation:
      data_gen.skillParams['chain']['UltimateTotalAnnihilation'],
    UltimateTriumphantReturn:
      data_gen.skillParams['chain']['UltimateTriumphantReturn'],
    UltimateUnboundSwordstorm:
      data_gen.skillParams['chain']['UltimateUnboundSwordstorm'],
    UltimateEternalImprisonment:
      data_gen.skillParams['chain']['UltimateEternalImprisonment'],
  },
  assist: {
    QuickAssistDuskguard:
      data_gen.skillParams['assist']['QuickAssistDuskguard'],
    DefensiveAssistIronhideBehemoth:
      data_gen.skillParams['assist']['DefensiveAssistIronhideBehemoth'],
    AssistFollowUpReturnToDaylight:
      data_gen.skillParams['assist']['AssistFollowUpReturnToDaylight'],
  },
} as const

export default dm
