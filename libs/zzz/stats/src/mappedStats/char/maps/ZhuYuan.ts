import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'ZhuYuan'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackDontMove: data_gen.skillParams['basic']['BasicAttackDontMove'],
    BasicAttackPleaseDoNotResist:
      data_gen.skillParams['basic']['BasicAttackPleaseDoNotResist'],
  },
  dodge: {
    DodgeTacticalDetour: data_gen.skillParams['dodge']['DodgeTacticalDetour'],
    DashAttackFirepowerOffensive:
      data_gen.skillParams['dodge']['DashAttackFirepowerOffensive'],
    DashAttackOverwhelmingFirepower:
      data_gen.skillParams['dodge']['DashAttackOverwhelmingFirepower'],
    DodgeCounterFireBlast:
      data_gen.skillParams['dodge']['DodgeCounterFireBlast'],
  },
  special: {
    SpecialAttackBuckshotBlast:
      data_gen.skillParams['special']['SpecialAttackBuckshotBlast'],
    EXSpecialAttackFullBarrage:
      data_gen.skillParams['special']['EXSpecialAttackFullBarrage'],
  },
  chain: {
    ChainAttackEradicationMode:
      data_gen.skillParams['chain']['ChainAttackEradicationMode'],
    UltimateMaxEradicationMode:
      data_gen.skillParams['chain']['UltimateMaxEradicationMode'],
  },
  assist: {
    QuickAssistCoveringShot:
      data_gen.skillParams['assist']['QuickAssistCoveringShot'],
    EvasiveAssistGuardedBackup:
      data_gen.skillParams['assist']['EvasiveAssistGuardedBackup'],
    AssistFollowUpDefensiveCounter:
      data_gen.skillParams['assist']['AssistFollowUpDefensiveCounter'],
  },
  core: {
    dmg_: data_gen.coreParams[0],
    add_dmg_: data_gen.coreParams[1],
    shells: data_gen.coreParams[2],
  },
  ability: {
    crit_: data_gen.abilityParams[0],
    duration: data_gen.abilityParams[1],
  },
  m1: {
    reload_chain: data_gen.mindscapeParams[0][0],
    reload_ult: data_gen.mindscapeParams[0][1],
  },
  m2: {
    dmg_red_: data_gen.mindscapeParams[1][0],
    basic_dash_ether_dmg_: data_gen.mindscapeParams[1][1],
    stacks: data_gen.mindscapeParams[1][2],
    duration: data_gen.mindscapeParams[1][3],
  },
  m4: {
    basic_dash_ether_res_ign_: data_gen.mindscapeParams[3][0],
  },
  m6: {
    shots_consumed: data_gen.mindscapeParams[5][0],
    ex_special_ener_red_: data_gen.mindscapeParams[5][1],
    bullets: data_gen.mindscapeParams[5][2],
    dmg: data_gen.mindscapeParams[5][3],
  },
} as const

export default dm
