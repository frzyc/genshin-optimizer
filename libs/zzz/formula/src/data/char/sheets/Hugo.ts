import type { NumNode } from '@genshin-optimizer/pando/engine'
import {
  cmpEq,
  cmpGE,
  cmpGT,
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
  enemy,
  own,
  ownBuff,
  percent,
  register,
  registerBuff,
  team,
} from '../../util'
import {
  dmgDazeAndAnomMerge,
  dmgDazeAndAnomOverride,
  entriesForChar,
  getBaseTag,
  registerAllDmgDazeAndAnom,
} from '../util'

const key: CharacterKey = 'Hugo'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

const { dark_abyss_reverb, normal_enemy, charged_shot_hit } =
  allBoolConditionals(key)
const { stun_left } = allNumConditionals(key, true, 0, dm.core.stun_window3)

const ability_check = (node: NumNode | number) =>
  cmpGE(
    sum(team.common.count.withSpecialty('stun'), team.common.count.ice),
    2,
    node
  )

const sheet = register(
  key,
  // Handles base stats, core stats and Mindscapes 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(
    key,
    dm,
    // TODO: maybe not merge the hits
    {
      special: {
        EXSpecialAttackSoulHunterPunishment: {
          '0': [
            ...dmgDazeAndAnomMerge(
              [
                dm.special.EXSpecialAttackSoulHunterPunishment[0],
                dm.special.EXSpecialAttackSoulHunterPunishment[1],
              ],
              'EXSpecialAttackSoulHunterPunishment_0',
              { ...baseTag, damageType1: 'exSpecial' },
              'atk',
              'special'
            ),
          ],
          '1': [],
        },
      },
    },
    // Basic hits 1-2 are physical
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackDarkAbyssQuartet',
      0,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackDarkAbyssQuartet',
      1,
      { damageType1: 'basic' },
      'atk'
    ),
    // Dash Attack is physical
    dmgDazeAndAnomOverride(
      dm,
      'dodge',
      'DashAttackPhantasmShatter',
      0,
      { damageType1: 'dash' },
      'atk'
    )
  ),

  // Buffs
  registerBuff(
    'core_crit_',
    ownBuff.combat.crit_.add(dark_abyss_reverb.ifOn(dm.core.crit_))
  ),
  registerBuff(
    'core_crit_dmg_',
    ownBuff.combat.crit_dmg_.add(dark_abyss_reverb.ifOn(dm.core.crit_dmg_))
  ),
  registerBuff(
    'core_atk',
    ownBuff.combat.atk.add(
      cmpGE(
        team.common.count.withSpecialty('stun'),
        2,
        subscript(char.core, dm.core.atk2),
        cmpGE(
          team.common.count.withSpecialty('stun'),
          1,
          subscript(char.core, dm.core.atk1)
        )
      )
    )
  ),
  registerBuff(
    'core_exSpecial_mv_mult_',
    ownBuff.dmg.mv_mult_.addWithDmgType(
      'exSpecial',
      cmpEq(
        enemy.common.isStunned,
        1,
        sum(
          percent(subscript(char.core, dm.core.mv_mult_1)),
          prod(
            min(stun_left, dm.core.stun_window1),
            percent(subscript(char.core, dm.core.mv_mult_2))
          ),
          cmpGT(
            stun_left,
            dm.core.stun_window2,
            prod(
              sum(min(stun_left, dm.core.stun_window3), -dm.core.stun_window2),
              percent(subscript(char.core, dm.core.mv_mult_3))
            )
          )
        ),
        percent(1)
      )
    )
  ),
  registerBuff(
    'core_ult_mv_mult_',
    ownBuff.dmg.mv_mult_.addWithDmgType(
      'ult',
      cmpEq(
        enemy.common.isStunned,
        1,
        sum(
          percent(subscript(char.core, dm.core.mv_mult_1)),
          prod(
            min(stun_left, dm.core.stun_window1),
            percent(subscript(char.core, dm.core.mv_mult_2))
          ),
          cmpGT(
            stun_left,
            dm.core.stun_window2,
            prod(
              sum(min(stun_left, dm.core.stun_window3), -dm.core.stun_window2),
              percent(subscript(char.core, dm.core.mv_mult_3))
            )
          )
        ),
        percent(1)
      )
    )
  ),
  registerBuff(
    'core_exSpecial_dazeInc_',
    ownBuff.combat.dazeInc_.addWithDmgType(
      'exSpecial',
      cmpEq(enemy.common.isStunned, 0, dm.core.dazeInc_)
    )
  ),
  registerBuff(
    'ability_chain_dmg_',
    ownBuff.combat.dmg_.addWithDmgType(
      'chain',
      ability_check(
        sum(
          normal_enemy.ifOn(percent(dm.ability.chain_dmg_normal_enemies)),
          percent(dm.ability.chain_dmg_)
        )
      )
    )
  ),
  registerBuff(
    'ability_exSpecial_dmg_',
    ownBuff.combat.dmg_.addWithDmgType(
      'exSpecial',
      ability_check(cmpEq(enemy.common.isStunned, 1, dm.ability.totalize_dmg_))
    )
  ),
  registerBuff(
    'ability_ult_dmg_',
    ownBuff.combat.dmg_.addWithDmgType(
      'ult',
      ability_check(cmpEq(enemy.common.isStunned, 1, dm.ability.totalize_dmg_))
    )
  ),
  registerBuff(
    'm1_exSpecial_crit_',
    ownBuff.combat.crit_.addWithDmgType(
      'exSpecial',
      cmpGE(
        char.mindscape,
        1,
        cmpEq(enemy.common.isStunned, 1, dark_abyss_reverb.ifOn(dm.m1.crit_))
      )
    )
  ),
  registerBuff(
    'm1_exSpecial_crit_dmg_',
    ownBuff.combat.crit_dmg_.addWithDmgType(
      'exSpecial',
      cmpGE(
        char.mindscape,
        1,
        cmpEq(
          enemy.common.isStunned,
          1,
          dark_abyss_reverb.ifOn(dm.m1.crit_dmg_)
        )
      )
    )
  ),
  registerBuff(
    'm1_ult_crit_',
    ownBuff.combat.crit_.addWithDmgType(
      'ult',
      cmpGE(
        char.mindscape,
        1,
        cmpEq(enemy.common.isStunned, 1, dark_abyss_reverb.ifOn(dm.m1.crit_))
      )
    )
  ),
  registerBuff(
    'm1_ult_crit_dmg_',
    ownBuff.combat.crit_dmg_.addWithDmgType(
      'ult',
      cmpGE(
        char.mindscape,
        1,
        cmpEq(
          enemy.common.isStunned,
          1,
          dark_abyss_reverb.ifOn(dm.m1.crit_dmg_)
        )
      )
    )
  ),
  registerBuff(
    'm2_exSpecial_defIgn_',
    ownBuff.combat.defIgn_.addWithDmgType(
      'exSpecial',
      cmpGE(char.mindscape, 2, cmpEq(enemy.common.isStunned, 1, dm.m2.defIgn_))
    )
  ),
  registerBuff(
    'm2_ult_defIgn_',
    ownBuff.combat.defIgn_.addWithDmgType(
      'ult',
      cmpGE(char.mindscape, 2, cmpEq(enemy.common.isStunned, 1, dm.m2.defIgn_))
    )
  ),
  registerBuff(
    'm4_ice_resIgn_',
    ownBuff.combat.resIgn_.ice.add(
      cmpGE(char.mindscape, 4, charged_shot_hit.ifOn(dm.m4.ice_resIgn_))
    )
  ),
  registerBuff(
    'm6_exSpecial_dmg_',
    ownBuff.combat.dmg_.addWithDmgType(
      'exSpecial',
      cmpGE(
        char.mindscape,
        6,
        cmpEq(enemy.common.isStunned, 1, dm.m6.totalize_dmg_)
      )
    )
  ),
  registerBuff(
    'm6_ult_dmg_',
    ownBuff.combat.dmg_.addWithDmgType(
      'ult',
      cmpGE(
        char.mindscape,
        6,
        cmpEq(enemy.common.isStunned, 1, dm.m6.totalize_dmg_)
      )
    )
  ),
  registerBuff(
    'm6_exSpecial_mv_mult_',
    ownBuff.dmg.mv_mult_.addWithDmgType(
      'exSpecial',
      cmpGE(
        char.mindscape,
        6,
        cmpEq(enemy.common.isStunned, 0, dm.m6.mv_mult_, percent(1)),
        percent(1)
      )
    )
  )
)
export default sheet
