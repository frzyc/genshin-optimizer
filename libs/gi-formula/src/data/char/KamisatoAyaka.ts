import type { CharacterKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { cmpGE } from '@genshin-optimizer/pando'
import {
  allBoolConditionals,
  allListConditionals,
  allNumConditionals,
  customDmg,
  customHeal,
  customShield,
  self,
  selfBuff,
  team,
  teamBuff,
  enemy,
  enemyDebuff,
  allStacks,
  register,
} from '../util'
import {
  dataGenToCharInfo,
  dmg,
  entriesForChar,
  fixedShield,
  shield,
} from './util'

const key: CharacterKey = 'KamisatoAyaka'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

// TODO: Fill data-mine values here
const dm = {
  normal: {},
  charged: {},
  plunging: {},
  skill: {},
  burst: {},
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { ascension, constellation },
} = self
// TODO: Conditionals
const { someBoolConditional } = allBoolConditionals(info.key)
const { someListConditional } = allListConditionals(info.key, [])
const { someNumConditional } = allNumConditionals(info.key, 'unique', false)
// TODO: Non-stack values
const { someStack } = allStacks(info.key)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  selfBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  selfBuff.char.skill.add(cmpGE(constellation, 5, 3))

  // TODO:
  // - Add self-buff formulas using `selfBuff.<buff target>.add(<buff value>)`
  // - Add teambuff formulas using `teamBuff.<buff target>.add(<buff value>)
  // - Add active buff formulas using `activeCharBuff.<buff target>.add(<buff value>)`
  // - Add enemy debuff using `enemyDebuff.<debugg target>.add(<debuff value>)`
  //
  // <buff value> uses `self.*`, `team.*`, `target.*` (target of team buff), and `enemy.*`

  // Formulas
  // TODO: Add dmg/heal/shield formulas using `dmg`, `customDmg`, `shield`, `customShield`, `fixedShield`, or `customHeal`
)
