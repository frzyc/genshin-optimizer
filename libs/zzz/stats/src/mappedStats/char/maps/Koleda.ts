import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Koleda'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackSmashNBash:
      data_gen.skillParams['basic']['BasicAttackSmashNBash'],
  },
  dodge: {
    DodgeWaitNSee: data_gen.skillParams['dodge']['DodgeWaitNSee'],
    DashAttackTremble: data_gen.skillParams['dodge']['DashAttackTremble'],
    DodgeCounterDontLookDownOnMe:
      data_gen.skillParams['dodge']['DodgeCounterDontLookDownOnMe'],
  },
  special: {
    SpecialAttackHammerTime:
      data_gen.skillParams['special']['SpecialAttackHammerTime'],
    EXSpecialAttackBoilingFurnace:
      data_gen.skillParams['special']['EXSpecialAttackBoilingFurnace'],
  },
  chain: {
    ChainAttackNaturalDisaster:
      data_gen.skillParams['chain']['ChainAttackNaturalDisaster'],
    UltimateHammerquake: data_gen.skillParams['chain']['UltimateHammerquake'],
  },
  assist: {
    QuickAssistComingThru:
      data_gen.skillParams['assist']['QuickAssistComingThru'],
    DefensiveAssistProtectiveHammer:
      data_gen.skillParams['assist']['DefensiveAssistProtectiveHammer'],
    AssistFollowUpHammerBell:
      data_gen.skillParams['assist']['AssistFollowUpHammerBell'],
  },
} as const

export default dm
