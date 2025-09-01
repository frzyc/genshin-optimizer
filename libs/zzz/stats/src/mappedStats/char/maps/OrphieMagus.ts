import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'OrphieMagus'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackHighPressureFlamethrower:
      data_gen.skillParams['basic']['BasicAttackHighPressureFlamethrower'],
  },
  dodge: {
    DodgeFlickeringFlames:
      data_gen.skillParams['dodge']['DodgeFlickeringFlames'],
    DashAttackRushCommand:
      data_gen.skillParams['dodge']['DashAttackRushCommand'],
    DodgeCounterCounterStrikeOpportunity:
      data_gen.skillParams['dodge']['DodgeCounterCounterStrikeOpportunity'],
  },
  special: {
    SpecialAttackBlazingChamber:
      data_gen.skillParams['special']['SpecialAttackBlazingChamber'],
    SpecialAttackCorrosiveFlash:
      data_gen.skillParams['special']['SpecialAttackCorrosiveFlash'],
    EXSpecialAttackWatchYourStep:
      data_gen.skillParams['special']['EXSpecialAttackWatchYourStep'],
    EXSpecialAttackCrimsonVortex:
      data_gen.skillParams['special']['EXSpecialAttackCrimsonVortex'],
    EXSpecialAttackHeatCharge:
      data_gen.skillParams['special']['EXSpecialAttackHeatCharge'],
    EXSpecialAttackFieryEruption:
      data_gen.skillParams['special']['EXSpecialAttackFieryEruption'],
  },
  chain: {
    ChainAttackOverheatedBarrel:
      data_gen.skillParams['chain']['ChainAttackOverheatedBarrel'],
    UltimateDanceWithFire:
      data_gen.skillParams['chain']['UltimateDanceWithFire'],
  },
  assist: {
    QuickAssistSearingSlash:
      data_gen.skillParams['assist']['QuickAssistSearingSlash'],
    DefensiveAssistBlazingGunblade:
      data_gen.skillParams['assist']['DefensiveAssistBlazingGunblade'],
    AssistFollowUpBoilingPierce:
      data_gen.skillParams['assist']['AssistFollowUpBoilingPierce'],
  },
} as const

export default dm
