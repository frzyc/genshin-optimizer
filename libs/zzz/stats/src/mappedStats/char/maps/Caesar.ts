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
} as const

export default dm
