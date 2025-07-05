import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Miyabi'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackKazahana: data_gen.skillParams['basic']['BasicAttackKazahana'],
    BasicAttackShimotsuki:
      data_gen.skillParams['basic']['BasicAttackShimotsuki'],
  },
  dodge: {
    DodgeMizutori: data_gen.skillParams['dodge']['DodgeMizutori'],
    DashAttackFuyubachi: data_gen.skillParams['dodge']['DashAttackFuyubachi'],
    DodgeCounterKanSuzume:
      data_gen.skillParams['dodge']['DodgeCounterKanSuzume'],
  },
  special: {
    SpecialAttackMiyuki: data_gen.skillParams['special']['SpecialAttackMiyuki'],
    EXSpecialAttackHisetsu:
      data_gen.skillParams['special']['EXSpecialAttackHisetsu'],
  },
  chain: {
    ChainAttackSpringsCall:
      data_gen.skillParams['chain']['ChainAttackSpringsCall'],
    UltimateLingeringSnow:
      data_gen.skillParams['chain']['UltimateLingeringSnow'],
  },
  assist: {
    QuickAssistDancingPetals:
      data_gen.skillParams['assist']['QuickAssistDancingPetals'],
    DefensiveAssistDriftingPetals:
      data_gen.skillParams['assist']['DefensiveAssistDriftingPetals'],
    AssistFollowUpFallingPetals:
      data_gen.skillParams['assist']['AssistFollowUpFallingPetals'],
  },
  core: {
    icefire_duration: data_gen.coreParams[0][0],
    frost_anomBuildup_: data_gen.coreParams[1][0],
    max_anomBuildup_: data_gen.coreParams[2][0],
    dmg: data_gen.coreParams[3],
    anomBuildup_: data_gen.coreParams[4][0],
    fallen_frost: data_gen.coreParams[5][0],
    cooldown: data_gen.coreParams[6][0],
  },
  ability: {
    dmg_: data_gen.abilityParams[0],
    fallen_frost: data_gen.abilityParams[1],
    ice_resIgn_: data_gen.abilityParams[2],
  },
  m1: {
    fallen_frost_consumed: data_gen.mindscapeParams[0][0],
    defIgn_: data_gen.mindscapeParams[0][1],
    max_stacks: data_gen.mindscapeParams[0][2],
    anomBuildup_: data_gen.mindscapeParams[0][3],
    duration: data_gen.mindscapeParams[0][4],
  },
  m2: {
    dmg_: data_gen.mindscapeParams[1][0],
    fallen_frost_gain: data_gen.mindscapeParams[1][1],
    fallen_frost: data_gen.mindscapeParams[1][2],
    crit_: data_gen.mindscapeParams[1][3],
  },
  m4: {
    frostburn_dmg_: data_gen.mindscapeParams[3][0],
    decibels: data_gen.mindscapeParams[3][1],
  },
  m6: {
    dmg_: data_gen.mindscapeParams[5][0],
    draws_slashes: data_gen.mindscapeParams[5][1],
  },
} as const

export default dm
