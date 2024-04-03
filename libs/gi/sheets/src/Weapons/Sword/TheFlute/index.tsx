import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  constant,
  equal,
  infoMut,
  input,
  percent,
  prod,
} from '@genshin-optimizer/gi/wr'
import { customDmgNode } from '../../../Characters/dataUtil'
import { st } from '../../../SheetUtil'
import type { IWeaponSheet } from '../../IWeaponSheet'
import { WeaponSheet, headerTemplate } from '../../WeaponSheet'
import { dataObjForWeaponSheet } from '../../util'

const key: WeaponKey = 'TheFlute'
const data_gen = allStats.weapon.data[key]

const dmg_ = equal(
  input.weapon.key,
  key,
  customDmgNode(prod(percent(2), input.premod.atk), 'elemental', {
    hit: { ele: constant('physical') },
  })
)

const data = dataObjForWeaponSheet(key, data_gen, undefined, {
  dmg_,
})
const sheet: IWeaponSheet = {
  document: [
    {
      header: headerTemplate(key, st('base')),
      fields: [{ node: infoMut(dmg_, { name: st('dmg') }) }],
    },
  ],
}
export default new WeaponSheet(key, sheet, data_gen, data)
