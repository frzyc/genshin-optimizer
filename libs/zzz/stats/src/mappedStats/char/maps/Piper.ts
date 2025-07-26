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
  core: {
    stack_gain: data_gen.coreParams[0][0],
    stacks: data_gen.coreParams[1][0],
    duration: data_gen.coreParams[2][0],
    physical_anomBuildup_: data_gen.coreParams[3],
  },
  ability: {
    stack_threshold: data_gen.abilityParams[0],
    common_dmg_: data_gen.abilityParams[1],
  },
  m1: {
    chance: data_gen.mindscapeParams[0][0],
    max_power: data_gen.mindscapeParams[0][1],
  },
  m2: {
    physical_dmg_: data_gen.mindscapeParams[1][0],
    extra_physical_dmg_: data_gen.mindscapeParams[1][1],
  },
  m4: {
    energy: data_gen.mindscapeParams[3][0],
    cooldown: data_gen.mindscapeParams[3][1],
  },
  m6: {
    exSpecial_duration: data_gen.mindscapeParams[5][0],
    power_duration: data_gen.mindscapeParams[5][1],
  },
} as const

export default dm
