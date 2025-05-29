import { cmpGE } from '@genshin-optimizer/pando/engine'
import { type CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allBoolConditionals,
  allListConditionals,
  allNumConditionals,
  enemyDebuff,
  own,
  ownBuff,
  register,
  registerBuff,
  teamBuff,
} from '../../util'
import { entriesForChar, registerAllDmgDazeAndAnom } from '../util'

const key: CharacterKey = 'Harumasa'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]

const { char } = own

// TODO: Add conditionals
const { boolConditional } = allBoolConditionals(key)
const { listConditional } = allListConditionals(key, ['val1', 'val2'])
const { numConditional } = allNumConditionals(key, true, 0, 2)

const sheet = register(
  key,
  // Handles base stats, StatBoosts and Eidolon 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(key, dm),

  // Buffs
  registerBuff(
    'm6_dmg_',
    ownBuff.combat.common_dmg_.add(
      cmpGE(char.mindscape, 6, boolConditional.ifOn(1))
    )
  ),
  registerBuff(
    'team_dmg_',
    teamBuff.combat.common_dmg_.add(listConditional.map({ val1: 1, val2: 2 }))
  ),
  registerBuff('enemy_defRed_', enemyDebuff.common.defRed_.add(numConditional))
)
export default sheet
