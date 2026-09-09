import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { cmpGE, subscript } from '@genshin-optimizer/pando/engine'
import { own, ownBuff, register, team } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'MasterKey'
const eleMasarr = [-1, 60, 75, 90, 105, 120]
const gleam_eleMasarr = [-1, 60, 75, 90, 105, 120]

const {
  weapon: { refinement },
} = own

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.eleMas.add(subscript(refinement, eleMasarr)),
  ownBuff.premod.eleMas.add(
    cmpGE(team.common.moonsign, 2, subscript(refinement, gleam_eleMasarr))
  )
)
