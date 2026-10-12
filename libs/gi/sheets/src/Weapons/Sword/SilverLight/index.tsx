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
import { dataObjForWeaponSheet } from '../../util'
import { headerTemplate, WeaponSheet } from '../../WeaponSheet'

const key: WeaponKey = 'SilverLight'

const [condPassivePath, condPassive] = cond(key, 'passive')
const stacksArr = range(1, 2)
const eleMasArr = [-1, 52, 65, 78, 91, 104]
const stacks = lookup(
  condPassive,
  objKeyMap(stacksArr, (i) => constant(i)),
  0
)
const eleMas = prod(stacks, subscript(input.weapon.refinement, eleMasArr))

const data = dataObjForWeaponSheet(key, {
  premod: {
    eleMas,
  },
})
const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      header: headerTemplate(key, st('stacks')),
      name: st('afterUse.skill'),
      states: objKeyMap(stacksArr, (stack) => ({
        name: st('stack', { count: stack }),
        fields: [
          {
            node: eleMas,
          },
          {
            text: stg('duration'),
            value: 12,
            unit: 's',
          },
        ],
      })),
    },
  ],
}
export default new WeaponSheet(sheet, data)
