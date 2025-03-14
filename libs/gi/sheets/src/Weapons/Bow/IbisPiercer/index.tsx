import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { WeaponKey } from '@genshin-optimizer/gi/consts'
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

const key: WeaponKey = 'IbisPiercer'

const stacksArr = range(1, 2)
const emArr = [-1, 40, 50, 60, 70, 80]

const [condPassiveStacksPath, condPassiveStacks] = cond(key, 'passiveStacks')
const eleMas = lookup(
  condPassiveStacks,
  objKeyMap(stacksArr, (stack) =>
    prod(subscript(input.weapon.refinement, emArr), stack),
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
      value: condPassiveStacks,
      path: condPassiveStacksPath,
      header: headerTemplate(key, st('stacks')),
      name: st('hitOp.charged'),
      states: Object.fromEntries(
        stacksArr.map((stack) => [
          stack,
          {
            name: st('stack', { count: stack }),
            fields: [
              {
                node: eleMas,
              },
              {
                text: stg('duration'),
                value: 6,
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
