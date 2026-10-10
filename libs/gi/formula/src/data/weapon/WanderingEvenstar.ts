import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { isActive } from '../common/conds'
import { own, ownBuff, percent, register, teamBuff } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'WanderingEvenstar'
const atkArr = [-1, 0.24, 0.3, 0.36, 0.42, 0.48]

const {
  weapon: { refinement },
} = own
const selfAtk = prod(percent(subscript(refinement, atkArr)), own.premod.eleMas)
const teamAtkDisp = prod(percent(0.3), selfAtk)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.final.atk.add(selfAtk),
  // WR unequal(activeCharKey, charKey) teamBuff: share while wielder is off-field.
  teamBuff.final.atk.add(isActive.ifOff(teamAtkDisp))
)
