import type { WeaponData } from '@genshin-optimizer/pipeline'
import { input } from '../../../../Formula'
import { lookup, naught, prod, subscript } from '../../../../Formula/utils'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { objectKeyMap, range } from '../../../../Util/Util'
import { cond, stg, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import data_gen_json from './data_gen.json'

const key: WeaponKey = 'BlackcliffWarbow'
const data_gen = data_gen_json as WeaponData
const atkInc = [0.12, 0.15, 0.18, 0.21, 0.24]

const [condPassivePath, condPassive] = cond(key, 'PressTheAdvantage')
const atk_ = lookup(
  condPassive,
  {
    ...objectKeyMap(range(1, 3), (i) =>
      prod(subscript(input.weapon.refineIndex, atkInc), i)
    ),
  },
  naught
)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    atk_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      header: headerTemplate(key, st('stacks')),
      name: st('afterDefeatEnemy'),
      states: Object.fromEntries(
        range(1, 3).map((c) => [
          c,
          {
            name: st('stack', { count: c }),
            fields: [
              {
                node: atk_,
              },
              {
                text: stg('duration'),
                value: 30,
                unit: 's',
              },
            ],
          },
        ])
      ),
    },
  ],
}

export default new WeaponSheet(key, sheet, data_gen, data)
