import { cmpEq, cmpGE, cmpNE, subscript } from '@genshin-optimizer/pando/engine'
import { type CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allBoolConditionals,
  enemy,
  own,
  ownBuff,
  register,
  registerBuff,
} from '../../util'
import {
  dmgDazeAndAnomOverride,
  entriesForChar,
  getBaseTag,
  registerAllDmgDazeAndAnom,
} from '../util'

const key: CharacterKey = 'Anby'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

const { after3rdBasic, m1After4thBasicHit, m6ChargeConsumed } =
  allBoolConditionals(key)

const after3rdBasic_dazeInc_ = ownBuff.combat.dazeInc_.add(
  after3rdBasic.ifOn(subscript(own.char.core, dm.core.basic_ex_3rdHit_daze_))
)

const m2_stunned_dmg_ = ownBuff.combat.common_dmg_.add(
  cmpEq(enemy.common.isStunned, 1, dm.m2.dmg_)
)
const m2_stunned_dazeInc_ = ownBuff.combat.dazeInc_.add(
  cmpNE(enemy.common.isStunned, 1, dm.m2.daze_)
)

const sheet = register(
  key,
  // Handles base stats, core stats and Mindscapes 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(
    data_gen.attribute,
    dm,
    // Basic 1-3 is physical
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackTurboVolt',
      0,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackTurboVolt',
      1,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackTurboVolt',
      2,
      { damageType1: 'basic' },
      'atk'
    ),
    // Per-hit buffs
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackThunderbolt',
      0,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      after3rdBasic_dazeInc_,
      m2_stunned_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'special',
      'EXSpecialAttackLightningBolt',
      0,
      { ...baseTag, damageType1: 'exSpecial' },
      'atk',
      undefined,
      m2_stunned_dazeInc_
    )
  ),

  // Buffs
  registerBuff(
    'core_basic_ex_after3rd_daze_',
    after3rdBasic_dazeInc_,
    undefined,
    undefined,
    false
  ),
  registerBuff(
    'm1_after4thHit_energyRegen_',
    ownBuff.combat.enerRegen_.add(
      cmpGE(char.mindscape, 1, m1After4thBasicHit.ifOn(dm.m1.ener_))
    )
  ),
  registerBuff(
    'm2_stunned_basic_dmg_',
    m2_stunned_dmg_,
    undefined,
    undefined,
    false
  ),
  registerBuff(
    'm2_unstunned_ex_daze_',
    m2_stunned_dazeInc_,
    undefined,
    undefined,
    false
  ),
  registerBuff(
    'm6_charge_basic_dmg_',
    ownBuff.combat.dmg_.addWithDmgType(
      'basic',
      cmpGE(char.mindscape, 6, m6ChargeConsumed.ifOn(dm.m6.dmg_))
    )
  ),
  registerBuff(
    'm6_charge_exSpecial_dmg_',
    ownBuff.combat.dmg_.addWithDmgType(
      'exSpecial',
      cmpGE(char.mindscape, 6, m6ChargeConsumed.ifOn(dm.m6.dmg_))
    )
  )
)
export default sheet
