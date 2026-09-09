import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { min, prod, subscript } from '@genshin-optimizer/pando/engine'
import { allNumConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'Akuoumaru'
const ratio = [-1, 0.0012, 0.0015, 0.0018, 0.0021, 0.0024]
const max = [-1, 0.4, 0.5, 0.6, 0.7, 0.8]

const {
  weapon: { refinement },
} = own
const { WatatsumiWavewalker } = allNumConditionals(key, true, 0, 360)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.burst.add(
    min(
      prod(percent(subscript(refinement, ratio)), WatatsumiWavewalker),
      percent(subscript(refinement, max))
    )
  )
)
