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
} as const

export default dm
