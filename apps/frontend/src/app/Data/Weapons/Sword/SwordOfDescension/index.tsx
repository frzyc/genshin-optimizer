import { objKeyMap } from '@genshin-optimizer/common/util'
import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { allTravelerKeys } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { input } from '../../../../Formula'
import {
  constant,
  equal,
  infoMut,
  lookup,
  naught,
  percent,
  prod,
} from '../../../../Formula/utils'
import { customDmgNode } from '../../../Characters/dataUtil'
import { st } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'SwordOfDescension'
const data_gen = allStats.weapon.data[key]

const atk = lookup(
  input.charKey,
  objKeyMap(allTravelerKeys, (_) => constant(66)),
  naught
)
const dmg_ = equal(
  input.weapon.key,
  key,
  customDmgNode(prod(percent(2), input.premod.atk), 'elemental', {
    hit: { ele: constant('physical') },
  })
)

const data = dataObjForWeaponSheet(
  key,
  data_gen,
  {
    premod: {
      atk,
    },
  },
  {
    dmg_,
  }
)
const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [
        {
          node: atk,
        },
        {
          node: infoMut(dmg_, { name: st('dmg') }),
        },
      ],
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
