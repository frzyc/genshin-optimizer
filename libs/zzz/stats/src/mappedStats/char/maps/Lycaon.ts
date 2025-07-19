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
  core: {
    dazeInc_: data_gen.coreParams[0],
    ice_resRed_: data_gen.coreParams[1][0],
    duration: data_gen.coreParams[2][0],
  },
  ability: {
    stun_: data_gen.abilityParams[0],
  },
  m1: {
    dazeInc_: data_gen.mindscapeParams[0][0],
    cooldown: data_gen.mindscapeParams[0][1],
    dazeInc_full_charge: data_gen.mindscapeParams[0][2],
  },
  m2: {
    energy: data_gen.mindscapeParams[1][0],
    cooldown: data_gen.mindscapeParams[1][1],
  },
  m4: {
    shield: data_gen.mindscapeParams[3][0],
    duration: data_gen.mindscapeParams[3][1],
    cooldown: data_gen.mindscapeParams[3][2],
  },
  m6: {
    common_dmg_: data_gen.mindscapeParams[5][0],
    stacks: data_gen.mindscapeParams[5][1],
    duration: data_gen.mindscapeParams[5][2],
  },
} as const

export default dm
