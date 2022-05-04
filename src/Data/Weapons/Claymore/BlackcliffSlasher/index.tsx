import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { constant, lookup, prod, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { objectKeyMap, range } from '../../../../Util/Util'
import { cond, sgt, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet"
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "BlackcliffSlasher"
const data_gen = data_gen_json as WeaponData

const [condPassivePath, condPassive] = cond(key, "PressTheAdvantage")
const opponentsDefeated = range(1, 3)
const atkInc = [0.12, 0.15, 0.18, 0.21, 0.24]
const atk_ = prod(lookup(condPassive, objectKeyMap(opponentsDefeated, i => constant(i)), 0),
  subscript(input.weapon.refineIndex, atkInc))

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    atk_: atk_
  }
})
const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    value: condPassive,
    path: condPassivePath,
    header: headerTemplate(key, icon, iconAwaken, st("stacks")),
    name: st("afterDefeatEnemy"),
    states:
      Object.fromEntries(opponentsDefeated.map(c => [c, {
        name: st("stack", { count: c }),
        fields: [{
          node: atk_,
        }, {
          text: sgt("duration"),
          value: 30,
          unit: "s"
        }]
      }]))
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
