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
  core: {
    def_red_: data_gen.coreParams[0],
    duration: data_gen.coreParams[1],
  },
  ability: {
    ether_dmg_: data_gen.abilityParams[0],
    duration: data_gen.abilityParams[1],
  },
  m1: {
    ex_special_dmg_anomBuildup: data_gen.mindscapeParams[0][0],
    charge_duration: data_gen.mindscapeParams[0][1],
    field_extension: data_gen.mindscapeParams[0][2],
  },
  m2: {
    energy: data_gen.mindscapeParams[1][0],
    cooldown: data_gen.mindscapeParams[1][1],
  },
  m6: {
    crit_: data_gen.mindscapeParams[5][0],
    stacks: data_gen.mindscapeParams[5][1],
    duration: data_gen.mindscapeParams[5][2],
  },
} as const

export default dm
