import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'AlleyHunter'
const dmgInc = [-1, 0.02, 0.025, 0.03, 0.035, 0.04]

const {
  weapon: { refinement },
} = own
const { OppidanAmbush } = allNumConditionals(key, true, 0, 10)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.add(
    prod(OppidanAmbush, percent(subscript(refinement, dmgInc)))
  )
)
