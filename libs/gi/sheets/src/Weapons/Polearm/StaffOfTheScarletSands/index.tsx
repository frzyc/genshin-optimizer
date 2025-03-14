import { range } from '@genshin-optimizer/common/util'
import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  equal,
  input,
  lookup,
  naught,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'StaffOfTheScarletSands'

const [condStacksPath, condStacks] = cond(key, 'stacks')

const baseAtkArr = [-1, 0.52, 0.65, 0.78, 0.91, 1.04]
const stacksAttArr = [-1, 0.28, 0.35, 0.42, 0.49, 0.56]
const stacksArr = range(1, 3)
const baseAtk = equal(
  input.weapon.key,
  key,
  prod(
    subscript(input.weapon.refinement, baseAtkArr, { unit: '%' }),
    input.premod.eleMas,
  ),
  { path: 'atk' },
)
const stacksAtk = lookup(
  condStacks,
  Object.fromEntries(
    stacksArr.map((stack) => [
      stack,
      prod(
        stack,
        subscript(input.weapon.refinement, stacksAttArr, { unit: '%' }),
        input.premod.eleMas,
      ),
    ]),
  ),
  naught,
  { path: 'atk' },
)
const atk = equal(input.weapon.key, key, sum(baseAtk, stacksAtk))

const data = dataObjForWeaponSheet(
  key,
  {
    total: {
      atk,
    },
  },
  {
    atk,
  },
)

const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: baseAtk,
        },
      ],
    },
    {
      value: condStacks,
      path: condStacksPath,
      header: headerTemplate(key, st('stacks')),
      name: st('hitOp.skill'),
      states: Object.fromEntries(
        stacksArr.map((i) => [
          i,
          {
            name: st('hits', { count: i }),
            fields: [
              {
                node: stacksAtk,
              },
              {
                text: stg('duration'),
                value: 10,
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
