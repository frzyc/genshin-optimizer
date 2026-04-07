import { cmpGE, prod, sum } from '@genshin-optimizer/pando/engine'
import { type CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allBoolConditionals,
  own,
  ownBuff,
  percent,
  register,
  registerBuff,
} from '../../util'
import {
  entriesForChar,
  registerAllDmgDazeAndAnom,
} from '../util'

const key: CharacterKey = 'NangongYu'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]

const { char } = own

const { m1_triggered, m6_triggered } = allBoolConditionals(key)

const core_anomProf = ownBuff.combat.anomProf.add(
  cmpGE(char.mindscape, 2, dm.core.anomProf)
)

const m2_resRed = ownBuff.combat.dmg_.addWithDmgType(
  'basic',
  cmpGE(char.mindscape, 2, m1_triggered.ifOn(dm.m2.dmg_))
)

const m2_ex_resRed = ownBuff.combat.dmg_.addWithDmgType(
  'exSpecial',
  cmpGE(char.mindscape, 2, m1_triggered.ifOn(dm.m2.dmg_))
)

const m4_anomProf = ownBuff.combat.anomProf.add(
  cmpGE(char.mindscape, 4, dm.m4.anomProf)
)

const m4_charge_anomBuildup = ownBuff.combat.anomBuildup_.addWithDmgType(
  'basic',
  cmpGE(char.mindscape, 4, dm.m4.charge_anomBuildup)
)

const m6_dazeInc = ownBuff.combat.dazeInc_.add(
  cmpGE(char.mindscape, 6, dm.m6.dazeInc)
)

const sheet = register(
  key,
  entriesForChar(data_gen),

  ...registerAllDmgDazeAndAnom(key, dm),

  registerBuff('core_anomProf', core_anomProf, undefined, undefined, false),
  registerBuff('m1_triggered', m1_triggered.ifOn(1), undefined, undefined, false),
  registerBuff(
    'm2_resRed',
    m2_resRed,
    undefined,
    undefined,
    false
  ),
  registerBuff(
    'm2_ex_resRed',
    m2_ex_resRed,
    undefined,
    undefined,
    false
  ),
  registerBuff('m4_anomProf', m4_anomProf, undefined, undefined, false),
  registerBuff(
    'm4_charge_anomBuildup',
    m4_charge_anomBuildup,
    undefined,
    undefined,
    false
  ),
  registerBuff('m6_dazeInc', m6_dazeInc, undefined, undefined, false)
)
export default sheet
