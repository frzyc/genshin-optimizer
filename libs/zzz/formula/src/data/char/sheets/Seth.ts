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
  customDmg,
  customShield,
  enemyDebuff,
  own,
  ownBuff,
  percent,
  register,
  registerBuff,
  team,
  teamBuff,
} from '../../util'
import {
  dmgDazeAndAnomOverride,
  entriesForChar,
  getBaseTag,
  registerAllDmgDazeAndAnom,
} from '../util'

const key: CharacterKey = 'Seth'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

const { shield_active, chain_finish_hit } = allBoolConditionals(key)

const m2_basic_electric_anomBuildup_ =
  ownBuff.combat.anomBuildup_.electric.addWithDmgType(
    'basic',
    cmpGE(char.mindscape, 2, percent(dm.m2.electric_anomBuildup_))
  )
const m4_defensiveAssist_dazeInc_ = ownBuff.combat.dazeInc_.addWithDmgType(
  'defensiveAssist',
  cmpGE(char.mindscape, 4, percent(dm.m4.dazeInc_))
)
const m6_crit_ = ownBuff.combat.crit_.add(cmpGE(char.mindscape, 6, percent(1)))
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
    // Basic attack lightning strike hits 1-3 are physical
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackLightningStrike',
      0,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackLightningStrike',
      1,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackLightningStrike',
      2,
      { damageType1: 'basic' },
      'atk'
    ),
    // Dash attack is electric
    dmgDazeAndAnomOverride(
      dm,
      'dodge',
      'DashAttackThunderAssault',
      0,
      { damageType1: 'dash' },
      'atk'
    ),
    // Per-hit buffs
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackLightningStrikeElectrified',
      0,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      ...m2_basic_electric_anomBuildup_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackLightningStrikeElectrified',
      1,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      ...m2_basic_electric_anomBuildup_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'assist',
      'DefensiveAssistThundershield',
      0,
      { ...baseTag, damageType1: 'defensiveAssist' },
      'atk',
      undefined,
      ...m4_defensiveAssist_dazeInc_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'assist',
      'DefensiveAssistThundershield',
      1,
      { ...baseTag, damageType1: 'defensiveAssist' },
      'atk',
      undefined,
      ...m4_defensiveAssist_dazeInc_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'assist',
      'DefensiveAssistThundershield',
      2,
      { ...baseTag, damageType1: 'defensiveAssist' },
      'atk',
      undefined,
      ...m4_defensiveAssist_dazeInc_
    )
  ),

  ...customShield(
    'core_shield',
    min(
      prod(
        dm.core.max_shield,
        cmpGE(
          char.mindscape,
          1,
          sum(percent(dm.m1.shield_), percent(1)),
          percent(1)
        )
      ),
      prod(
        own.final.atk,
        percent(subscript(char.core, dm.core.shield)),
        cmpGE(
          char.mindscape,
          1,
          sum(percent(dm.m1.shield_), percent(1)),
          percent(1)
        )
      )
    )
  ),
  ...customDmg(
    'm6_dmg',
    { damageType1: 'elemental' },
    cmpGE(char.mindscape, 6, prod(own.final.atk, percent(dm.m6.dmg))),
    undefined,
    m6_crit_,
    m6_crit_dmg_
  ),

  // Buffs
  registerBuff(
    'core_anomProf',
    teamBuff.combat.anomProf.add(
      shield_active.ifOn(percent(subscript(char.core, dm.core.anomProf)))
    )
  ),
  registerBuff(
    'ability_anomBuildupRes_',
    enemyDebuff.common.anomBuildupRes_.add(
      cmpGE(
        sum(
          team.common.count.electric,
          team.common.count.withFaction(
            'CriminalInvestigationSpecialResponseTeam'
          )
        ),
        3,
        chain_finish_hit.ifOn(percent(-dm.ability.anomBuildupRes_))
      )
    )
  ),
  registerBuff(
    'm2_basic_electric_anomBuildup_',
    m2_basic_electric_anomBuildup_,
    undefined,
    undefined,
    false
  ),
  registerBuff(
    'm4_defensiveAssist_dazeInc_',
    m4_defensiveAssist_dazeInc_,
    undefined,
    undefined,
    false
  ),
  registerBuff('m6_crit_', m6_crit_, undefined, undefined, false),
  registerBuff('m6_crit_dmg_', m6_crit_dmg_, undefined, undefined, false)
)
export default sheet
