import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Soldier0Anby'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackPenetratingShock:
      data_gen.skillParams['basic']['BasicAttackPenetratingShock'],
  },
  dodge: {
    DodgeStrobe: data_gen.skillParams['dodge']['DodgeStrobe'],
    DashAttackTorrent: data_gen.skillParams['dodge']['DashAttackTorrent'],
    DodgeCounterGroundFlashCounter:
      data_gen.skillParams['dodge']['DodgeCounterGroundFlashCounter'],
  },
  special: {
    SpecialAttackCelestialThunder:
      data_gen.skillParams['special']['SpecialAttackCelestialThunder'],
    SpecialAttackAzureFlash:
      data_gen.skillParams['special']['SpecialAttackAzureFlash'],
    SpecialAttackThunderSmite:
      data_gen.skillParams['special']['SpecialAttackThunderSmite'],
    EXSpecialAttackSunderingBolt:
      data_gen.skillParams['special']['EXSpecialAttackSunderingBolt'],
  },
  chain: {
    ChainAttackLeapingThunderstrike:
      data_gen.skillParams['chain']['ChainAttackLeapingThunderstrike'],
    UltimateVoidstrike: data_gen.skillParams['chain']['UltimateVoidstrike'],
  },
  assist: {
    QuickAssistCloudFlash:
      data_gen.skillParams['assist']['QuickAssistCloudFlash'],
    DefensiveAssistCounterSurge:
      data_gen.skillParams['assist']['DefensiveAssistCounterSurge'],
    AssistFollowUpConductingBlow:
      data_gen.skillParams['assist']['AssistFollowUpConductingBlow'],
  },
  core: {
    common_dmg_: data_gen.coreParams[0],
    aftershock_crit_dmg_scaling_: data_gen.coreParams[1],
  },
  ability: {
    crit_: data_gen.abilityParams[0],
    aftershock_dmg_: data_gen.abilityParams[1],
  },
  m1: {
    additional_dmg_triggers: data_gen.mindscapeParams[0][0],
  },
  m2: {
    crit_: data_gen.mindscapeParams[1][0],
    stacks_gained_: data_gen.mindscapeParams[1][1],
    stacks: data_gen.mindscapeParams[1][2],
    stacks_consumed: data_gen.mindscapeParams[1][3],
    stacks_consumed_per_hit: data_gen.mindscapeParams[1][4],
  },
  m4: {
    electric_resIgn_: data_gen.mindscapeParams[3][0],
  },
  m6: {
    instances_triggered: data_gen.mindscapeParams[5][0],
    dmg: data_gen.mindscapeParams[5][1],
  },
} as const

export default dm
