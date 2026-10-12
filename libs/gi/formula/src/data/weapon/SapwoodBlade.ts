import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import { allBoolConditionals, own, register, teamBuff } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'SapwoodBlade'
const eleMasArr = [-1, 60, 75, 90, 105, 120]

const {
  weapon: { refinement },
} = own
const { passive } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  teamBuff.premod.eleMas.addOnce(
    'leafCon',
    passive.ifOn(subscript(refinement, eleMasArr)),
    destIsActive
  )
)
