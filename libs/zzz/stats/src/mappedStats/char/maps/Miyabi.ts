import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Miyabi'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackKazahana: data_gen.skillParams['basic']['BasicAttackKazahana'],
    BasicAttackShimotsuki:
      data_gen.skillParams['basic']['BasicAttackShimotsuki'],
  },
  dodge: {
    DodgeMizutori: data_gen.skillParams['dodge']['DodgeMizutori'],
    DashAttackFuyubachi: data_gen.skillParams['dodge']['DashAttackFuyubachi'],
    DodgeCounterKanSuzume:
      data_gen.skillParams['dodge']['DodgeCounterKanSuzume'],
  },
  special: {
    SpecialAttackMiyuki: data_gen.skillParams['special']['SpecialAttackMiyuki'],
    EXSpecialAttackHisetsu:
      data_gen.skillParams['special']['EXSpecialAttackHisetsu'],
  },
  chain: {
    ChainAttackSpringsCall:
      data_gen.skillParams['chain']['ChainAttackSpringsCall'],
    UltimateLingeringSnow:
      data_gen.skillParams['chain']['UltimateLingeringSnow'],
  },
  assist: {
    QuickAssistDancingPetals:
      data_gen.skillParams['assist']['QuickAssistDancingPetals'],
    DefensiveAssistDriftingPetals:
      data_gen.skillParams['assist']['DefensiveAssistDriftingPetals'],
    AssistFollowUpFallingPetals:
      data_gen.skillParams['assist']['AssistFollowUpFallingPetals'],
  },
} as const

export default dm
