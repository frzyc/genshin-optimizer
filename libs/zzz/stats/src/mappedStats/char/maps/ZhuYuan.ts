import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'ZhuYuan'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackDontMove: data_gen.skillParams['basic']['BasicAttackDontMove'],
    BasicAttackPleaseDoNotResist:
      data_gen.skillParams['basic']['BasicAttackPleaseDoNotResist'],
  },
  dodge: {
    DodgeTacticalDetour: data_gen.skillParams['dodge']['DodgeTacticalDetour'],
    DashAttackFirepowerOffensive:
      data_gen.skillParams['dodge']['DashAttackFirepowerOffensive'],
    DashAttackOverwhelmingFirepower:
      data_gen.skillParams['dodge']['DashAttackOverwhelmingFirepower'],
    DodgeCounterFireBlast:
      data_gen.skillParams['dodge']['DodgeCounterFireBlast'],
  },
  special: {
    SpecialAttackBuckshotBlast:
      data_gen.skillParams['special']['SpecialAttackBuckshotBlast'],
    EXSpecialAttackFullBarrage:
      data_gen.skillParams['special']['EXSpecialAttackFullBarrage'],
  },
  chain: {
    ChainAttackEradicationMode:
      data_gen.skillParams['chain']['ChainAttackEradicationMode'],
    UltimateMaxEradicationMode:
      data_gen.skillParams['chain']['UltimateMaxEradicationMode'],
  },
  assist: {
    QuickAssistCoveringShot:
      data_gen.skillParams['assist']['QuickAssistCoveringShot'],
    EvasiveAssistGuardedBackup:
      data_gen.skillParams['assist']['EvasiveAssistGuardedBackup'],
    AssistFollowUpDefensiveCounter:
      data_gen.skillParams['assist']['AssistFollowUpDefensiveCounter'],
  },
} as const

export default dm
