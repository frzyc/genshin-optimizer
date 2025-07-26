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
  core: {
    dazeInc_: data_gen.coreParams[0],
  },
  ability: {
    chain_dmg_: data_gen.abilityParams[0],
    stacks: data_gen.abilityParams[1],
  },
  m1: {
    dazeInc_: data_gen.mindscapeParams[0][0],
  },
  m2: {
    energy: data_gen.mindscapeParams[1][0],
    cooldown: data_gen.mindscapeParams[1][1],
  },
  m4: {
    stacks: data_gen.mindscapeParams[3][0],
    chain_ult_dmg_: data_gen.mindscapeParams[3][1],
  },
  m6: {
    dmg: data_gen.mindscapeParams[5][0],
  },
} as const

export default dm
