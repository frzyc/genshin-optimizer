import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Lycaon'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackMoonHunter:
      data_gen.skillParams['basic']['BasicAttackMoonHunter'],
  },
  dodge: {
    DodgeSuitablePositioning:
      data_gen.skillParams['dodge']['DodgeSuitablePositioning'],
    DashAttackKeepItClean:
      data_gen.skillParams['dodge']['DashAttackKeepItClean'],
    DodgeCounterEtiquetteManual:
      data_gen.skillParams['dodge']['DodgeCounterEtiquetteManual'],
  },
  special: {
    SpecialAttackTimeToHunt:
      data_gen.skillParams['special']['SpecialAttackTimeToHunt'],
    EXSpecialAttackThrillOfTheHunt:
      data_gen.skillParams['special']['EXSpecialAttackThrillOfTheHunt'],
  },
  chain: {
    ChainAttackAsYouWish: data_gen.skillParams['chain']['ChainAttackAsYouWish'],
    UltimateMissionComplete:
      data_gen.skillParams['chain']['UltimateMissionComplete'],
  },
  assist: {
    QuickAssistWolfPack: data_gen.skillParams['assist']['QuickAssistWolfPack'],
    DefensiveAssistDisruptedHunt:
      data_gen.skillParams['assist']['DefensiveAssistDisruptedHunt'],
    AssistFollowUpVengefulCounterattack:
      data_gen.skillParams['assist']['AssistFollowUpVengefulCounterattack'],
  },
} as const

export default dm
