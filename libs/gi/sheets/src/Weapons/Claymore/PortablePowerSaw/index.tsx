import { objKeyMap, range } from '@genshin-optimizer/common/util'
import { type WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  input,
  lookup,
  naught,
  prod,
  subscript,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'PortablePowerSaw'
const [, trm] = trans('weapon', key)

const eleMasArr = [-1, 40, 50, 60, 70, 80]

const [condSymbolsConsumedPath, condSymbolsConsumed] = cond(
  key,
  'symbolsConsumed',
)
const symbolsConsumedArr = range(1, 3)
const eleMas = lookup(
  condSymbolsConsumed,
  objKeyMap(symbolsConsumedArr, (symbol) =>
    prod(symbol, subscript(input.weapon.refinement, eleMasArr, { unit: '%' })),
  ),
  naught,
)

const data = dataObjForWeaponSheet(key, {
  premod: {
    eleMas,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condSymbolsConsumed,
      path: condSymbolsConsumedPath,
      teamBuff: true,
      header: headerTemplate(key, st('stacks')),
      name: trm('condName'),
      states: objKeyMap(symbolsConsumedArr, (symbol) => ({
        name: `${symbol}`,
        fields: [
          {
            node: eleMas,
          },
          {
            text: stg('duration'),
            value: 10,
            unit: 's',
          },
          {
            text: stg('cd'),
            value: 15,
            unit: 's',
          },
        ],
      })),
    },
  ],
}
export default new WeaponSheet(sheet, data)
