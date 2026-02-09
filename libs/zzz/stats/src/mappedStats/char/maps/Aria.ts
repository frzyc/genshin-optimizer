import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Aria'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackSweetMelody:
      data_gen.skillParams['basic']['BasicAttackSweetMelody'],
    BasicAttackPerfectPitch:
      data_gen.skillParams['basic']['BasicAttackPerfectPitch'],
  },
  dodge: {
    DodgeOnBeatPrecision: data_gen.skillParams['dodge']['DodgeOnBeatPrecision'],
    DashAttackSilkySmoothCombo:
      data_gen.skillParams['dodge']['DashAttackSilkySmoothCombo'],
    DodgeCounterSlideShiftVariation:
      data_gen.skillParams['dodge']['DodgeCounterSlideShiftVariation'],
  },
  special: {
    SpecialAttackFullSugarElectronica:
      data_gen.skillParams['special']['SpecialAttackFullSugarElectronica'],
    SpecialAttackFullSugarElectronicaNoIce:
      data_gen.skillParams['special']['SpecialAttackFullSugarElectronicaNoIce'],
    EXSpecialAttackFallIntoDelusion:
      data_gen.skillParams['special']['EXSpecialAttackFallIntoDelusion'],
    EXSpecialAttackInstantlyHooked:
      data_gen.skillParams['special']['EXSpecialAttackInstantlyHooked'],
  },
  chain: {
    ChainAttackDreamCollab:
      data_gen.skillParams['chain']['ChainAttackDreamCollab'],
    Ultimate100Energy: data_gen.skillParams['chain']['Ultimate100Energy'],
  },
  assist: {
    QuickAssistShatterFantasy:
      data_gen.skillParams['assist']['QuickAssistShatterFantasy'],
    DefensiveAssistClutchSave:
      data_gen.skillParams['assist']['DefensiveAssistClutchSave'],
    AssistFollowUpEncoreSong:
      data_gen.skillParams['assist']['AssistFollowUpEncoreSong'],
  },
} as const

export default dm
