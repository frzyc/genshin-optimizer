import type { WeaponData } from '@genshin-optimizer/pipeline'
import { input } from '../../../../Formula'
import { lookup, naught, prod, subscript } from '../../../../Formula/utils'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { objectKeyMap, range } from '../../../../Util/Util'
import { cond, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import data_gen_json from './data_gen.json'

const key: WeaponKey = 'CompoundBow'
const data_gen = data_gen_json as WeaponData

const atk_s = [0.04, 0.05, 0.06, 0.07, 0.08]
const atkSPD_s = [0.012, 0.015, 0.018, 0.021, 0.024]
const [condPassivePath, condPassive] = cond(key, 'InfusionArrow')
const atk_ = lookup(
  condPassive,
  {
    ...objectKeyMap(range(1, 4), (i) =>
      prod(subscript(input.weapon.refineIndex, atk_s), i)
    ),
  },
  naught
)
const atkSPD_ = lookup(
  condPassive,
  {
    ...objectKeyMap(range(1, 4), (i) =>
      prod(subscript(input.weapon.refineIndex, atkSPD_s), i)
    ),
  },
  naught
)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    atk_,
    atkSPD_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      header: headerTemplate(key, st('stacks')),
      name: st('hitOp.normalOrCharged'),
      states: Object.fromEntries(
        range(1, 4).map((i) => [
          i,
          {
            name: st('hits', { count: i }),
            fields: [
              {
                node: atk_,
              },
              {
                node: atkSPD_,
              },
            ],
          },
        ])
      ),
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
