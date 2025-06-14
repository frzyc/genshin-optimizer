import type { NumNode } from '@genshin-optimizer/pando/engine'
import {
  cmpEq,
  cmpGE,
  max,
  min,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/pando/engine'
import { type CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allBoolConditionals,
  allNumConditionals,
  customShield,
  enemyDebuff,
  own,
  ownBuff,
  percent,
  register,
  registerBuff,
  team,
} from '../../util'
import {
  dmgDazeAndAnomOverride,
  entriesForChar,
  getBaseTag,
  registerAllDmgDazeAndAnom,
} from '../util'

const key: CharacterKey = 'Qingyi'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

const { moonlit_blossoms_hit } = allBoolConditionals(key)
const { flash_connect_consumed } = allNumConditionals(key, true, 0, 25)
const { subjugation } = allNumConditionals(key, true, 0, dm.core.max_stacks)

const flash_connect_dmg_ = ownBuff.combat.common_dmg_.add(
  prod(flash_connect_consumed, percent(0.01))
)
const flash_connect_dazeInc_ = ownBuff.combat.dazeInc_.add(
  prod(flash_connect_consumed, percent(0.005))
)
const chain_dmg_ = ownBuff.combat.common_dmg_.add(
  prod(subjugation, percent(0.03))
)
const ability_check = (node: NumNode) =>
  cmpGE(
    sum(
      team.common.count.withSpecialty('attack'),
      team.common.count.withFaction('CriminalInvestigationSpecialResponseTeam')
    ),
    1,
    node
  )
const m6_crit_dmg_ = ownBuff.combat.crit_dmg_.add(
  cmpGE(char.mindscape, 6, percent(dm.m6.crit_dmg_))
)

const sheet = register(
  key,
  // Handles base stats, core stats and Mindscapes 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(
    key,
    dm,
    // Basic hits 1-3 are physical
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackPenultimate',
      0,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackPenultimate',
      1,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackPenultimate',
      2,
      { damageType1: 'basic' },
      'atk'
    ),
    // Dash Breach is physical
    dmgDazeAndAnomOverride(
      dm,
      'dodge',
      'DashAttackBreach',
      0,
      { damageType1: 'dash' },
      'atk'
    ),
    // Per-hit buffs
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackEnchantedMoonlitBlossoms',
      0,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      flash_connect_dmg_,
      flash_connect_dazeInc_,
      m6_crit_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackEnchantedMoonlitBlossoms',
      1,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      flash_connect_dmg_,
      flash_connect_dazeInc_,
      m6_crit_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'chain',
      'ChainAttackTranquilSerenade',
      0,
      { ...baseTag, damageType1: 'chain' },
      'atk',
      undefined,
      chain_dmg_
    )
  ),

  ...customShield(
    'm4_shield',
    cmpGE(char.mindscape, 4, prod(own.final.hp, percent(dm.m4.shield)))
  ),

  // Buffs
  registerBuff(
    'flash_connect_dmg_',
    flash_connect_dmg_,
    undefined,
    undefined,
    false
  ),
  registerBuff(
    'flash_connect_dazeInc_',
    flash_connect_dazeInc_,
    undefined,
    undefined,
    false
  ),
  registerBuff('chain_dmg_', chain_dmg_, undefined, undefined, false),
  registerBuff(
    'core_stun_',
    enemyDebuff.common.stun_.add(
      prod(
        subjugation,
        // For some reason dm did not convert this to percent
        prod(percent(subscript(char.core, dm.core.stun_)), percent(0.01)),
        cmpGE(char.mindscape, 2, percent(dm.m2.stun_mult_), percent(1))
      )
    )
  ),
  registerBuff(
    'ability_basic_dazeInc_',
    ownBuff.combat.dazeInc_.addWithDmgType(
      'basic',
      ability_check(percent(dm.ability.basic_daze_))
    )
  ),
  registerBuff(
    'ability_atk',
    ownBuff.combat.atk.add(
      ability_check(
        max(
          0,
          min(
            dm.ability.max_atk,
            prod(
              sum(own.final.impact, -dm.ability.impact_threshold),
              dm.ability.atk
            )
          )
        )
      )
    )
  ),
  registerBuff(
    'm1_defRed_',
    enemyDebuff.common.defRed_.add(
      cmpGE(char.mindscape, 1, cmpEq(flash_connect_consumed, 25, dm.m1.defRed_))
    )
  ),
  registerBuff(
    'm1_crit_',
    ownBuff.combat.crit_.add(
      cmpGE(char.mindscape, 1, cmpEq(flash_connect_consumed, 25, dm.m1.crit_))
    )
  ),
  registerBuff(
    'm2_dazeInc_',
    ownBuff.combat.dazeInc_.add(
      cmpGE(
        char.mindscape,
        2,
        cmpGE(subjugation, dm.core.max_stacks, dm.m2.dazeInc_)
      )
    )
  ),
  registerBuff(
    'm6_resRed_',
    enemyDebuff.common.resRed_.add(
      cmpGE(char.mindscape, 6, moonlit_blossoms_hit.ifOn(dm.m6.resRed_))
    )
  ),
  registerBuff('m6_crit_dmg_', m6_crit_dmg_, undefined, undefined, false)
)
export default sheet
