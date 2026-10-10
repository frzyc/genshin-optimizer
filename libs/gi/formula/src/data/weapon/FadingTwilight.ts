import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { lookup, subscript } from '@genshin-optimizer/pando/engine'
import { allListConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'FadingTwilight'
const stateKeys = ['evengleam', 'afterglow', 'dawnblaze'] as const
const evengleam = [-1, 0.06, 0.075, 0.09, 0.105, 0.12]
const afterglow = [-1, 0.1, 0.125, 0.15, 0.175, 0.2]
const dawnblaze = [-1, 0.14, 0.175, 0.21, 0.245, 0.28]

const {
  weapon: { refinement },
} = own
const { state } = allListConditionals(key, [...stateKeys])

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.add(
    lookup(
      subscript(state.value, ['', ...stateKeys]),
      {
        evengleam: percent(subscript(refinement, evengleam)),
        afterglow: percent(subscript(refinement, afterglow)),
        dawnblaze: percent(subscript(refinement, dawnblaze)),
      },
      0
    )
  )
)
