import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Corin'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackWipeout: data_gen.skillParams['basic']['BasicAttackWipeout'],
  },
  dodge: {
    DodgeShoo: data_gen.skillParams['dodge']['DodgeShoo'],
    DashAttackOopsyDaisy: data_gen.skillParams['dodge']['DashAttackOopsyDaisy'],
    DodgeCounterNope: data_gen.skillParams['dodge']['DodgeCounterNope'],
  },
  special: {
    SpecialAttackCleanSweep:
      data_gen.skillParams['special']['SpecialAttackCleanSweep'],
    EXSpecialAttackSkirtAlert:
      data_gen.skillParams['special']['EXSpecialAttackSkirtAlert'],
  },
  chain: {
    ChainAttackSorry: data_gen.skillParams['chain']['ChainAttackSorry'],
    UltimateVeryVerySorry:
      data_gen.skillParams['chain']['UltimateVeryVerySorry'],
  },
  assist: {
    QuickAssistEmergencyMeasures:
      data_gen.skillParams['assist']['QuickAssistEmergencyMeasures'],
    DefensiveAssistPPleaseAllowMe:
      data_gen.skillParams['assist']['DefensiveAssistPPleaseAllowMe'],
    AssistFollowUpQuickSweep:
      data_gen.skillParams['assist']['AssistFollowUpQuickSweep'],
  },
} as const

export default dm
