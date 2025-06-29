import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Caesar'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackRampagingSlash:
      data_gen.skillParams['basic']['BasicAttackRampagingSlash'],
    BasicAttackDeadEnd: data_gen.skillParams['basic']['BasicAttackDeadEnd'],
  },
  dodge: {
    DodgeAdrift: data_gen.skillParams['dodge']['DodgeAdrift'],
    DashAttackHogRush: data_gen.skillParams['dodge']['DashAttackHogRush'],
    DodgeCounterEyeForAnEye:
      data_gen.skillParams['dodge']['DodgeCounterEyeForAnEye'],
  },
  special: {
    SpecialAttackShockwaveShieldBash:
      data_gen.skillParams['special']['SpecialAttackShockwaveShieldBash'],
    SpecialAttackRoaringThrust:
      data_gen.skillParams['special']['SpecialAttackRoaringThrust'],
    EXSpecialAttackParryCounter:
      data_gen.skillParams['special']['EXSpecialAttackParryCounter'],
    EXSpecialAttackOverpoweredShieldBash:
      data_gen.skillParams['special']['EXSpecialAttackOverpoweredShieldBash'],
    StanceSwitch: data_gen.skillParams['special']['StanceSwitch'],
  },
  chain: {
    ChainAttackRoadRageSlam:
      data_gen.skillParams['chain']['ChainAttackRoadRageSlam'],
    UltimateSavageSmash: data_gen.skillParams['chain']['UltimateSavageSmash'],
  },
  assist: {
    QuickAssistLaneChange:
      data_gen.skillParams['assist']['QuickAssistLaneChange'],
    DefensiveAssistAegisShield:
      data_gen.skillParams['assist']['DefensiveAssistAegisShield'],
    AssistFollowUpAidingBlade:
      data_gen.skillParams['assist']['AssistFollowUpAidingBlade'],
  },
  core: {
    shield_: data_gen.coreParams[0],
    shield: data_gen.coreParams[1],
    shield_duration: data_gen.coreParams[2][0],
    atk: data_gen.coreParams[3],
    duration: data_gen.coreParams[4][0],
  },
  ability: {
    dmg_: data_gen.abilityParams[0],
    duration: data_gen.abilityParams[1],
  },
  m1: {
    cooldown: data_gen.mindscapeParams[0][0],
    attrRes_: data_gen.mindscapeParams[0][1],
  },
  m2: {
    enerRegen_: data_gen.mindscapeParams[1][0],
    atk_increase_: data_gen.mindscapeParams[1][1],
  },
  m4: {
    assist_points: data_gen.mindscapeParams[3][0],
    energy_threshold: data_gen.mindscapeParams[3][1],
    assist_point_cost: data_gen.mindscapeParams[3][2],
    cooldown: data_gen.mindscapeParams[3][3],
  },
  m6: {
    dmg_: data_gen.mindscapeParams[5][0],
    dmg: data_gen.mindscapeParams[5][1],
    crit_: data_gen.mindscapeParams[5][2],
    crit_dmg_: data_gen.mindscapeParams[5][3],
    duration: data_gen.mindscapeParams[5][4],
  },
} as const

export default dm
