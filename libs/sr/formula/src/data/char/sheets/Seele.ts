import { cmpEq, cmpGE, subscript } from '@genshin-optimizer/pando/engine'
import { type CharacterKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import {
  allBoolConditionals,
  allNumConditionals,
  own,
  ownBuff,
  register,
  registerBuff,
} from '../../util'
import { dmg, entriesForChar, getBaseTag } from '../util'

const key: CharacterKey = 'Seele'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

const { amplification, enemyLowerThan80_ } = allBoolConditionals(key)
const { skillStacks } = allNumConditionals(key, true, 0, 2)

const sheet = register(
  key,
  // Handles base stats, StatBoosts and Eidolon 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...dmg('basicDmg', baseTag, 'atk', dm.basic.dmg, 'basic'),
  ...dmg('skillDmg', baseTag, 'atk', dm.skill.dmg, 'skill'),
  ...dmg('ultDmg', baseTag, 'atk', dm.ult.dmg, 'ult'),
  ...dmg(
    'e6Dmg',
    { ...baseTag, damageType1: 'elemental' },
    'atk',
    dm.ult.dmg,
    'ult',
    [dm.e6.dmg],
    {
      cond: cmpGE(char.eidolon, 6, 'infer', ''),
    },
  ),

  // Buffs
  registerBuff(
    'skill_spd_',
    ownBuff.premod.spd_.add(
      cmpGE(
        skillStacks,
        2,
        cmpGE(own.char.eidolon, 2, dm.skill.spd_ * 2, dm.skill.spd_),
        cmpGE(skillStacks, 1, dm.skill.spd_),
      ),
    ),
  ),
  registerBuff(
    'amplification_dmg_',
    ownBuff.premod.common_dmg_.add(
      amplification.ifOn(subscript(char.talent, dm.talent.dmg_)),
    ),
  ),
  registerBuff(
    'ba2_resPen_',
    ownBuff.premod.resPen_.quantum.add(
      cmpEq(char.bonusAbility1, 1, amplification.ifOn(dm.b2.resPen_quantum)),
    ),
  ),
  registerBuff(
    'e1_crit_',
    ownBuff.premod.crit_.add(
      enemyLowerThan80_.ifOn(cmpGE(char.eidolon, 1, dm.e1.crit_)),
    ),
  ),
  // TODO: Add E2 conditional conditional stacking
  // registerBuff('e2_spd')
)
export default sheet
