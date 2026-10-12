import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'PrimordialJadeCutter'
const atkSrc = [-1, 0.012, 0.015, 0.018, 0.021, 0.024]

const {
  weapon: { refinement },
} = own

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.final.atk.add(
    prod(percent(subscript(refinement, atkSrc)), own.premod.hp)
  )
)
