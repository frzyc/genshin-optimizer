import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Yixuan'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackCirrusStrike:
      data_gen.skillParams['basic']['BasicAttackCirrusStrike'],
    BasicAttackInkVeilCloudCoalescence:
      data_gen.skillParams['basic']['BasicAttackInkVeilCloudCoalescence'],
    BasicAttackAuricArray:
      data_gen.skillParams['basic']['BasicAttackAuricArray'],
    BasicAttackQingmingEruption:
      data_gen.skillParams['basic']['BasicAttackQingmingEruption'],
  },
  dodge: {
    DodgeHiddenCloudTechnique:
      data_gen.skillParams['dodge']['DodgeHiddenCloudTechnique'],
    DashAttackSkybreaker: data_gen.skillParams['dodge']['DashAttackSkybreaker'],
    DodgeNimbusStep: data_gen.skillParams['dodge']['DodgeNimbusStep'],
    DodgeCounterBanishingBlow:
      data_gen.skillParams['dodge']['DodgeCounterBanishingBlow'],
  },
  special: {
    SpecialAttackShadowIgnition:
      data_gen.skillParams['special']['SpecialAttackShadowIgnition'],
    EXSpecialAttackInkManifestation:
      data_gen.skillParams['special']['EXSpecialAttackInkManifestation'],
    EXSpecialAttackCloudShaper:
      data_gen.skillParams['special']['EXSpecialAttackCloudShaper'],
    EXSpecialAttackAshenInkBecomesShadows:
      data_gen.skillParams['special']['EXSpecialAttackAshenInkBecomesShadows'],
  },
  chain: {
    ChainAttackAuricInkRush:
      data_gen.skillParams['chain']['ChainAttackAuricInkRush'],
    UltimateQingmingSkyshade:
      data_gen.skillParams['chain']['UltimateQingmingSkyshade'],
    UltimateEndlessTalismanSuppression:
      data_gen.skillParams['chain']['UltimateEndlessTalismanSuppression'],
  },
  assist: {
    QuickAssistCloudstreamShadow:
      data_gen.skillParams['assist']['QuickAssistCloudstreamShadow'],
    DefensiveAssistClearSkySurge:
      data_gen.skillParams['assist']['DefensiveAssistClearSkySurge'],
    AssistFollowUpCelestialCloudBlitz:
      data_gen.skillParams['assist']['AssistFollowUpCelestialCloudBlitz'],
  },
} as const

export default dm
