import { objKeyMap, range } from '@genshin-optimizer/common/util'
import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import {
  equal,
  input,
  lookup,
  naught,
  percent,
  prod,
} from '@genshin-optimizer/gi/wr'
import { cond, st, stg } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'Predator'

const normalInc = percent(0.1)
const chargedInc = percent(0.1)
const [condPassivePath, condPassive] = cond(key, 'PressTheAdvantage')
const normal_dmg_ = lookup(
  condPassive,
  {
    ...objKeyMap(range(1, 2), (i) => prod(normalInc, i)),
  },
  naught,
)
const charged_dmg_ = lookup(
  condPassive,
  {
    ...objKeyMap(range(1, 2), (i) => prod(chargedInc, i)),
  },
  naught,
)
const atk = equal(input.activeCharKey, 'Aloy', 66)

const data = dataObjForWeaponSheet(key, {
  premod: {
    normal_dmg_,
    charged_dmg_,
    atk,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      header: headerTemplate(key, st('stacks')),
      name: st('hitOp.cryo'),
      states: Object.fromEntries(
        range(1, 2).map((c) => [
          c,
          {
            name: st('stack', { count: c }),
            fields: [
              {
                node: normal_dmg_,
              },
              {
                node: charged_dmg_,
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
