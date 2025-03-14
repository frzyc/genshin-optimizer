import { objKeyMap, objKeyValMap, range } from '@genshin-optimizer/common/util'
import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { allElementKeys } from '@genshin-optimizer/gi/consts'
import {
  input,
  lookup,
  naught,
  prod,
  subscript,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'MappaMare'

const [condPassivePath, condPassive] = cond(key, 'InfusionScroll')

const dmgBonus = [-1, 0.08, 0.1, 0.12, 0.14, 0.16]
const allDmgInc = subscript(input.weapon.refinement, dmgBonus)
const eleDmgs = objKeyValMap(allElementKeys, (e) => [
  `${e}_dmg_`,
  lookup(
    condPassive,
    {
      ...objKeyMap(range(1, 2), (i) => prod(allDmgInc, i)),
    },
    naught,
  ),
])

const data = dataObjForWeaponSheet(key, {
  premod: eleDmgs,
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      header: headerTemplate(key, st('stacks')),
      name: st('afterReaction'),
      states: objKeyMap(range(1, 2), (i) => ({
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
export default new WeaponSheet(sheet, data)
