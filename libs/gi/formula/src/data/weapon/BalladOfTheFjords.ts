import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { cmpGE, subscript } from '@genshin-optimizer/pando/engine'
import { own, ownBuff, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'BalladOfTheFjords'
const eleMasArr = [-1, 120, 150, 180, 210, 240]

const {
  weapon: { refinement },
} = own

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.eleMas.add(
    cmpGE(own.common.eleCount, 3, subscript(refinement, eleMasArr))
  )
)
