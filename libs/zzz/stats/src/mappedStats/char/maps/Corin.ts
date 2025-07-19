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
  core: {
    extended_slash_dmg_: data_gen.coreParams[0],
  },
  ability: {
    common_dmg_: data_gen.abilityParams[0],
  },
  m1: {
    common_dmg_: data_gen.mindscapeParams[0][0],
    duration: data_gen.mindscapeParams[0][1],
  },
  m2: {
    physical_resRed_: data_gen.mindscapeParams[1][0],
    stacks: data_gen.mindscapeParams[1][1],
    duration: data_gen.mindscapeParams[1][2],
  },
  m4: {
    energy: data_gen.mindscapeParams[3][0],
    cooldown: data_gen.mindscapeParams[3][1],
  },
  m6: {
    stacks: data_gen.mindscapeParams[5][0],
    dmg: data_gen.mindscapeParams[5][1],
  },
} as const

export default dm
