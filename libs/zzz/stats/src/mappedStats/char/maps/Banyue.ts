import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { getCharStat } from '../../../char'

const key: CharacterKey = 'Banyue'
const data_gen = getCharStat(key)

const dm = {
  basic: {
    BasicAttackToweringPeaks:
      data_gen.skillParams['basic']['BasicAttackToweringPeaks'],
    BasicAttackMajesticSummit:
      data_gen.skillParams['basic']['BasicAttackMajesticSummit'],
    BasicAttackImmolate: data_gen.skillParams['basic']['BasicAttackImmolate'],
    BasicAttackInflame: data_gen.skillParams['basic']['BasicAttackInflame'],
    BasicAttackTopplingMountain:
      data_gen.skillParams['basic']['BasicAttackTopplingMountain'],
    BasicAttackCrushingPeaks:
      data_gen.skillParams['basic']['BasicAttackCrushingPeaks'],
  },
  dodge: {
    DodgeImmovableMountain:
      data_gen.skillParams['dodge']['DodgeImmovableMountain'],
    DodgeOvercomePeaks: data_gen.skillParams['dodge']['DodgeOvercomePeaks'],
    DodgeBattleCry: data_gen.skillParams['dodge']['DodgeBattleCry'],
    DashAttackScatteringSands:
      data_gen.skillParams['dodge']['DashAttackScatteringSands'],
    DodgeCounterStoneburst:
      data_gen.skillParams['dodge']['DodgeCounterStoneburst'],
  },
  special: {
    EXSpecialAttackMountainTremor:
      data_gen.skillParams['special']['EXSpecialAttackMountainTremor'],
    EXSpecialAttackEarthShaker:
      data_gen.skillParams['special']['EXSpecialAttackEarthShaker'],
    EXSpecialAttackLionsRoar:
      data_gen.skillParams['special']['EXSpecialAttackLionsRoar'],
    EXSpecialAttackOnesPath:
      data_gen.skillParams['special']['EXSpecialAttackOnesPath'],
    EXSpecialAttackLionsRoarWrath:
      data_gen.skillParams['special']['EXSpecialAttackLionsRoarWrath'],
    EXSpecialAttackMountainTremorWrath:
      data_gen.skillParams['special']['EXSpecialAttackMountainTremorWrath'],
    Cancel: data_gen.skillParams['special']['Cancel'],
  },
  chain: {
    ChainAttackBlazingWrath:
      data_gen.skillParams['chain']['ChainAttackBlazingWrath'],
    UltimateTheWorldTrembles:
      data_gen.skillParams['chain']['UltimateTheWorldTrembles'],
  },
  assist: {
    QuickAssistBatholith:
      data_gen.skillParams['assist']['QuickAssistBatholith'],
    DefensiveAssistIronBastion:
      data_gen.skillParams['assist']['DefensiveAssistIronBastion'],
    AssistFollowUpLoftyAscent:
      data_gen.skillParams['assist']['AssistFollowUpLoftyAscent'],
    AssistFollowUpPierceHeavens:
      data_gen.skillParams['assist']['AssistFollowUpPierceHeavens'],
  },
  core: {
    maxHpStep: data_gen.coreParams[0][0],
    sheerForcePerStep: data_gen.coreParams[1][0],
    adrenalineRecovered: data_gen.coreParams[2][0],
    investigationCooldown: data_gen.coreParams[3][0],
    wrathfulFiresAdrenaline: data_gen.coreParams[4][0],
    wrathfulFiresDefensiveAssist: data_gen.coreParams[5][0],
    wrathfulFiresDodge: data_gen.coreParams[6][0],
    wrathfulFiresPerfectBlock: data_gen.coreParams[7][0],
    perfectBlockCooldown: data_gen.coreParams[8][0],
    wrathfulFiresPerfectDodge: data_gen.coreParams[9][0],
    perfectDodgeCooldown: data_gen.coreParams[10][0],
    maxWrathfulFires: data_gen.coreParams[11][0],
    wrathfulFiresThreshold: data_gen.coreParams[12][0],
    mountainsMightGained: data_gen.coreParams[13][0],
    mountainsMightConsumed: data_gen.coreParams[14][0],
    adrenalineRestored: data_gen.coreParams[15][0],
    sheerForce: data_gen.coreParams[16],
    fire_dmg_: data_gen.coreParams[17],
    crit_dmg_: data_gen.coreParams[18],
    duration: data_gen.coreParams[19][0],
  },
  ability: {
    fire_dmg_: data_gen.abilityParams[0],
    maxStacks: data_gen.abilityParams[1],
    duration: data_gen.abilityParams[2],
  },
  m1: {
    fire_resRed_: data_gen.mindscapeParams[0][0],
    duration: data_gen.mindscapeParams[0][1],
    sheer_dmg_: data_gen.mindscapeParams[0][2],
    stunExtension: data_gen.mindscapeParams[0][3],
  },
  m2: {
    crit_dmg_: data_gen.mindscapeParams[1][0],
    fire_dmg_: data_gen.mindscapeParams[1][1],
    adrenalineRestored: data_gen.mindscapeParams[1][2],
  },
  m4: {
    dmg_: data_gen.mindscapeParams[3][0],
  },
  m6: {
    fire_dmg_: data_gen.mindscapeParams[5][0],
    duration: data_gen.mindscapeParams[5][1],
    dmg: data_gen.mindscapeParams[5][2],
  },
} as const

export default dm
