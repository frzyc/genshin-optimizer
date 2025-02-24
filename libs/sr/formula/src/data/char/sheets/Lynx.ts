import { cmpGE } from '@genshin-optimizer/pando/engine'
import { type CharacterKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
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
import { dmg, entriesForChar, getBaseTag } from '../util'

const key: CharacterKey = 'Lynx'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

// TODO: Add conditionals
const { boolConditional } = allBoolConditionals(key)
const { listConditional } = allListConditionals(key, ['val1', 'val2'])
const { numConditional } = allNumConditionals(key, true, 0, 2)

const sheet = register(
  key,
  // Handles base stats, StatBoosts and Eidolon 3 + 5
  entriesForChar(data_gen),

  // TODO: Add formulas/buffs
  // Formulas
  ...dmg('basicDmg', baseTag, 'atk', dm.basic.dmg, 'basic'),

  // Buffs
  registerBuff(
    'e6_dmg_',
    ownBuff.premod.common_dmg_.add(
      cmpGE(char.eidolon, 6, boolConditional.ifOn(1))
    )
  ),
  registerBuff(
    'team_dmg_',
    teamBuff.premod.common_dmg_.add(listConditional.map({ val1: 1, val2: 2 }))
  ),
  registerBuff('enemy_defRed_', enemyDebuff.common.defRed_.add(numConditional))
)
export default sheet
