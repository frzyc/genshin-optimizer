import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Vivian'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackFeatheredStrike:
      data_gen.skillParams['basic']['BasicAttackFeatheredStrike'],
    BasicAttackNoblewomanWaltz:
      data_gen.skillParams['basic']['BasicAttackNoblewomanWaltz'],
    BasicAttackFlutteringFrockSuspension:
      data_gen.skillParams['basic']['BasicAttackFlutteringFrockSuspension'],
    BasicAttackFeatherbloom:
      data_gen.skillParams['basic']['BasicAttackFeatherbloom'],
  },
  dodge: {
    DodgeLightstream: data_gen.skillParams['dodge']['DodgeLightstream'],
    DashAttackSilverThornedMelody:
      data_gen.skillParams['dodge']['DashAttackSilverThornedMelody'],
    DodgeCounterWingbladeReverb:
      data_gen.skillParams['dodge']['DodgeCounterWingbladeReverb'],
    DodgeDaintySteps: data_gen.skillParams['dodge']['DodgeDaintySteps'],
  },
  special: {
    SpecialAttackSongOfSilverWings:
      data_gen.skillParams['special']['SpecialAttackSongOfSilverWings'],
    EXSpecialAttackVioletRequiem:
      data_gen.skillParams['special']['EXSpecialAttackVioletRequiem'],
  },
  chain: {
    ChainAttackChorusOfCelestialWings:
      data_gen.skillParams['chain']['ChainAttackChorusOfCelestialWings'],
    UltimateSoaringBirdsSong:
      data_gen.skillParams['chain']['UltimateSoaringBirdsSong'],
  },
  assist: {
    QuickAssistFrostwingGuard:
      data_gen.skillParams['assist']['QuickAssistFrostwingGuard'],
    DefensiveAssistSilverUmbrellaFormation:
      data_gen.skillParams['assist']['DefensiveAssistSilverUmbrellaFormation'],
    AssistFollowUpFeatherbladeExecution:
      data_gen.skillParams['assist']['AssistFollowUpFeatherbladeExecution'],
  },
  core: {
    dmg_ether: data_gen.coreParams[0],
    dmg_electric: data_gen.coreParams[1],
    dmg_fire: data_gen.coreParams[2],
    dmg_physical: data_gen.coreParams[3],
    dmg_ice: data_gen.coreParams[4],
    anomProf_step: data_gen.coreParams[5][0],
    dmg: data_gen.coreParams[6][0],
    cooldown: data_gen.coreParams[7][0],
    flight_feathers: data_gen.coreParams[8][0],
  },
  ability: {
    guard_feathers_consumed: data_gen.abilityParams[0],
    cooldown: data_gen.abilityParams[1],
    ether_anom_dmg_: data_gen.abilityParams[2],
  },
  m1: {
    guard_feathers_consumed: data_gen.mindscapeParams[0][0],
    flight_feathers_gained: data_gen.mindscapeParams[0][1],
    anomaly_disorder_dmg_: data_gen.mindscapeParams[0][2],
  },
  m2: {
    ether_anomBuildup_: data_gen.mindscapeParams[1][0],
    abloom_bonus: data_gen.mindscapeParams[1][1],
    resIgn_: data_gen.mindscapeParams[1][2],
  },
  m4: {
    atk_: data_gen.mindscapeParams[3][0],
    duration: data_gen.mindscapeParams[3][1],
    guard_feathers_gained: data_gen.mindscapeParams[3][2],
  },
  m6: {
    ether_dmg_: data_gen.mindscapeParams[5][0],
    flight_feathers_gained: data_gen.mindscapeParams[5][1],
    max_guard_feathers_consumed: data_gen.mindscapeParams[5][2],
    max_bonus: data_gen.mindscapeParams[5][3],
  },
} as const

export default dm
