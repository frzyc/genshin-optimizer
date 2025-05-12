import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Nicole'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackCunningCombo:
      data_gen.skillParams['basic']['BasicAttackCunningCombo'],
    BasicAttackDoAsIPlease:
      data_gen.skillParams['basic']['BasicAttackDoAsIPlease'],
  },
  dodge: {
    DodgeSpeedDemon: data_gen.skillParams['dodge']['DodgeSpeedDemon'],
    DashAttackJackInTheBox:
      data_gen.skillParams['dodge']['DashAttackJackInTheBox'],
    DodgeCounterDivertedBombard:
      data_gen.skillParams['dodge']['DodgeCounterDivertedBombard'],
    DashAttackDoAsIPlease:
      data_gen.skillParams['dodge']['DashAttackDoAsIPlease'],
  },
  special: {
    SpecialAttackSugarcoatedBullet:
      data_gen.skillParams['special']['SpecialAttackSugarcoatedBullet'],
    EXSpecialAttackStuffedSugarcoatedBullet:
      data_gen.skillParams['special'][
        'EXSpecialAttackStuffedSugarcoatedBullet'
      ],
  },
  chain: {
    ChainAttackEtherShellacking:
      data_gen.skillParams['chain']['ChainAttackEtherShellacking'],
    UltimateEtherGrenade: data_gen.skillParams['chain']['UltimateEtherGrenade'],
  },
  assist: {
    QuickAssistEmergencyBombard:
      data_gen.skillParams['assist']['QuickAssistEmergencyBombard'],
    DefensiveAssistTheHareStrikesBack:
      data_gen.skillParams['assist']['DefensiveAssistTheHareStrikesBack'],
    AssistFollowUpWindowOfOpportunity:
      data_gen.skillParams['assist']['AssistFollowUpWindowOfOpportunity'],
  },
} as const

export default dm
