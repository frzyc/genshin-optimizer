import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { allElementKeys } from '@genshin-optimizer/gi/consts'
import { prod, subscript } from '@genshin-optimizer/pando/engine'
import { allListConditionals, own, ownBuff, percent, register } from '../util'
import { entriesForWeapon } from './util'

const key: WeaponKey = 'TheWidsith'
const refinementAtkVals = [-1, 0.6, 0.75, 0.9, 1.05, 1.2]
const refinementEleDmgVals = [-1, 0.48, 0.6, 0.72, 0.84, 0.96]
const refinementEleMasVals = [-1, 240, 300, 360, 420, 480]

const {
  weapon: { refinement },
} = own
const { Debut } = allListConditionals(key, ['aria', 'interlude', 'recitative'])

export default register(
  key,
  entriesForWeapon(key),
  ownBuff.premod.atk_.add(
    prod(
      percent(subscript(refinement, refinementAtkVals)),
      Debut.map({ recitative: 1, aria: 0, interlude: 0 })
    )
  ),
  allElementKeys.map((ele) =>
    ownBuff.premod.dmg_[ele].add(
      prod(
        percent(subscript(refinement, refinementEleDmgVals)),
        Debut.map({ aria: 1, interlude: 0, recitative: 0 })
      )
    )
  ),
  ownBuff.premod.eleMas.add(
    prod(
      subscript(refinement, refinementEleMasVals),
      Debut.map({ interlude: 1, aria: 0, recitative: 0 })
    )
  )
)
