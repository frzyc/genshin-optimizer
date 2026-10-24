import {
  cmpGE,
  constant,
  min,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/pando/engine'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allBoolConditionals,
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

const key: CharacterKey = 'Severian'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

const { dodgeBasic, inCombat } = allBoolConditionals(key)

const m6_basic_addlMult_ = ownBuff.combat.addlMult_.addWithDmgType(
  'basic',
  cmpGE(char.mindscape, 6, percent(dm.m6.addlMult_))
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
      'basic',
      'BasicAttackAzureWindsShadowhunt',
      0,
      {
        ...baseTag,
        damageType1: 'basic',
        skillType: 'basicSkill',
      },
      'atk',
      undefined,
      ...m6_basic_addlMult_
    )
  ),

  // Buffs
  registerBuff(
    'core_crit_dmg_',
    ownBuff.combat.crit_dmg_.add(
      percent(subscript(char.core, dm.core.crit_dmg_))
    )
  ),
  registerBuff(
    'core_common_dmg_',
    ownBuff.combat.common_dmg_.add(
      sum(
        percent(subscript(char.core, dm.core.common_dmg_)),
        percent(
          cmpGE(
            team.common.count.wind,
            2,
            subscript(char.core, dm.core.common_dmg_withWind)
          )
        )
      )
    )
  ),
  registerBuff(
    'ability_atk',
    ownBuff.combat.atk.add(
      cmpGE(
        sum(
          team.common.count.withSpecialty('support'),
          team.common.count.withSpecialty('stun')
        ),
        1,
        prod(dm.ability.atk, constant(100), min(own.final.crit_, percent(1)))
      )
    )
  ),
  registerBuff(
    'm1_wind_resIgn_',
    ownBuff.combat.resIgn_.wind.add(
      cmpGE(char.mindscape, 1, percent(dm.m1.wind_resIgn_))
    )
  ),
  registerBuff(
    'm2_pen_',
    ownBuff.combat.pen_.add(
      cmpGE(char.mindscape, 2, dodgeBasic.ifOn(percent(dm.m2.pen_)))
    )
  ),
  registerBuff(
    'm4_atk_',
    ownBuff.combat.atk_.add(
      cmpGE(char.mindscape, 4, inCombat.ifOn(percent(dm.m4.atk_)))
    )
  ),
  registerBuff(
    'm6_basic_addlMult_',
    m6_basic_addlMult_,
    undefined,
    undefined,
    false
  )
)
export default sheet
