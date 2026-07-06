import {
  cmpEq,
  cmpGE,
  constant,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/pando/engine'
import { type CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allBoolConditionals,
  allNumConditionals,
  customHeal,
  own,
  ownBuff,
  percent,
  register,
  registerBuff,
  team,
  teamBuff,
} from '../../util'
import { entriesForChar, registerAllDmgDazeAndAnom } from '../util'

const key: CharacterKey = 'Yidhari'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]

const { char } = own

const { etherVeil, erudition } = allBoolConditionals(key)
const { missingHp } = allNumConditionals(key, true, 0, 50)

const sheet = register(
  key,
  // Handles base stats, core stats and Mindscapes 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(key, dm),

  customHeal(
    'm6_heal',
    cmpGE(char.mindscape, 6, prod(own.final.hp, percent(dm.m6.healing)))
  ),

  // Buffs
  registerBuff(
    'etherVeil_hp_',
    teamBuff.combat.hp_.add(etherVeil.ifOn(percent(0.05))),
    undefined,
    true
  ),
  registerBuff(
    'core_hpSheerForce',
    ownBuff.initial.sheerForce.add(
      prod(own.final.hp, constant(dm.core.sheerForce))
    )
  ),
  registerBuff(
    'core_common_dmg_',
    ownBuff.combat.common_dmg_.add(
      prod(missingHp, subscript(char.core, dm.core.common_dmg_), constant(0.02))
    )
  ),
  registerBuff(
    'ability_crit_dmg_',
    ownBuff.combat.crit_dmg_.add(
      cmpGE(
        sum(
          team.common.count.withSpecialty('stun'),
          team.common.count.withSpecialty('support')
        ),
        1,
        cmpEq(missingHp, 50, percent(dm.ability.crit_dmg_))
      )
    )
  ),
  registerBuff(
    'm1_basic_ice_resIgn_',
    ownBuff.combat.resIgn_.ice.addWithDmgType(
      'basic',
      cmpGE(char.mindscape, 1, percent(dm.m1.ice_resIgn_))
    )
  ),
  registerBuff(
    'm1_exSpecial_ice_resIgn_',
    ownBuff.combat.resIgn_.ice.addWithDmgType(
      'exSpecial',
      cmpGE(char.mindscape, 1, percent(dm.m1.ice_resIgn_))
    )
  ),
  registerBuff(
    'm2_crit_dmg_',
    ownBuff.combat.crit_dmg_.add(
      cmpGE(char.mindscape, 2, percent(dm.m2.crit_dmg_))
    )
  ),
  registerBuff(
    'm4_hp_',
    ownBuff.combat.hp_.add(
      cmpGE(char.mindscape, 4, etherVeil.ifOn(percent(dm.m4.hp_)))
    )
  ),
  registerBuff(
    'm6_sheer_dmg_',
    ownBuff.combat.sheer_dmg_.add(
      cmpGE(char.mindscape, 6, erudition.ifOn(percent(dm.m6.sheer_dmg_)))
    )
  )
)
export default sheet
