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
  core: {
    pen_scaling: data_gen.coreParams[0][0],
    pen_: data_gen.coreParams[1],
    max_pen_: data_gen.coreParams[2][0],
  },
  ability: {
    shocked_duration: data_gen.abilityParams[0],
    electric_dmg_: data_gen.abilityParams[1],
  },
  m1: {
    duration: data_gen.mindscapeParams[0][0],
    core_buff_: data_gen.mindscapeParams[0][1],
  },
  m2: {
    common_dmg_: data_gen.mindscapeParams[1][0],
    duration: data_gen.mindscapeParams[1][1],
    cooldown: data_gen.mindscapeParams[1][2],
  },
  m4: {
    enerRegen: data_gen.mindscapeParams[3][0],
  },
  m6: {
    electric_dmg_: data_gen.mindscapeParams[5][0],
    duration: data_gen.mindscapeParams[5][1],
  },
} as const

export default dm
