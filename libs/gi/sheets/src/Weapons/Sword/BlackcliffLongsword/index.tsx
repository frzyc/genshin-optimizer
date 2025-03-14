import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  constant,
  input,
  lookup,
  prod,
  subscript,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'BlackcliffLongsword'

const [condPassivePath, condPassive] = cond(key, 'PressTheAdvantage')
const opponentsDefeated = range(1, 3)
const atkInc = [-1, 0.12, 0.15, 0.18, 0.21, 0.24]
const atk_ = prod(
  lookup(
    condPassive,
    objKeyMap(opponentsDefeated, (i) => constant(i)),
    0,
  ),
  subscript(input.weapon.refinement, atkInc),
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    atk_: atk_,
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
        opponentsDefeated.map((c) => [
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
        ]),
      ),
    },
  ],
}
export default new WeaponSheet(sheet, data)
