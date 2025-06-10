import {
  cmpGE,
  constant,
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
  customDmg,
  notOwnBuff,
  own,
  ownBuff,
  percent,
  register,
  registerBuff,
  team,
  teamBuff,
} from '../../util'
import { entriesForChar, getBaseTag, registerAllDmgDazeAndAnom } from '../util'

const key: CharacterKey = 'Jane'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

const {
  enemy_suffering_anomaly,
  passion,
  gnawed,
  assault_or_disorder_triggered,
} = allBoolConditionals(key)

const sheet = register(
  key,
  // Handles base stats, StatBoosts and Eidolon 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(key, dm),

  ...customDmg(
    'm6_additional_dmg',
    { ...baseTag, damageType1: 'elemental' },
    prod(own.final.anomProf, dm.m6.dmg)
  ),

  // Buffs
  registerBuff(
    'passion_physical_anomBuildup_',
    ownBuff.combat.anomBuildup_.physical.add(passion.ifOn(percent(0.25))) // No data in dm
  ),
  registerBuff(
    'passion_atk',
    ownBuff.combat.atk.add(
      passion.ifOn(
        min(
          prod(max(0, sum(own.final.anomProf, constant(-120))), constant(2)),
          constant(600)
        )
      ) // No data in dm
    )
  ),
  registerBuff(
    'core_assault_crit_',
    teamBuff.combat.anom_crit_.physical.add(
      gnawed.ifOn(
        sum(
          subscript(char.core, dm.core.assault_crit_),
          prod(
            own.final.anomProf,
            subscript(char.core, dm.core.assault_crit_step)
          )
        )
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'core_assault_crit_dmg_',
    teamBuff.combat.anom_crit_dmg_.physical.add(
      gnawed.ifOn(subscript(char.core, dm.core.assault_crit_dmg_))
    ),
    undefined,
    true
  ),
  registerBuff(
    'ability_physical_anomBuildup_',
    ownBuff.combat.anomBuildup_.physical.add(
      cmpGE(
        sum(
          team.common.count.withSpecialty('anomaly'),
          team.common.count.withFaction(
            'CriminalInvestigationSpecialResponseTeam'
          )
        ),
        3,
        sum(
          dm.ability.physical_anomBuildup_,
          enemy_suffering_anomaly.ifOn(
            dm.ability.additional_physical_anomBuildup_
          )
        )
      )
    )
  ),
  registerBuff(
    'm1_physical_anomBuildup_',
    ownBuff.combat.anomBuildup_.physical.add(
      cmpGE(char.mindscape, 1, passion.ifOn(dm.m1.physical_anomBuildup_))
    )
  ),
  registerBuff(
    'm1_common_dmg_',
    ownBuff.combat.common_dmg_.add(
      cmpGE(
        char.mindscape,
        1,
        passion.ifOn(
          min(dm.m1.max_dmg_, prod(own.final.anomProf, dm.m1.anomProf_step))
        )
      )
    )
  ),
  registerBuff(
    'm2_defIgn_',
    ownBuff.combat.defIgn_.add(
      cmpGE(char.mindscape, 2, gnawed.ifOn(dm.m2.defIgn_))
    )
  ),
  registerBuff(
    'm2_assault_defIgn_',
    notOwnBuff.combat.defIgn_.physical.addWithDmgType(
      'anomaly',
      cmpGE(char.mindscape, 2, gnawed.ifOn(dm.m2.defIgn_))
    ),
    undefined,
    true
  ),
  registerBuff(
    'm2_assault_crit_dmg_',
    teamBuff.combat.anom_crit_dmg_.physical.add(
      cmpGE(char.mindscape, 2, gnawed.ifOn(dm.m2.assault_crit_dmg_))
    ),
    undefined,
    true
  ),
  registerBuff(
    'm4_anomaly_dmg_',
    teamBuff.combat.dmg_.addWithDmgType(
      'anomaly',
      cmpGE(
        char.mindscape,
        4,
        assault_or_disorder_triggered.ifOn(dm.m4.anomaly_dmg_)
      )
    )
  ),
  registerBuff(
    'm6_crit_',
    ownBuff.combat.crit_.add(
      cmpGE(char.mindscape, 6, passion.ifOn(dm.m6.crit_))
    )
  ),
  registerBuff(
    'm6_crit_dmg_',
    ownBuff.combat.crit_dmg_.add(
      cmpGE(char.mindscape, 6, passion.ifOn(dm.m6.crit_dmg_))
    )
  )
)
export default sheet
