import { cmpGE, prod, subscript } from '@genshin-optimizer/pando/engine'
import { type CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  customDmg,
  enemyDebuff,
  own,
  ownBuff,
  percent,
  register,
  registerBuff,
} from '../../util'
import {
  dmgDazeAndAnomOverride,
  entriesForChar,
  getBaseTag,
  registerAllDmgDazeAndAnom,
} from '../util'

const key: CharacterKey = 'YeShunguang'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

const enlightenedUnstunMult = enemyDebuff.common.stun_.add(100)
const m2_exSpecial_defIgn_ = ownBuff.combat.defIgn_.addWithDmgType(
  'exSpecial',
  cmpGE(char.mindscape, 2, percent(dm.m2.defIgn_))
)
const m2_ult_defIgn_ = ownBuff.combat.defIgn_.addWithDmgType(
  'ult',
  cmpGE(char.mindscape, 2, percent(dm.m2.defIgn_))
)

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
      { ...baseTag, damageType1: 'ult', skillType1: 'chainSkill' },
      'atk',
      undefined,
      enlightenedUnstunMult
    ),
    dmgDazeAndAnomOverride(
      dm,
      'special',
      'EXSpecialAttackEnlightenedMindSoaringLight',
      0,
      { ...baseTag, damageType1: 'exSpecial', skillType1: 'specialSkill' },
      'atk',
      undefined,
      ...m2_exSpecial_defIgn_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'chain',
      'UltimateCleavingHeavens',
      0,
      { ...baseTag, damageType1: 'ult', skillType1: 'chainSkill' },
      'atk',
      undefined,
      ...m2_ult_defIgn_
    )
  ),

  customDmg(
    'm6_dmg',
    { ...baseTag, damageType1: 'elemental' },
    cmpGE(char.mindscape, 6, prod(own.final.atk, percent(dm.m6.dmg)))
  ),

  // Buffs
  registerBuff(
    'enlightened_unstun_mult',
    enlightenedUnstunMult,
    undefined,
    undefined,
    false
  ),
  registerBuff(
    'core_crit_',
    ownBuff.combat.crit_.add(percent(subscript(char.core, dm.core.crit_)))
  ),
  registerBuff(
    'core_common_dmg_',
    ownBuff.combat.common_dmg_.add(
      percent(subscript(char.core, dm.core.common_dmg_))
    )
  ),
  registerBuff(
    'm1_common_dmg_',
    ownBuff.combat.common_dmg_.add(
      cmpGE(char.mindscape, 1, percent(dm.m1.common_dmg_))
    )
  ),
  registerBuff(
    'm1_defIgn_',
    ownBuff.combat.defIgn_.add(cmpGE(char.mindscape, 1, percent(dm.m1.defIgn_)))
  ),
  registerBuff(
    'm2_exSpecial_defIgn_',
    m2_exSpecial_defIgn_,
    undefined,
    undefined,
    false
  ),
  registerBuff('m2_ult_defIgn_', m2_ult_defIgn_, undefined, undefined, false)
)
export default sheet
