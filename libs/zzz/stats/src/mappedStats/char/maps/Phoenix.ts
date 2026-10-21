import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Phoenix'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackSeverLife: data_gen.skillParams['basic']['BasicAttackSeverLife'],
    BasicAttackPurifyingFlame:
      data_gen.skillParams['basic']['BasicAttackPurifyingFlame'],
    BasicAttackMeltdown: data_gen.skillParams['basic']['BasicAttackMeltdown'],
  },
  dodge: {
    DodgeDriftingSway: data_gen.skillParams['dodge']['DodgeDriftingSway'],
    DashAttackLunge: data_gen.skillParams['dodge']['DashAttackLunge'],
    DodgeCounterTwinPassageOfKarmicFire:
      data_gen.skillParams['dodge']['DodgeCounterTwinPassageOfKarmicFire'],
  },
  special: {
    SpecialAttackFireSweep:
      data_gen.skillParams['special']['SpecialAttackFireSweep'],
    EXSpecialAttackBlazingSlash:
      data_gen.skillParams['special']['EXSpecialAttackBlazingSlash'],
    EXSpecialAttackDazzlingFlare:
      data_gen.skillParams['special']['EXSpecialAttackDazzlingFlare'],
    EXSpecialAttackFallingSun:
      data_gen.skillParams['special']['EXSpecialAttackFallingSun'],
  },
  chain: {
    ChainAttackLastMinuteSalvation:
      data_gen.skillParams['chain']['ChainAttackLastMinuteSalvation'],
    UltimatePerpetualResurrection:
      data_gen.skillParams['chain']['UltimatePerpetualResurrection'],
    SoulSearchingBlaze: data_gen.skillParams['chain']['SoulSearchingBlaze'],
  },
  assist: {
    QuickAssistEmergencyAid:
      data_gen.skillParams['assist']['QuickAssistEmergencyAid'],
    DefensiveAssistPatientTurnedDoctor:
      data_gen.skillParams['assist']['DefensiveAssistPatientTurnedDoctor'],
    AssistFollowUpRegenerationTherapy:
      data_gen.skillParams['assist']['AssistFollowUpRegenerationTherapy'],
  },
} as const

export default dm
