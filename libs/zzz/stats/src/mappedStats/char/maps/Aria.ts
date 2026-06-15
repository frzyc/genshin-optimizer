import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Aria'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackSweetMelody:
      data_gen.skillParams['basic']['BasicAttackSweetMelody'],
    BasicAttackPerfectPitch:
      data_gen.skillParams['basic']['BasicAttackPerfectPitch'],
  },
  dodge: {
    DodgeOnBeatPrecision: data_gen.skillParams['dodge']['DodgeOnBeatPrecision'],
    DashAttackSilkySmoothCombo:
      data_gen.skillParams['dodge']['DashAttackSilkySmoothCombo'],
    DodgeCounterSlideShiftVariation:
      data_gen.skillParams['dodge']['DodgeCounterSlideShiftVariation'],
  },
  special: {
    SpecialAttackFullSugarElectronica:
      data_gen.skillParams['special']['SpecialAttackFullSugarElectronica'],
    SpecialAttackFullSugarElectronicaNoIce:
      data_gen.skillParams['special']['SpecialAttackFullSugarElectronicaNoIce'],
    EXSpecialAttackFallIntoDelusion:
      data_gen.skillParams['special']['EXSpecialAttackFallIntoDelusion'],
    EXSpecialAttackInstantlyHooked:
      data_gen.skillParams['special']['EXSpecialAttackInstantlyHooked'],
  },
  chain: {
    ChainAttackDreamCollab:
      data_gen.skillParams['chain']['ChainAttackDreamCollab'],
    Ultimate100Energy: data_gen.skillParams['chain']['Ultimate100Energy'],
  },
  assist: {
    QuickAssistShatterFantasy:
      data_gen.skillParams['assist']['QuickAssistShatterFantasy'],
    DefensiveAssistClutchSave:
      data_gen.skillParams['assist']['DefensiveAssistClutchSave'],
    AssistFollowUpEncoreSong:
      data_gen.skillParams['assist']['AssistFollowUpEncoreSong'],
  },
  core: {
    anomProf: data_gen.coreParams[0],
    ether_abloom: data_gen.coreParams[1],
    electric_abloom: data_gen.coreParams[2],
    fire_abloom: data_gen.coreParams[3],
    physical_abloom: data_gen.coreParams[4],
    ice_abloom: data_gen.coreParams[5],
    wind_abloom: data_gen.coreParams[6],
    anomMas_step: data_gen.coreParams[7][0],
    abloomMult: data_gen.coreParams[8][0],
  },
  ability: {
    fandomPowerGained: data_gen.abilityParams[0],
    cooldown: data_gen.abilityParams[1],
    corruptionDuration: data_gen.abilityParams[2],
  },
  m1: {
    anomaly_resIgn_: data_gen.mindscapeParams[0][0],
    anomaly_crit_: data_gen.mindscapeParams[0][1],
    anomaly_crit_dmg_: data_gen.mindscapeParams[0][2],
    anomMasThreshold: data_gen.mindscapeParams[0][3],
    crit_step: data_gen.mindscapeParams[0][4],
  },
  m2: {
    defIgn_: data_gen.mindscapeParams[1][0],
    addDefIgn_: data_gen.mindscapeParams[1][1],
  },
  m4: {
    energy: data_gen.mindscapeParams[3][0],
    decibels: data_gen.mindscapeParams[3][1],
    cooldown: data_gen.mindscapeParams[3][2],
  },
  m6: {
    decibels: data_gen.mindscapeParams[5][0],
    investigationCooldown: data_gen.mindscapeParams[5][1],
    ether_dmg_: data_gen.mindscapeParams[5][2],
    cheeringGained: data_gen.mindscapeParams[5][3],
    cooldown: data_gen.mindscapeParams[5][4],
    cheeringThreshold: data_gen.mindscapeParams[5][5],
    fandomConversion: data_gen.mindscapeParams[5][6],
  },
} as const

export default dm
