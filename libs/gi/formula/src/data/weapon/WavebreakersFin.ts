import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { min, prod, subscript } from '@genshin-optimizer/pando/engine'
import { allListConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'WavebreakersFin'
const energyKeys = range(4, 36).map((i) => `${i * 10}`)
const ratio = [-1, 0.0012, 0.0015, 0.0018, 0.0021, 0.0024]
const max = [-1, 0.4, 0.5, 0.6, 0.7, 0.8]

const {
  weapon: { refinement },
} = own
const { WatatsumiWavewalker } = allListConditionals(key, energyKeys)
const energy = WatatsumiWavewalker.map(objKeyMap(energyKeys, (k) => Number(k)))

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.dmg_.burst.add(
    min(
      prod(percent(subscript(refinement, ratio)), energy),
      percent(subscript(refinement, max))
    )
  )
)
