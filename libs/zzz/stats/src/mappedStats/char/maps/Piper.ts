import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Piper'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackLoadUpAndRollOut:
      data_gen.skillParams['basic']['BasicAttackLoadUpAndRollOut'],
  },
  dodge: {
    DodgeHandbrakeDrift: data_gen.skillParams['dodge']['DodgeHandbrakeDrift'],
    DashAttackPedalToTheMetal:
      data_gen.skillParams['dodge']['DashAttackPedalToTheMetal'],
    DodgeCounterPowerDrift:
      data_gen.skillParams['dodge']['DodgeCounterPowerDrift'],
  },
  special: {
    SpecialAttackTireSpin:
      data_gen.skillParams['special']['SpecialAttackTireSpin'],
    SpecialAttackOneTrillionTons:
      data_gen.skillParams['special']['SpecialAttackOneTrillionTons'],
    EXSpecialAttackEngineSpin:
      data_gen.skillParams['special']['EXSpecialAttackEngineSpin'],
    EXSpecialAttackReallyHeavy:
      data_gen.skillParams['special']['EXSpecialAttackReallyHeavy'],
  },
  chain: {
    ChainAttackBuckleUp: data_gen.skillParams['chain']['ChainAttackBuckleUp'],
    UltimateHoldOnTight: data_gen.skillParams['chain']['UltimateHoldOnTight'],
  },
  assist: {
    QuickAssistBrakeTap: data_gen.skillParams['assist']['QuickAssistBrakeTap'],
    DefensiveAssistEmergencyBrake:
      data_gen.skillParams['assist']['DefensiveAssistEmergencyBrake'],
    AssistFollowUpOvertakingManeuver:
      data_gen.skillParams['assist']['AssistFollowUpOvertakingManeuver'],
  },
} as const

export default dm
