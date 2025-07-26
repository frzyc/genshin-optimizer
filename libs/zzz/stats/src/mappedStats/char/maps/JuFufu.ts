import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'JuFufu'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackTigerSevenFormsFlamingClaw:
      data_gen.skillParams['basic']['BasicAttackTigerSevenFormsFlamingClaw'],
    BasicAttackHuWei: data_gen.skillParams['basic']['BasicAttackHuWei'],
  },
  dodge: {
    DodgeTigerSevenFormsTigerwind:
      data_gen.skillParams['dodge']['DodgeTigerSevenFormsTigerwind'],
    DashAttackTigerSevenFormsTigerCharge:
      data_gen.skillParams['dodge']['DashAttackTigerSevenFormsTigerCharge'],
    DashAttackTigerSevenFormsMountainKingsGame:
      data_gen.skillParams['dodge'][
        'DashAttackTigerSevenFormsMountainKingsGame'
      ],
    DodgeCounterTigerSevenFormsReignitedMountain:
      data_gen.skillParams['dodge'][
        'DodgeCounterTigerSevenFormsReignitedMountain'
      ],
    DashAttackTigerSevenFormsMountainKingsGameMomentum:
      data_gen.skillParams['dodge'][
        'DashAttackTigerSevenFormsMountainKingsGameMomentum'
      ],
  },
  special: {
    SpecialAttackTigerSevenFormsMountainDescendingTiger:
      data_gen.skillParams['special'][
        'SpecialAttackTigerSevenFormsMountainDescendingTiger'
      ],
    EXSpecialAttackTigerSevenFormsAltMountainDescendingSavageTiger:
      data_gen.skillParams['special'][
        'EXSpecialAttackTigerSevenFormsAltMountainDescendingSavageTiger'
      ],
  },
  chain: {
    ChainAttackTigerCauldronCollapse:
      data_gen.skillParams['chain']['ChainAttackTigerCauldronCollapse'],
    ChainAttackSuppressingTigerCauldron:
      data_gen.skillParams['chain']['ChainAttackSuppressingTigerCauldron'],
    UltimateTigerSevenFormsRagingTigerExplosion:
      data_gen.skillParams['chain'][
        'UltimateTigerSevenFormsRagingTigerExplosion'
      ],
  },
  assist: {
    QuickAssistDecisiveStomp:
      data_gen.skillParams['assist']['QuickAssistDecisiveStomp'],
    DefensiveAssistSteadfastCrouchingTiger:
      data_gen.skillParams['assist']['DefensiveAssistSteadfastCrouchingTiger'],
    AssistFollowUpFeralBlazingMaw:
      data_gen.skillParams['assist']['AssistFollowUpFeralBlazingMaw'],
  },
  core: {
    might: data_gen.coreParams[0][0],
    crit_dmg_: data_gen.coreParams[1],
    atk_threshold: data_gen.coreParams[2][0],
    atk_step: data_gen.coreParams[3][0],
    additional_crit_dmg_: data_gen.coreParams[4][0],
    max_crit_dmg_: data_gen.coreParams[5][0],
    chain_dmg_: data_gen.coreParams[6],
    ult_dmg_: data_gen.coreParams[7],
    duration: data_gen.coreParams[8][0],
    impact: data_gen.coreParams[9],
  },
  ability: {
    max_decibels: data_gen.abilityParams[0],
    decibel_regen: data_gen.abilityParams[1],
  },
  m1: {
    crit_: data_gen.mindscapeParams[0][0],
    might_gained: data_gen.mindscapeParams[0][1],
    stun_: data_gen.mindscapeParams[0][2],
    duration: data_gen.mindscapeParams[0][3],
  },
  m2: {
    crit_dmg_: data_gen.mindscapeParams[1][0],
    momentum: data_gen.mindscapeParams[1][1],
  },
  m4: {
    crit_dmg_: data_gen.mindscapeParams[3][0],
  },
  m6: {
    chain_dmg_: data_gen.mindscapeParams[5][0],
    popcorn: data_gen.mindscapeParams[5][1],
    dmg: data_gen.mindscapeParams[5][2],
  },
} as const

export default dm
