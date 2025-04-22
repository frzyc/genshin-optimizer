import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Evelyn'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackRazorWire: data_gen.skillParams['basic']['BasicAttackRazorWire'],
    PassiveBind: data_gen.skillParams['basic']['PassiveBind'],
    BasicAttackGarroteFirstForm:
      data_gen.skillParams['basic']['BasicAttackGarroteFirstForm'],
    BasicAttackGarroteSecondForm:
      data_gen.skillParams['basic']['BasicAttackGarroteSecondForm'],
  },
  dodge: {
    DodgeArcStep: data_gen.skillParams['dodge']['DodgeArcStep'],
    DashAttackPiercingAmbush:
      data_gen.skillParams['dodge']['DashAttackPiercingAmbush'],
    DodgeCounterStranglingReversal:
      data_gen.skillParams['dodge']['DodgeCounterStranglingReversal'],
  },
  special: {
    SpecialAttackLockedPosition:
      data_gen.skillParams['special']['SpecialAttackLockedPosition'],
    SpecialAttackBindingSunderFirstForm:
      data_gen.skillParams['special']['SpecialAttackBindingSunderFirstForm'],
    EXSpecialAttackBindingSunderFinalForm:
      data_gen.skillParams['special']['EXSpecialAttackBindingSunderFinalForm'],
  },
  chain: {
    ChainAttackLunaluxSnare:
      data_gen.skillParams['chain']['ChainAttackLunaluxSnare'],
    UltimateLunaluxGarroteTimbre:
      data_gen.skillParams['chain']['UltimateLunaluxGarroteTimbre'],
    UltimateLunaluxGarroteShadow:
      data_gen.skillParams['chain']['UltimateLunaluxGarroteShadow'],
  },
  assist: {
    QuickAssistFierceBlade:
      data_gen.skillParams['assist']['QuickAssistFierceBlade'],
    DefensiveAssistSilentProtection:
      data_gen.skillParams['assist']['DefensiveAssistSilentProtection'],
    AssistFollowUpCourseDisruption:
      data_gen.skillParams['assist']['AssistFollowUpCourseDisruption'],
  },
} as const

export default dm
