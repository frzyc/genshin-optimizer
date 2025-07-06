import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Pulchra'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackSwiftStrike:
      data_gen.skillParams['basic']['BasicAttackSwiftStrike'],
    BasicAttackLeapingStrike:
      data_gen.skillParams['basic']['BasicAttackLeapingStrike'],
  },
  dodge: {
    DodgeReversalShot: data_gen.skillParams['dodge']['DodgeReversalShot'],
    DashAttackFirstStrikeAdvantage:
      data_gen.skillParams['dodge']['DashAttackFirstStrikeAdvantage'],
    DodgeCounterRelentlessRetribution:
      data_gen.skillParams['dodge']['DodgeCounterRelentlessRetribution'],
  },
  special: {
    SpecialAttackRendingClaw:
      data_gen.skillParams['special']['SpecialAttackRendingClaw'],
    SpecialAttackRendingClawNightmareShadow:
      data_gen.skillParams['special'][
        'SpecialAttackRendingClawNightmareShadow'
      ],
    EXSpecialAttackRendingClawFlashstep:
      data_gen.skillParams['special']['EXSpecialAttackRendingClawFlashstep'],
  },
  chain: {
    ChainAttackHeyDidntExpectThatRight:
      data_gen.skillParams['chain']['ChainAttackHeyDidntExpectThatRight'],
    UltimateOhTimeToPlay: data_gen.skillParams['chain']['UltimateOhTimeToPlay'],
  },
  assist: {
    QuickAssistContractBodyguard:
      data_gen.skillParams['assist']['QuickAssistContractBodyguard'],
    EvasiveAssistContractOutsourcedCombat:
      data_gen.skillParams['assist']['EvasiveAssistContractOutsourcedCombat'],
    AssistFollowUpIndependentPricing:
      data_gen.skillParams['assist']['AssistFollowUpIndependentPricing'],
  },
  core: {
    dazeInc_: data_gen.coreParams[0],
    duration: data_gen.coreParams[1][0],
  },
  ability: {
    duration: data_gen.abilityParams[0],
    aftershock_dmg_: data_gen.abilityParams[1],
  },
  m1: {
    crit_: data_gen.mindscapeParams[0][0],
  },
  m2: {
    atk_: data_gen.mindscapeParams[1][0],
  },
  m4: {
    energyCost_red_: data_gen.mindscapeParams[3][0],
  },
  m6: {
    dmg_: data_gen.mindscapeParams[5][0],
    triggers: data_gen.mindscapeParams[5][1],
  },
} as const

export default dm
