import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Phoenix'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackSeverLife: data_gen.skillParams['basic']['BasicAttackSeverLife'],
    BasicAttackPurifyingFlame:
      data_gen.skillParams['basic']['BasicAttackPurifyingFlame'],
    BasicAttackMeltdown: data_gen.skillParams['basic']['BasicAttackMeltdown'],
  },
  dodge: {
    DodgeDriftingSway: data_gen.skillParams['dodge']['DodgeDriftingSway'],
    DashAttackLunge: data_gen.skillParams['dodge']['DashAttackLunge'],
    DodgeCounterTwinPassageOfKarmicFire:
      data_gen.skillParams['dodge']['DodgeCounterTwinPassageOfKarmicFire'],
  },
  special: {
    SpecialAttackFireSweep:
      data_gen.skillParams['special']['SpecialAttackFireSweep'],
    EXSpecialAttackBlazingSlash:
      data_gen.skillParams['special']['EXSpecialAttackBlazingSlash'],
    EXSpecialAttackDazzlingFlare:
      data_gen.skillParams['special']['EXSpecialAttackDazzlingFlare'],
    EXSpecialAttackFallingSun:
      data_gen.skillParams['special']['EXSpecialAttackFallingSun'],
  },
  chain: {
    ChainAttackLastMinuteSalvation:
      data_gen.skillParams['chain']['ChainAttackLastMinuteSalvation'],
    UltimatePerpetualResurrection:
      data_gen.skillParams['chain']['UltimatePerpetualResurrection'],
    SoulSearchingBlaze: data_gen.skillParams['chain']['SoulSearchingBlaze'],
  },
  assist: {
    QuickAssistEmergencyAid:
      data_gen.skillParams['assist']['QuickAssistEmergencyAid'],
    DefensiveAssistPatientTurnedDoctor:
      data_gen.skillParams['assist']['DefensiveAssistPatientTurnedDoctor'],
    AssistFollowUpRegenerationTherapy:
      data_gen.skillParams['assist']['AssistFollowUpRegenerationTherapy'],
  },
  core: {
    anomProf: data_gen.coreParams[0],
    searDuration: data_gen.coreParams[1][0],
    anom_crit_: data_gen.coreParams[2][0],
    anom_crit_dmg_: data_gen.coreParams[3],
    anomMasteryThreshold: data_gen.coreParams[4][0],
    anom_crit_step: data_gen.coreParams[5][0],
    maxAnomMastery: data_gen.coreParams[6][0],
    dmg: data_gen.coreParams[7],
    dmgCooldown: data_gen.coreParams[8][0],
    maxPyre: data_gen.coreParams[9][0],
    hpRecovery: data_gen.coreParams[10][0],
    cooldown: data_gen.coreParams[11][0],
    pyreGained: data_gen.coreParams[12][0],
    pyreCooldown: data_gen.coreParams[13][0],
    witherAndBloomDuration: data_gen.coreParams[14][0],
  },
  ability: {
    anomaly_crit_dmg_: data_gen.abilityParams[0],
  },
  m1: {
    ascensionGained: data_gen.mindscapeParams[0][0],
    cooldown: data_gen.mindscapeParams[0][1],
    anom_crit_dmg_: data_gen.mindscapeParams[0][2],
    pyreEfficiency: data_gen.mindscapeParams[0][3],
  },
  m2: {
    burnDurationInc: data_gen.mindscapeParams[1][0],
    common_dmg_: data_gen.mindscapeParams[1][1],
  },
  m4: {
    abloomInstances: data_gen.mindscapeParams[3][0],
    anom_mv_mult_: data_gen.mindscapeParams[3][1],
  },
  m6: {
    resIgn_: data_gen.mindscapeParams[5][0],
    ascensionGained: data_gen.mindscapeParams[5][1],
    abloom_defIgn_: data_gen.mindscapeParams[5][2],
  },
} as const

export default dm
