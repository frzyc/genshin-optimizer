import type { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { equal, lookup, naught, percent, prod } from "../../../../Formula/utils"
import { WeaponKey } from '../../../../Types/consts'
import { objectKeyMap, range } from '../../../../Util/Util'
import { cond, sgt, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet"
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "Predator"
const data_gen = data_gen_json as WeaponData

const normalInc = percent(.1)
const chargedInc = percent(.1)
const [condPassivePath, condPassive] = cond(key, "PressTheAdvantage")
const normal_dmg_ = lookup(condPassive, {
  ...objectKeyMap(range(1, 2), i => prod(normalInc, i))
}, naught)
const charged_dmg_ = lookup(condPassive, {
  ...objectKeyMap(range(1, 2), i => prod(chargedInc, i))
}, naught)
const atk = equal(input.activeCharKey, "Aloy", 66)


const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    normal_dmg_,
    charged_dmg_,
    atk
  }
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    value: condPassive,
    path: condPassivePath,
    header: headerTemplate(key, icon, iconAwaken, st("stacks")),
    name: st("hitOp.cryo"),
    states: Object.fromEntries(range(1, 2).map(c => [c, {
      name: st("stack", { count: c }),
      fields: [{
        node: normal_dmg_
      }, {
        node: charged_dmg_
      }, {
        text: sgt("duration"),
        value: 6,
        unit: 's'
      }],
    }]))
  }]
}

export default new WeaponSheet(key, sheet, data_gen, data)
