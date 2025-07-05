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
  core: {
    hpStep: data_gen.coreParams[0][0],
    sheerForce: data_gen.coreParams[1][0],
    adrenaline1: data_gen.coreParams[2][0],
    cooldown: data_gen.coreParams[3][0],
    investigation_cooldown: data_gen.coreParams[4][0],
    adrenaline2: data_gen.coreParams[5][0],
    technique_points: data_gen.coreParams[6][0],
    max_technique_points: data_gen.coreParams[7][0],
    dmg_: data_gen.coreParams[8],
  },
  ability: {
    adrenaline: data_gen.abilityParams[0],
    duration: data_gen.abilityParams[1],
    dmg: data_gen.abilityParams[2],
    additional_adrenaline: data_gen.abilityParams[3],
    dmg_: data_gen.abilityParams[4],
    crit_dmg_: data_gen.abilityParams[5],
    meditation_duration: data_gen.abilityParams[6],
  },
  m1: {
    crit_: data_gen.mindscapeParams[0][0],
    technique_points: data_gen.mindscapeParams[0][1],
    cooldown: data_gen.mindscapeParams[0][2],
    dmg: data_gen.mindscapeParams[0][3],
    adrenaline: data_gen.mindscapeParams[0][4],
    dmg_cooldown: data_gen.mindscapeParams[0][5],
  },
  m2: {
    ether_resIgn_: data_gen.mindscapeParams[1][0],
    stun_duration: data_gen.mindscapeParams[1][1],
    dmg: data_gen.mindscapeParams[1][2],
  },
  m4: {
    max_stacks: data_gen.mindscapeParams[3][0],
    dmg_: data_gen.mindscapeParams[3][1],
  },
  m6: {
    cooldown: data_gen.mindscapeParams[5][0],
    sheer_dmg_: data_gen.mindscapeParams[5][1],
  },
} as const

export default dm
