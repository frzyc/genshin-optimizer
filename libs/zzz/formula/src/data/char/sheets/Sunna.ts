import {
  cmpEq,
  cmpGE,
  min,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/pando/engine'
import {
  allAttributeAnomalyKeys,
  type CharacterKey,
} from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allBoolConditionals,
  allNumConditionals,
  customDmg,
  customHeal,
  enemyDebuff,
  own,
  ownBuff,
  percent,
  register,
  registerBuff,
  target,
  team,
  teamBuff,
} from '../../util'
import { entriesForChar, getBaseTag, registerAllDmgDazeAndAnom } from '../util'

const key: CharacterKey = 'Sunna'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

const {
  etherVeil,
  angelicChordination,
  inAnyEtherVeil,
  ultUsed,
  focusedCreation,
} = allBoolConditionals(key)
const { catsGaze } = allNumConditionals(key, true, 0, dm.m1.maxStacks)

const core_crit_ = teamBuff.combat.crit_.add(percent(1))
const core_crit_dmg_ = teamBuff.combat.crit_dmg_.add(
  percent(subscript(char.core, dm.core.crit_dmg_))
)
const m6_common_dmg_ = teamBuff.combat.common_dmg_.add(
  cmpGE(char.mindscape, 6, focusedCreation.ifOn(percent(dm.m6.dmg_)))
)

const sheet = register(
  key,
  // Handles base stats, core stats and Mindscapes 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(key, dm),

  customHeal('ult_heal', sum(-50, prod(char.chain, 250)), { team: true }),

  // // TODO: do this properly
  // ...allAttributeAnomalyKeys.flatMap((attr) =>
  //   ['anomaly' as const, 'attack' as const].map((type) =>
  //     customDmg(
  //       `core_${type}_${attr}_dmg`,
  //       { damageType1: 'elemental', attribute: attr },
  //       cmpEq(
  //         target.char.attribute,
  //         attr,
  //         cmpEq(
  //           target.char.specialty,
  //           type,
  //           prod(
  //             target.final.atk,
  //             sum(
  //               percent(subscript(char.core, dm.core[`dmg_${type}`])),
  //               cmpGE(char.mindscape, 2, percent(dm.m2[`dmg_${type}`]))
  //             )
  //           )
  //         )
  //       ),
  //       { team: true },
  //       core_crit_,
  //       core_crit_dmg_,
  //       m6_common_dmg_
  //     )
  //   )
  // ),
  customDmg(
    'm6_dmg',
    { ...baseTag, damageType1: 'elemental' },
    cmpGE(
      char.mindscape,
      6,
      focusedCreation.ifOn(
        prod(
          own.final.atk,
          sum(
            percent(subscript(char.core, dm.core.dmg_attack)),
            cmpGE(char.mindscape, 2, percent(dm.m2.dmg_attack))
          )
        )
      )
    ),
    undefined,
    core_crit_,
    core_crit_dmg_,
    m6_common_dmg_
  ),

  // Buffs
  registerBuff(
    'exSpecial_atk',
    teamBuff.combat.atk.add(etherVeil.ifOn(50)),
    undefined,
    true
  ),
  registerBuff('core_crit_', core_crit_, undefined, false, false),
  registerBuff('core_crit_dmg_', core_crit_dmg_, undefined, false, false),
  registerBuff(
    'core_atk',
    teamBuff.combat.atk.add(
      angelicChordination.ifOn(
        min(
          subscript(char.core, dm.core.maxAtk),
          prod(own.initial.atk, percent(dm.core.atkScaling))
        )
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'ability_stun_',
    enemyDebuff.common.stun_.add(
      cmpGE(
        sum(
          team.common.count.withSpecialty('attack'),
          team.common.count.withFaction('AngelsOfDelusion')
        ),
        2,
        etherVeil.ifOn(percent(dm.ability.stun_))
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'm1_defRed_',
    enemyDebuff.common.defRed_.add(
      cmpGE(char.mindscape, 1, prod(catsGaze, percent(dm.m1.defRed_)))
    ),
    undefined,
    true
  ),
  registerBuff(
    'm2_atk_',
    teamBuff.combat.atk_.add(
      cmpGE(char.mindscape, 2, inAnyEtherVeil.ifOn(percent(dm.m2.atk_)))
    ),
    undefined,
    true
  ),
  registerBuff(
    'm4_common_dmg_',
    teamBuff.combat.common_dmg_.add(
      cmpGE(char.mindscape, 4, ultUsed.ifOn(percent(dm.m4.dmg_)))
    ),
    undefined,
    true
  ),
  registerBuff(
    'm6_crit_',
    ownBuff.combat.crit_.add(
      cmpGE(char.mindscape, 6, focusedCreation.ifOn(percent(1)))
    )
  ),
  registerBuff(
    'm6_crit_dmg_',
    ownBuff.combat.crit_dmg_.add(
      cmpGE(
        char.mindscape,
        6,
        focusedCreation.ifOn(
          min(
            percent(dm.m6.maxCrit_dmg_),
            prod(own.initial.atk, percent(dm.m6.crit_dmg_))
          )
        )
      )
    )
  ),
  registerBuff('m6_common_dmg_', m6_common_dmg_, undefined, false, false)
)
export default sheet
