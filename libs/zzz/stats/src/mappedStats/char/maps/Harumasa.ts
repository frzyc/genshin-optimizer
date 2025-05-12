import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Harumasa'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackCloudPiercer:
      data_gen.skillParams['basic']['BasicAttackCloudPiercer'],
    BasicAttackCloudPiercerDrift:
      data_gen.skillParams['basic']['BasicAttackCloudPiercerDrift'],
    BasicAttackFallingFeather:
      data_gen.skillParams['basic']['BasicAttackFallingFeather'],
    BasicAttackHaOtoNoYa: data_gen.skillParams['basic']['BasicAttackHaOtoNoYa'],
  },
  dodge: {
    DodgeQuickFlash: data_gen.skillParams['dodge']['DodgeQuickFlash'],
    DashAttackHitenNoTsuru:
      data_gen.skillParams['dodge']['DashAttackHitenNoTsuru'],
    DodgeCounterHiddenEdge:
      data_gen.skillParams['dodge']['DodgeCounterHiddenEdge'],
    DashAttackHitenNoTsuruSlash:
      data_gen.skillParams['dodge']['DashAttackHitenNoTsuruSlash'],
  },
  special: {
    SpecialAttackNowhereToHide:
      data_gen.skillParams['special']['SpecialAttackNowhereToHide'],
    EXSpecialAttackNowhereToRun:
      data_gen.skillParams['special']['EXSpecialAttackNowhereToRun'],
  },
  chain: {
    ChainAttackKaiHanare: data_gen.skillParams['chain']['ChainAttackKaiHanare'],
    UltimateZanshin: data_gen.skillParams['chain']['UltimateZanshin'],
  },
  assist: {
    QuickAssistBracedBow:
      data_gen.skillParams['assist']['QuickAssistBracedBow'],
    DefensiveAssistYugamae:
      data_gen.skillParams['assist']['DefensiveAssistYugamae'],
    AssistFollowUpYugamaeSlash:
      data_gen.skillParams['assist']['AssistFollowUpYugamaeSlash'],
  },
} as const

export default dm
