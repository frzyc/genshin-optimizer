import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { subscript } from '@genshin-optimizer/pando/engine'
import { allBoolConditionals, own, percent, register, teamBuff } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'ElegyForTheEnd'
const eleMasInc2 = [-1, 100, 125, 150, 175, 200]
const atk_s = [-1, 0.2, 0.25, 0.3, 0.35, 0.4]

const {
  weapon: { refinement },
} = own
const { ThePartingRefrain } = allBoolConditionals(key)

export default register(
  key,
  entriesForWeapon(key),
  teamBuff.premod.eleMas.add(
    ThePartingRefrain.ifOn(subscript(refinement, eleMasInc2))
  ),
  teamBuff.premod.atk_.addOnce(
    'millenialatk',
    ThePartingRefrain.ifOn(percent(subscript(refinement, atk_s)))
  )
)
