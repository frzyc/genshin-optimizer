import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Rina'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackWhackTheDimwit:
      data_gen.skillParams['basic']['BasicAttackWhackTheDimwit'],
    BasicAttackShooTheFool:
      data_gen.skillParams['basic']['BasicAttackShooTheFool'],
  },
  dodge: {
    DodgeDressAdjustment: data_gen.skillParams['dodge']['DodgeDressAdjustment'],
    DashAttackSuddenSurprise:
      data_gen.skillParams['dodge']['DashAttackSuddenSurprise'],
    DodgeCounterBangbooCallback:
      data_gen.skillParams['dodge']['DodgeCounterBangbooCallback'],
  },
  special: {
    SpecialAttackBeatTheBlockhead:
      data_gen.skillParams['special']['SpecialAttackBeatTheBlockhead'],
    EXSpecialAttackDimwitDisappearingTrick:
      data_gen.skillParams['special']['EXSpecialAttackDimwitDisappearingTrick'],
  },
  chain: {
    ChainAttackCodeOfConduct:
      data_gen.skillParams['chain']['ChainAttackCodeOfConduct'],
    UltimateTheQueensAttendants:
      data_gen.skillParams['chain']['UltimateTheQueensAttendants'],
  },
  assist: {
    QuickAssistDupleMeterAllemande:
      data_gen.skillParams['assist']['QuickAssistDupleMeterAllemande'],
    EvasiveAssistTripleMeterCourante:
      data_gen.skillParams['assist']['EvasiveAssistTripleMeterCourante'],
    AssistFollowUpQuadrupleMeterGavotte:
      data_gen.skillParams['assist']['AssistFollowUpQuadrupleMeterGavotte'],
  },
} as const

export default dm
