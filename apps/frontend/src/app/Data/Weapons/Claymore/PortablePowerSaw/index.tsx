import { type WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { objKeyMap, range } from '@genshin-optimizer/util'
import { input } from '../../../../Formula'
import { lookup, naught, prod, subscript } from '../../../../Formula/utils'
import { cond, st, stg, trans } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'

const key: WeaponKey = 'PortablePowerSaw'
const data_gen = allStats.weapon.data[key]
const [, trm] = trans('weapon', key)

const eleMasArr = [-1, 40, 50, 60, 70, 80]

const [condSymbolsConsumedPath, condSymbolsConsumed] = cond(
  key,
  'symbolsConsumed'
)
const symbolsConsumedArr = range(1, 3)
const eleMas = lookup(
  condSymbolsConsumed,
  objKeyMap(symbolsConsumedArr, (symbol) =>
    prod(symbol, subscript(input.weapon.refinement, eleMasArr, { unit: '%' }))
  ),
  naught
)

const data = dataObjForWeaponSheet(key, data_gen, {
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
export default new WeaponSheet(key, sheet, data_gen, data)
