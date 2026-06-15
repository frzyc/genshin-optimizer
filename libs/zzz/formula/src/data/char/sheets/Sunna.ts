import {
  cmpGE,
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
  customHeal,
  enemyDebuff,
  own,
  ownBuff,
  percent,
  register,
  registerBuff,
  team,
  teamBuff,
} from '../../util'
import { entriesForChar, registerAllDmgDazeAndAnom } from '../util'

const key: CharacterKey = 'Sunna'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]

const { char } = own

const {
  etherVeil,
  angelicChordination,
  inAnyEtherVeil,
  ultUsed,
  focusedCreation,
} = allBoolConditionals(key)
const { catsGaze } = allNumConditionals(key, true, 0, dm.m1.maxStacks)

const sheet = register(
  key,
  // Handles base stats, core stats and Mindscapes 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(key, dm),

  customHeal('ult_heal', sum(-50, prod(char.chain, 250)), { team: true }),

  // Buffs
  registerBuff(
    'exSpecial_atk',
    teamBuff.combat.atk.add(etherVeil.ifOn(50)),
    undefined,
    true
  ),
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
  )
)
export default sheet
