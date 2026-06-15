import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Sunna'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackMischiefMeteorHammer:
      data_gen.skillParams['basic']['BasicAttackMischiefMeteorHammer'],
    BasicAttackNaughtyCatSpotted:
      data_gen.skillParams['basic']['BasicAttackNaughtyCatSpotted'],
  },
  dodge: {
    DodgeCantHitMe: data_gen.skillParams['dodge']['DodgeCantHitMe'],
    DashAttackSkywardHammer:
      data_gen.skillParams['dodge']['DashAttackSkywardHammer'],
    DodgeCounterDelusionStrikeout:
      data_gen.skillParams['dodge']['DodgeCounterDelusionStrikeout'],
  },
  special: {
    SpecialAttackStarShooter:
      data_gen.skillParams['special']['SpecialAttackStarShooter'],
    EXSpecialAttackBubblegumBarrage:
      data_gen.skillParams['special']['EXSpecialAttackBubblegumBarrage'],
    EXSpecialAttackSpecialPhotographyTechnique:
      data_gen.skillParams['special'][
        'EXSpecialAttackSpecialPhotographyTechnique'
      ],
  },
  chain: {
    ChainAttackDontMessWithTheCat:
      data_gen.skillParams['chain']['ChainAttackDontMessWithTheCat'],
    UltimateSmashItAll: data_gen.skillParams['chain']['UltimateSmashItAll'],
  },
  assist: {
    QuickAssistSonicBeatdown:
      data_gen.skillParams['assist']['QuickAssistSonicBeatdown'],
    DefensiveAssistStageFright:
      data_gen.skillParams['assist']['DefensiveAssistStageFright'],
    AssistFollowUpJumpTraining:
      data_gen.skillParams['assist']['AssistFollowUpJumpTraining'],
  },
  core: {
    atkScaling: data_gen.coreParams[0][0],
    maxAtk: data_gen.coreParams[1],
    maxInitialAtk: data_gen.coreParams[2][0],
    duration: data_gen.coreParams[3][0],
    dmgAttack: data_gen.coreParams[4],
    dmgAnomaly: data_gen.coreParams[5],
    crit_dmg_: data_gen.coreParams[6],
  },
  ability: {
    stun_: data_gen.abilityParams[0],
    duration: data_gen.abilityParams[1],
    energy: data_gen.abilityParams[2],
    cooldown: data_gen.abilityParams[3],
  },
  m1: {
    energy: data_gen.mindscapeParams[0][0],
    cooldown: data_gen.mindscapeParams[0][1],
    defRed_: data_gen.mindscapeParams[0][2],
    duration: data_gen.mindscapeParams[0][3],
    maxStacks: data_gen.mindscapeParams[0][4],
  },
  m2: {
    atk_: data_gen.mindscapeParams[1][0],
    clawSharpener: data_gen.mindscapeParams[1][1],
    cooldown: data_gen.mindscapeParams[1][2],
    dmgAttackIncrease: data_gen.mindscapeParams[1][3],
    dmgAnomalyIncrease: data_gen.mindscapeParams[1][4],
  },
  m4: {
    dmg_: data_gen.mindscapeParams[3][0],
    duration: data_gen.mindscapeParams[3][1],
  },
  m6: {
    duration: data_gen.mindscapeParams[5][0],
    crit_dmg_: data_gen.mindscapeParams[5][1],
    maxCrit_dmg_: data_gen.mindscapeParams[5][2],
    dmgRed_: data_gen.mindscapeParams[5][3],
    dmg_: data_gen.mindscapeParams[5][4],
  },
} as const

export default dm
