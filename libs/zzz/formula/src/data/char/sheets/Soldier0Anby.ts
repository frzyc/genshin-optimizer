import { cmpGE, prod, subscript, sum } from '@genshin-optimizer/pando/engine'
import { type CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allBoolConditionals,
  customDmg,
  own,
  ownBuff,
  percent,
  register,
  registerBuff,
  team,
  teamBuff,
} from '../../util'
import { entriesForChar, getBaseTag, registerAllDmgDazeAndAnom } from '../util'

const key: CharacterKey = 'Soldier0Anby'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

const { markedWithSilverStar } = allBoolConditionals(key)

const sheet = register(
  key,
  // Handles base stats, core stats and Mindscapes 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(key, dm),

  ...customDmg(
    'm6_additional_dmg',
    { ...baseTag, damageType1: 'aftershock' },
    cmpGE(char.mindscape, 6, prod(own.final.atk, percent(dm.m6.dmg)))
  ),

  // Buffs
  registerBuff(
    'core_common_dmg_',
    ownBuff.combat.common_dmg_.add(
      markedWithSilverStar.ifOn(subscript(char.core, dm.core.common_dmg_))
    )
  ),
  registerBuff(
    'core_markedWithSilverStar_crit_dmg_',
    teamBuff.final.crit_dmg_.addWithDmgType(
      'aftershock',
      markedWithSilverStar.ifOn(
        prod(
          sum(own.initial.crit_dmg_, own.combat.crit_dmg_),
          percent(subscript(char.core, dm.core.aftershock_crit_dmg_scaling_))
        )
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'ability_crit_',
    ownBuff.combat.crit_.add(
      cmpGE(
        sum(
          team.common.count.withSpecialty('stun'),
          team.common.count.withSpecialty('support')
        ),
        1,
        dm.ability.crit_
      )
    )
  ),
  registerBuff(
    'ability_aftershock_dmg_',
    teamBuff.combat.dmg_.addWithDmgType(
      'aftershock',
      cmpGE(
        sum(
          team.common.count.withSpecialty('stun'),
          team.common.count.withSpecialty('support')
        ),
        1,
        markedWithSilverStar.ifOn(dm.ability.aftershock_dmg_)
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'm2_crit_',
    ownBuff.combat.crit_.add(cmpGE(char.mindscape, 2, dm.m2.crit_))
  ),
  registerBuff(
    'm4_electric_resIgn_',
    ownBuff.combat.resIgn_.electric.add(
      cmpGE(char.mindscape, 4, dm.m4.electric_resIgn_)
    )
  )
)
export default sheet
