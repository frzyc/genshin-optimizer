import { cmpGE, prod, subscript, sum } from '@genshin-optimizer/pando/engine'
import { type CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allBoolConditionals,
  allNumConditionals,
  enemyDebuff,
  own,
  ownBuff,
  register,
  registerBuff,
  team,
  teamBuff,
} from '../../util'
import {
  dmgDazeAndAnomMerge,
  entriesForChar,
  getBaseTag,
  registerAllDmgDazeAndAnom,
} from '../util'

const key: CharacterKey = 'Nicole'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

const { bulletsOrFieldHit } = allBoolConditionals(key)
const { fieldHitsEnemy } = allNumConditionals(key, true, 0, dm.m6.stacks)

const sheet = register(
  key,
  // Handles base stats, core stats and Mindscapes 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(key, dm, {
    // Basic is physical and some hits need to be merged
    basic: {
      BasicAttackCunningCombo: {
        '0': [
          ...dmgDazeAndAnomMerge(
            [
              dm.basic.BasicAttackCunningCombo[0],
              dm.basic.BasicAttackCunningCombo[1],
            ],
            'BasicAttackCunningCombo_0',
            { damageType1: 'basic' },
            'atk',
            'basic'
          ),
        ],
        '1': [
          ...dmgDazeAndAnomMerge(
            [
              dm.basic.BasicAttackCunningCombo[2],
              dm.basic.BasicAttackCunningCombo[3],
            ],
            'BasicAttackCunningCombo_1',
            { damageType1: 'basic' },
            'atk',
            'basic'
          ),
        ],
        '2': [
          ...dmgDazeAndAnomMerge(
            [
              dm.basic.BasicAttackCunningCombo[4],
              dm.basic.BasicAttackCunningCombo[5],
            ],
            'BasicAttackCunningCombo_2',
            { damageType1: 'basic' },
            'atk',
            'basic'
          ),
        ],
        '3': [],
        '4': [],
        '5': [],
      },
      BasicAttackDoAsIPlease: {
        '0': [
          ...dmgDazeAndAnomMerge(
            [
              dm.basic.BasicAttackDoAsIPlease[0],
              dm.basic.BasicAttackDoAsIPlease[1],
            ],
            'BasicAttackDoAsIPlease_0',
            { damageType1: 'basic' },
            'atk',
            'basic'
          ),
        ],
        '1': [
          ...dmgDazeAndAnomMerge(
            [
              dm.basic.BasicAttackDoAsIPlease[2],
              dm.basic.BasicAttackDoAsIPlease[3],
            ],
            'BasicAttackDoAsIPlease_1',
            { damageType1: 'basic' },
            'atk',
            'basic'
          ),
        ],
        '2': [
          ...dmgDazeAndAnomMerge(
            [
              dm.basic.BasicAttackDoAsIPlease[4],
              dm.basic.BasicAttackDoAsIPlease[5],
            ],
            'BasicAttackDoAsIPlease_2',
            { damageType1: 'basic' },
            'atk',
            'basic'
          ),
        ],
        '3': [],
        '4': [],
        '5': [],
      },
    },
    // Dash Attack Jack In The Box is physical and first two hits need to be merged
    dodge: {
      DashAttackJackInTheBox: {
        '0': [
          ...dmgDazeAndAnomMerge(
            [
              dm.dodge.DashAttackJackInTheBox[0],
              dm.dodge.DashAttackJackInTheBox[1],
            ],
            'DashAttackJackInTheBox_0',
            { damageType1: 'dash' },
            'atk',
            'dodge'
          ),
        ],
        '1': [
          ...dmgDazeAndAnomMerge(
            [dm.dodge.DashAttackJackInTheBox[2]],
            'DashAttackJackInTheBox_1',
            { damageType1: 'dash' },
            'atk',
            'dodge'
          ),
        ],
        '2': [],
      },
      // Dodge Counter needs to be merged
      DodgeCounterDivertedBombard: {
        '0': [
          ...dmgDazeAndAnomMerge(
            [
              dm.dodge.DodgeCounterDivertedBombard[0],
              dm.dodge.DodgeCounterDivertedBombard[1],
            ],
            'DodgeCounterDivertedBombard_0',
            { ...baseTag, damageType1: 'dodgeCounter' },
            'atk',
            'dodge'
          ),
        ],
        '1': [],
      },
    },
    // Quick Assist needs to be merged
    assist: {
      QuickAssistEmergencyBombard: {
        '0': [
          ...dmgDazeAndAnomMerge(
            [
              dm.assist.QuickAssistEmergencyBombard[0],
              dm.assist.QuickAssistEmergencyBombard[1],
            ],
            'QuickAssistEmergencyBombard_0',
            { ...baseTag, damageType1: 'quickAssist' },
            'atk',
            'assist'
          ),
        ],
        '1': [],
      },
    },
    special: {
      // Special needs to be merged
      SpecialAttackSugarcoatedBullet: {
        '0': [
          ...dmgDazeAndAnomMerge(
            [
              dm.special.SpecialAttackSugarcoatedBullet[0],
              dm.special.SpecialAttackSugarcoatedBullet[1],
            ],
            'SpecialAttackSugarcoatedBullet_0',
            { ...baseTag, damageType1: 'special' },
            'atk',
            'special'
          ),
        ],
        '1': [],
      },
    },
    chain: {
      // Chain hits 1 and 2 need to be merged
      ChainAttackEtherShellacking: {
        '0': [
          ...dmgDazeAndAnomMerge(
            [
              dm.chain.ChainAttackEtherShellacking[0],
              dm.chain.ChainAttackEtherShellacking[1],
            ],
            'ChainAttackEtherShellacking_0',
            { ...baseTag, damageType1: 'chain' },
            'atk',
            'chain'
          ),
        ],
        '1': [
          ...dmgDazeAndAnomMerge(
            [dm.chain.ChainAttackEtherShellacking[2]],
            'ChainAttackEtherShellacking_1',
            { ...baseTag, damageType1: 'chain' },
            'atk',
            'chain'
          ),
        ],
        '2': [],
      },
    },
  }),

  // Buffs
  registerBuff(
    'core_defRed_',
    enemyDebuff.common.defRed_.add(
      bulletsOrFieldHit.ifOn(subscript(char.core, dm.core.def_red_))
    )
  ),
  registerBuff(
    'ability_ether_dmg_',
    teamBuff.combat.common_dmg_.add(
      cmpGE(
        sum(
          team.common.count.ether,
          team.common.count.withFaction('CunningHares')
        ),
        3,
        bulletsOrFieldHit.ifOn(dm.ability.ether_dmg_)
      )
    )
  ),
  registerBuff(
    'm1_exSpecial_dmg_',
    ownBuff.combat.dmg_.addWithDmgType(
      'exSpecial',
      cmpGE(char.mindscape, 1, dm.m1.ex_special_dmg_anomBuildup)
    ),
    cmpGE(char.mindscape, 1, 'infer', '')
  ),
  registerBuff(
    'm1_exSpecial_anomBuildup_',
    ownBuff.combat.anomBuildup_.addWithDmgType(
      'exSpecial',
      cmpGE(char.mindscape, 1, dm.m1.ex_special_dmg_anomBuildup)
    ),
    cmpGE(char.mindscape, 1, 'infer', '')
  ),
  registerBuff(
    'm6_crit_',
    teamBuff.combat.crit_.add(
      cmpGE(char.mindscape, 6, prod(fieldHitsEnemy, dm.m6.crit_))
    ),
    cmpGE(char.mindscape, 6, 'infer', ''),
    true
  )
)
export default sheet
