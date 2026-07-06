import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Zhao'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackGlacialJudgment:
      data_gen.skillParams['basic']['BasicAttackGlacialJudgment'],
    BasicAttackFinalVerdict:
      data_gen.skillParams['basic']['BasicAttackFinalVerdict'],
  },
  dodge: {
    DodgeBunnyHop: data_gen.skillParams['dodge']['DodgeBunnyHop'],
    DashAttackBouncingDash:
      data_gen.skillParams['dodge']['DashAttackBouncingDash'],
    DodgeCounterSwiftBlink:
      data_gen.skillParams['dodge']['DodgeCounterSwiftBlink'],
  },
  special: {
    SpecialAttackShatterfrostSurge:
      data_gen.skillParams['special']['SpecialAttackShatterfrostSurge'],
    EXSpecialAttackFrostflowTundra:
      data_gen.skillParams['special']['EXSpecialAttackFrostflowTundra'],
  },
  chain: {
    ChainAttackTemporaryAlliance:
      data_gen.skillParams['chain']['ChainAttackTemporaryAlliance'],
    UltimateBunnyBarrage: data_gen.skillParams['chain']['UltimateBunnyBarrage'],
  },
  assist: {
    EntrySkillBurstOfFrost:
      data_gen.skillParams['assist']['EntrySkillBurstOfFrost'],
    QuickAssistPatchTheGaps:
      data_gen.skillParams['assist']['QuickAssistPatchTheGaps'],
    DefensiveAssistFrostveilSuppression:
      data_gen.skillParams['assist']['DefensiveAssistFrostveilSuppression'],
    AssistFollowUpFrostlightReflection:
      data_gen.skillParams['assist']['AssistFollowUpFrostlightReflection'],
  },
} as const

export default dm
