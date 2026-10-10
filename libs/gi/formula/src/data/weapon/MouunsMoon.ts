import { range } from '@genshin-optimizer/common/util'
import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { lookup, min, prod, subscript } from '@genshin-optimizer/pando/engine'
import { allListConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'MouunsMoon'
const energyRange = range(4, 36).map((i) => i * 10)
const energyKeys = energyRange.map((i) => i.toString())
const ratio = [-1, 0.0012, 0.0015, 0.0018, 0.0021, 0.0024]
const max = [-1, 0.4, 0.5, 0.6, 0.7, 0.8]

const {
  weapon: { refinement },
} = own
const { WatatsumiWavewalker } = allListConditionals(key, energyKeys)

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.burst.add(
    lookup(
      subscript(WatatsumiWavewalker.value, ['', ...energyKeys]),
      Object.fromEntries(
        energyRange.map((i) => [
          i.toString(),
          min(
            prod(percent(subscript(refinement, ratio)), i),
            percent(subscript(refinement, max))
          ),
        ])
      ),
      0
    )
  )
)
