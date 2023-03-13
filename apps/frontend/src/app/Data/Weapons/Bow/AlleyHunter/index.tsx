import type { WeaponData } from '@genshin-optimizer/pipeline'
import { input } from '../../../../Formula'
import { lookup, naught, prod, subscript } from '../../../../Formula/utils'
import type { WeaponKey } from '@genshin-optimizer/consts'
import { objectKeyMap, range } from '../../../../Util/Util'
import { cond, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import data_gen_json from './data_gen.json'

const key: WeaponKey = 'AlleyHunter'
const data_gen = data_gen_json as WeaponData
const [, trm] = trans('weapon', key)
const dmgInc = [0.02, 0.025, 0.03, 0.035, 0.04]

const [condPassivePath, condPassive] = cond(key, 'OppidanAmbush')
const all_dmg_ = lookup(
  condPassive,
  {
    ...objectKeyMap(range(1, 10), (i) =>
      prod(subscript(input.weapon.refineIndex, dmgInc), i)
    ),
  },
  naught
)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    all_dmg_,
  },
})

const sheet: IWeaponSheet = {
  document: [
    {
      value: condPassive,
      path: condPassivePath,
      header: headerTemplate(key, st('conditional')),
      name: trm('condName'),
      states: Object.fromEntries(
        range(1, 10).map((c) => [
          c,
          {
            name: st('seconds', { count: c }),
            fields: [
              {
                node: all_dmg_,
              },
            ],
          },
        ])
      ),
    },
  ],
}

export default new WeaponSheet(key, sheet, data_gen, data)
