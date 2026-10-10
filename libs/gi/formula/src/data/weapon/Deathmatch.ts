import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { lookup, subscript } from '@genshin-optimizer/pando/engine'
import { allListConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'Deathmatch'
const atkDefInc = [-1, 0.16, 0.2, 0.24, 0.28, 0.32]
const atkInc = [-1, 0.24, 0.3, 0.36, 0.42, 0.48]
const stackKeys = ['oneOrNone', 'moreThanOne'] as const

const {
  weapon: { refinement },
} = own
const { stack } = allListConditionals(key, [...stackKeys])
const atkDef_ = percent(subscript(refinement, atkDefInc))

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.atk_.add(
    lookup(
      subscript(stack.value, ['', ...stackKeys]),
      {
        oneOrNone: percent(subscript(refinement, atkInc)),
        moreThanOne: atkDef_,
      },
      0
    )
  ),
  ownBuff.premod.def_.add(
    lookup(
      subscript(stack.value, ['', ...stackKeys]),
      { moreThanOne: atkDef_ },
      0
    )
  )
)
