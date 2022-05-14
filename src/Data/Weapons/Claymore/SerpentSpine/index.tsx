import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { lookup, naught, prod, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { objectKeyMap, range } from '../../../../Util/Util'
import { cond, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet"
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "SerpentSpine"
const data_gen = data_gen_json as WeaponData
const [, trm] = trans("weapon", key)

const all_dmg_s = [0.06, 0.07, 0.08, 0.09, 0.1]
const takeDMG_s = [3, 2.7, 2.4, 2.2, 2]

const [condPassivePath, condPassive] = cond(key, "Wavesplitter")
const all_dmg_ = subscript(input.weapon.refineIndex, all_dmg_s, { key: "_" })
const all_dmg_stack = lookup(condPassive, {
  ...objectKeyMap(range(1, 5), i => prod(all_dmg_, i)),
}, naught)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    all_dmg_: all_dmg_stack
  },
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    value: condPassive,
    path: condPassivePath,
    header: headerTemplate(key, icon, iconAwaken, st("stacks")),
    name: st("activeCharField"),
    states: {
      ...objectKeyMap(range(1, 5), i => ({
        name: st("seconds", { count: i * 4 }),
        fields: [{
          node: all_dmg_stack
        }, {
          text: trm("takeMoreDmg"),
          value: data => takeDMG_s[data.get(input.weapon.refineIndex).value] * i,
          unit: "%"
        }]
      })),
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
