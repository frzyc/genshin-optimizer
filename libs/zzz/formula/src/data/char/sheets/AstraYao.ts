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
  notOwnBuff,
  own,
  ownBuff,
  percent,
  register,
  registerBuff,
  teamBuff,
} from '../../util'
import {
  dmgDazeAndAnomOverride,
  entriesForChar,
  getBaseTag,
  registerAllDmgDazeAndAnom,
} from '../util'

const key: CharacterKey = 'AstraYao'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

const { idyllic_cadenza, precise_assist_triggered } = allBoolConditionals(key)
const { attack_hits } = allNumConditionals(key, true, 0, dm.m1.max_stacks)

const m6_mv_mult = ownBuff.dmg.mv_mult_.add(
  cmpGE(
    char.mindscape,
    6,
    idyllic_cadenza.ifOn(dm.m6.tremolo_tone_clusters_mv_mult, percent(1))
  )
)
const m6_crit_ = ownBuff.combat.crit_.add(
  cmpGE(char.mindscape, 6, idyllic_cadenza.ifOn(dm.m6.crit_))
)
const m6_capriccio_crit_ = ownBuff.combat.crit_.add(
  cmpGE(char.mindscape, 6, precise_assist_triggered.ifOn(dm.m6.capriccio_crit_))
)

const sheet = register(
  key,
  // Handles base stats, StatBoosts and Eidolon 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(
    key,
    dm,
    // Per-hit buffs
    // M6 4th hit bonus
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackCapriccio',
      3,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      m6_capriccio_crit_
    ),
    // Attacks with tremolo get buffs from M6
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackInterlude',
      0,
      {
        ...baseTag,
        damageType1: 'basic',
      },
      'atk',
      undefined,
      m6_mv_mult,
      m6_crit_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackChorus',
      0,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      m6_mv_mult,
      m6_crit_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackFinale',
      0,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      m6_mv_mult,
      m6_crit_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'special',
      'SpecialAttackWindchimesOaths',
      0,
      { ...baseTag, damageType1: 'special' },
      'atk',
      undefined,
      m6_mv_mult,
      m6_crit_
    ),
    // Buffs from M6 and Ex Special type
    dmgDazeAndAnomOverride(
      dm,
      'special',
      'Chord',
      0,
      { ...baseTag, damageType1: 'exSpecial' },
      'atk',
      undefined,
      m6_mv_mult,
      m6_crit_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'special',
      'Chord',
      1,
      { ...baseTag, damageType1: 'special' },
      'atk',
      undefined,
      m6_mv_mult,
      m6_crit_
    )
  ),

  customHeal('ultimate_heal', sum(-50, prod(char.chain, 250))),

  // Buffs
  registerBuff(
    'common_dmg_',
    teamBuff.combat.common_dmg_.add(
      idyllic_cadenza.ifOn(
        sum(percent(0.08), prod(char.special, percent(0.01)))
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'crit_dmg_',
    teamBuff.combat.crit_dmg_.add(
      idyllic_cadenza.ifOn(
        sum(percent(0.07), prod(char.special, percent(0.015)))
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'core_atk',
    teamBuff.combat.atk.add(
      idyllic_cadenza.ifOn(
        min(
          sum(dm.core.max_atk, cmpGE(char.mindscape, 2, dm.m2.max_increase)),
          prod(
            own.initial.atk,
            percent(subscript(char.core, dm.core.atk_)),
            sum(percent(1), cmpGE(char.mindscape, 2, percent(dm.m2.atk_)))
          )
        )
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'm1_resRed_',
    enemyDebuff.common.resRed_.add(
      cmpGE(char.mindscape, 1, prod(attack_hits, percent(dm.m1.resRed_)))
    )
  ),
  // TODO: check if this actually works
  registerBuff(
    'm4_attack_quickAssist_extraDmg',
    notOwnBuff.combat.flat_dmg
      .withTag({ specialty: 'attack' })
      .addWithDmgType(
        'quickAssist',
        cmpGE(
          char.mindscape,
          4,
          idyllic_cadenza.ifOn(prod(own.final.atk, percent(dm.m4.attack)))
        )
      ),
    undefined,
    true
  ),
  registerBuff(
    'm4_anomaly_quickAssist_anomBuildup_',
    notOwnBuff.combat.anomBuildup_
      .withTag({ specialty: 'anomaly' })
      .addWithDmgType(
        'quickAssist',
        cmpGE(char.mindscape, 4, idyllic_cadenza.ifOn(dm.m4.anomaly))
      ),
    undefined,
    true
  ),
  registerBuff(
    'm4_stun_quickAssist_dazeInc_',
    notOwnBuff.combat.dazeInc_
      .withTag({ specialty: 'stun' })
      .addWithDmgType(
        'quickAssist',
        cmpGE(char.mindscape, 4, idyllic_cadenza.ifOn(dm.m4.stun))
      ),
    undefined,
    true
  ),
  registerBuff('m6_crit_', m6_crit_, undefined, undefined, false),
  registerBuff('m6_mv_mult_', m6_mv_mult, undefined, undefined, false),
  registerBuff(
    'm6_capriccio_crit_',
    m6_capriccio_crit_,
    undefined,
    undefined,
    false
  )
)
export default sheet
