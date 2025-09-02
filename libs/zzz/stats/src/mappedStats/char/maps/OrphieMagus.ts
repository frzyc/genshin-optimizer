import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'OrphieMagus'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackHighPressureFlamethrower:
      data_gen.skillParams['basic']['BasicAttackHighPressureFlamethrower'],
  },
  dodge: {
    DodgeFlickeringFlames:
      data_gen.skillParams['dodge']['DodgeFlickeringFlames'],
    DashAttackRushCommand:
      data_gen.skillParams['dodge']['DashAttackRushCommand'],
    DodgeCounterCounterStrikeOpportunity:
      data_gen.skillParams['dodge']['DodgeCounterCounterStrikeOpportunity'],
  },
  special: {
    SpecialAttackBlazingChamber:
      data_gen.skillParams['special']['SpecialAttackBlazingChamber'],
    SpecialAttackCorrosiveFlash:
      data_gen.skillParams['special']['SpecialAttackCorrosiveFlash'],
    EXSpecialAttackWatchYourStep:
      data_gen.skillParams['special']['EXSpecialAttackWatchYourStep'],
    EXSpecialAttackCrimsonVortex:
      data_gen.skillParams['special']['EXSpecialAttackCrimsonVortex'],
    EXSpecialAttackHeatCharge:
      data_gen.skillParams['special']['EXSpecialAttackHeatCharge'],
    EXSpecialAttackFieryEruption:
      data_gen.skillParams['special']['EXSpecialAttackFieryEruption'],
  },
  chain: {
    ChainAttackOverheatedBarrel:
      data_gen.skillParams['chain']['ChainAttackOverheatedBarrel'],
    UltimateDanceWithFire:
      data_gen.skillParams['chain']['UltimateDanceWithFire'],
  },
  assist: {
    QuickAssistSearingSlash:
      data_gen.skillParams['assist']['QuickAssistSearingSlash'],
    DefensiveAssistBlazingGunblade:
      data_gen.skillParams['assist']['DefensiveAssistBlazingGunblade'],
    AssistFollowUpBoilingPierce:
      data_gen.skillParams['assist']['AssistFollowUpBoilingPierce'],
  },
  core: {
    crit_: data_gen.coreParams[0],
    aftershock_dmg_: data_gen.coreParams[1],
    initial_bottled_heat: data_gen.coreParams[2][0],
    max_bottled_heat: data_gen.coreParams[3][0],
    available_energy: data_gen.coreParams[4][0],
    energy_consumed: data_gen.coreParams[5][0],
    duration: data_gen.coreParams[6][0],
    atk: data_gen.coreParams[7],
    enerRegen_threshold: data_gen.coreParams[8][0],
    enerRegen_step: data_gen.coreParams[9][0],
    add_atk: data_gen.coreParams[10][0],
    max_atk: data_gen.coreParams[11],
    duration_extension: data_gen.coreParams[12][0],
    max_duration_extension: data_gen.coreParams[13][0],
  },
  ability: {
    aftershock_defIgn_: data_gen.abilityParams[0],
  },
  m1: {
    fire_resIgn_: data_gen.mindscapeParams[0][0],
    dmg_: data_gen.mindscapeParams[0][1],
  },
  m2: {
    decibels_restored: data_gen.mindscapeParams[1][0],
    cooldown: data_gen.mindscapeParams[1][1],
    atk_: data_gen.mindscapeParams[1][2],
    duration: data_gen.mindscapeParams[1][3],
  },
  m4: {
    duration: data_gen.mindscapeParams[3][0],
    dmg_: data_gen.mindscapeParams[3][1],
  },
  m6: {
    bottled_heat_recovered: data_gen.mindscapeParams[5][0],
    dmg: data_gen.mindscapeParams[5][1],
    cooldown: data_gen.mindscapeParams[5][2],
  },
} as const

export default dm
