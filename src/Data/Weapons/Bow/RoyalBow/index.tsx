import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { lookup, naught, prod, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { objectKeyMap, range } from '../../../../Util/Util'
import { cond, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet"
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "RoyalBow"
const data_gen = data_gen_json as WeaponData

const critRate_s = [.08, .10, .12, .14, .16]
const [condPassivePath, condPassive] = cond(key, "Focus")
const critRate_ = lookup(condPassive, {
  ...objectKeyMap(range(1, 5), i => prod(subscript(input.weapon.refineIndex, critRate_s), i))
}, naught)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    critRate_
  }
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    value: condPassive,
    path: condPassivePath,
    header: headerTemplate(key, icon, iconAwaken, st("stacks")),
    name: st("opponentsDamaged"),
    states: Object.fromEntries(range(1, 5).map(i => [i, {
      name: st("stack", { count: i }),
      fields: [{
        node: critRate_
      }]
    }]))
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
