import { type CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allBoolConditionals,
  allListConditionals,
  allNumConditionals,
  enemyDebuff,
  own,
  register,
  registerBuff,
} from '../../util'
import {
  dmgDazeAndAnomOverride,
  entriesForChar,
  registerAllDmgDazeAndAnom,
} from '../util'

const key: CharacterKey = 'YeShunguang'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]

const { char } = own

const { boolConditional } = allBoolConditionals(key)
const { listConditional } = allListConditionals(key, ['val1', 'val2'])
const { numConditional } = allNumConditionals(key, true, 0, 2)

const enlightenedUnstunMult = enemyDebuff.common.stun_.add(100)

const sheet = register(
  key,
  // Handles base stats, core stats and Mindscapes 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(
    key,
    dm,
    dmgDazeAndAnomOverride(
      dm,
      'chain',
      'UltimateChasingStorms',
      0,
      { attribute: 'physical', damageType1: 'ult', skillType1: 'chainSkill' },
      'atk',
      undefined,
      enlightenedUnstunMult
    )
  ),

  // Buffs
  registerBuff(
    'enlightened_unstun_mult',
    enlightenedUnstunMult,
    undefined,
    undefined,
    false
  )
)
export default sheet
