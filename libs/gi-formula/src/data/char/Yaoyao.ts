import type { CharacterKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { cmpGE } from '@genshin-optimizer/pando'
import {
  activeCharBuff,
  allBoolConditionals,
  allListConditionals,
  allNumConditionals,
  self,
  selfBuff,
  team,
  teamBuff,
  enemyDebuff,
  allStacks,
  register,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar } from './util'

const key: CharacterKey = 'Yaoyao'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

// TODO: Fill data-mine values here
const _dm = {
  normal: {
    dmg1: skillParam_gen.auto[0],
  },
  charged: {},
  plunging: {},
  skill: {},
  burst: {},
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final: _final,
  char: { ascension: _ascension, constellation },
} = self
// TODO: Conditionals
const { _someBoolConditional } = allBoolConditionals(info.key)
const { _someListConditional } = allListConditionals(info.key, [])
const { _someNumConditional } = allNumConditionals(info.key, 'unique', false)
// TODO: Non-stack values
const { _someStack } = allStacks(info.key)

const _count = team.common.count

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // TODO: Double check these
  selfBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  selfBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  // TODO:
  // - Add self-buff formulas using `selfBuff.<buff target>.add(<buff value>)`
  selfBuff.premod.atk.add(1),
  // - Add teambuff formulas using `teamBuff.<buff target>.add(<buff value>)
  teamBuff.premod.atk.add(1),
  // - Add active buff formulas using `activeCharBuff.<buff target>.add(<buff value>)`
  activeCharBuff.premod.atk.add(1),
  // - Add enemy debuff using `enemyDebuff.<debuff target>.add(<debuff value>)`
  enemyDebuff.common.defRed_.add(1),
  //
  // <buff value> uses `self.*`, `team.*`, `target.*` (target of team buff), and `enemy.*`

  // Formulas
  // TODO: Add dmg/heal/shield formulas using `dmg`, `customDmg`, `shield`, `customShield`, `fixedShield`, or `customHeal`
  dmg('normal1', info, 'atk', _dm.normal.dmg1, 'normal')
)
