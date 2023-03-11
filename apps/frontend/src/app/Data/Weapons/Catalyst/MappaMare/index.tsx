import type { WeaponKey } from '@genshin-optimizer/consts'
import { allElementKeys } from '@genshin-optimizer/consts'
import type { WeaponData } from '@genshin-optimizer/pipeline'
import { input } from '../../../../Formula'
import { lookup, naught, prod, subscript } from '../../../../Formula/utils'
import { objectKeyMap, objectKeyValueMap, range } from '../../../../Util/Util'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import data_gen_json from './data_gen.json'

const key: WeaponKey = 'MappaMare'
const data_gen = data_gen_json as WeaponData

const [condPassivePath, condPassive] = cond(key, 'InfusionScroll')

const dmgBonus = [0.08, 0.1, 0.12, 0.14, 0.16]
const allDmgInc = subscript(input.weapon.refineIndex, dmgBonus)
const eleDmgs = objectKeyValueMap(allElementKeys, (e) => [
  `${e}_dmg_`,
  lookup(
    condPassive,
    {
      ...objectKeyMap(range(1, 2), (i) => prod(allDmgInc, i)),
    },
    naught
  ),
])

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: eleDmgs,
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      header: headerTemplate(key, st('stacks')),
      name: st('afterReaction'),
      states: objectKeyMap(range(1, 2), (i) => ({
        name: st('stack', { count: i }),
        fields: [
          ...Object.values(eleDmgs).map((node) => ({ node })),
          {
            text: stg('duration'),
            value: 10,
            unit: 's',
          },
        ],
      })),
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
