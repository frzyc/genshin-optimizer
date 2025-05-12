import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Soldier0Anby'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackPenetratingShock:
      data_gen.skillParams['basic']['BasicAttackPenetratingShock'],
  },
  dodge: {
    DodgeStrobe: data_gen.skillParams['dodge']['DodgeStrobe'],
    DashAttackTorrent: data_gen.skillParams['dodge']['DashAttackTorrent'],
    DodgeCounterGroundFlashCounter:
      data_gen.skillParams['dodge']['DodgeCounterGroundFlashCounter'],
  },
  special: {
    SpecialAttackCelestialThunder:
      data_gen.skillParams['special']['SpecialAttackCelestialThunder'],
    SpecialAttackAzureFlash:
      data_gen.skillParams['special']['SpecialAttackAzureFlash'],
    SpecialAttackThunderSmite:
      data_gen.skillParams['special']['SpecialAttackThunderSmite'],
    EXSpecialAttackSunderingBolt:
      data_gen.skillParams['special']['EXSpecialAttackSunderingBolt'],
  },
  chain: {
    ChainAttackLeapingThunderstrike:
      data_gen.skillParams['chain']['ChainAttackLeapingThunderstrike'],
    UltimateVoidstrike: data_gen.skillParams['chain']['UltimateVoidstrike'],
  },
  assist: {
    QuickAssistCloudFlash:
      data_gen.skillParams['assist']['QuickAssistCloudFlash'],
    DefensiveAssistCounterSurge:
      data_gen.skillParams['assist']['DefensiveAssistCounterSurge'],
    AssistFollowUpConductingBlow:
      data_gen.skillParams['assist']['AssistFollowUpConductingBlow'],
  },
} as const

export default dm
