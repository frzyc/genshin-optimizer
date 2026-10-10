import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, ownBuff, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'EtherlightSpindlelute'
const eleMasArr = [-1, 100, 125, 150, 175, 200]

const {
  weapon: { refinement },
} = own
const { condPassive } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.eleMas.add(condPassive.ifOn(subscript(refinement, eleMasArr)))
)
