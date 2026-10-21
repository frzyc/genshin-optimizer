import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Severian'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackSwiftEdge: data_gen.skillParams['basic']['BasicAttackSwiftEdge'],
    BasicAttackRagingWhirlwind:
      data_gen.skillParams['basic']['BasicAttackRagingWhirlwind'],
    BasicAttackAzureWindsShadowhunt:
      data_gen.skillParams['basic']['BasicAttackAzureWindsShadowhunt'],
  },
  dodge: {
    DodgeWindshift: data_gen.skillParams['dodge']['DodgeWindshift'],
    DashAttackSheerAssault:
      data_gen.skillParams['dodge']['DashAttackSheerAssault'],
    DodgeCounterFatalEnd: data_gen.skillParams['dodge']['DodgeCounterFatalEnd'],
    DodgeSpontaneity: data_gen.skillParams['dodge']['DodgeSpontaneity'],
  },
  special: {
    SpecialAttackGaleRend:
      data_gen.skillParams['special']['SpecialAttackGaleRend'],
    EXSpecialAttackSwiftwindRupture:
      data_gen.skillParams['special']['EXSpecialAttackSwiftwindRupture'],
  },
  chain: {
    ChainAttackColdbladeReap:
      data_gen.skillParams['chain']['ChainAttackColdbladeReap'],
    UltimateAnnihilatingWindstorm:
      data_gen.skillParams['chain']['UltimateAnnihilatingWindstorm'],
  },
  assist: {
    QuickAssistFieldOrders:
      data_gen.skillParams['assist']['QuickAssistFieldOrders'],
    DefensiveAssistProvocationProhibited:
      data_gen.skillParams['assist']['DefensiveAssistProvocationProhibited'],
    AssistFollowUpFightForceWithForce:
      data_gen.skillParams['assist']['AssistFollowUpFightForceWithForce'],
    EntrySkillClearOut: data_gen.skillParams['assist']['EntrySkillClearOut'],
  },
} as const

export default dm
