import type { WeaponKey } from '@genshin-optimizer/consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { input } from '../../../../Formula'
import { lookup, naught, prod, subscript } from '../../../../Formula/utils'
import { objectKeyMap, range } from '../../../../Util/Util'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'IbisPiercer'
const data_gen = allStats.weapon.data[key]

const stacksArr = range(1, 2)
const emArr = [40, 50, 60, 70, 80]

const [condPassiveStacksPath, condPassiveStacks] = cond(key, 'passiveStacks')
const eleMas = lookup(
  condPassiveStacks,
  objectKeyMap(stacksArr, (stack) =>
    prod(subscript(input.weapon.refineIndex, emArr), stack)
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
        ])
      ),
    },
  ],
}

export default new WeaponSheet(key, sheet, data_gen, data)
