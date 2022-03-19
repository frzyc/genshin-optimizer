import type { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { lookup, subscript, prod, naught } from "../../../../Formula/utils"
import { WeaponKey } from '../../../../Types/consts'
import { objectKeyMap, range } from '../../../../Util/Util'
import { cond, st, sgt, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { conditionalHeader, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "BlackcliffWarbow"
const data_gen = data_gen_json as WeaponData
const [tr] = trans("weapon", key)
const atkInc = [.12, .15, .18, .21, .24]

const [condPassivePath, condPassive] = cond(key, "PressTheAdvantage")
const atk_ = lookup(condPassive, {
  ...objectKeyMap(range(1, 3), i => prod(subscript(input.weapon.refineIndex, atkInc), i))
}, naught)


const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    atk_
  }
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    conditional: {
      value: condPassive,
      path: condPassivePath,
      header: conditionalHeader(tr, icon, iconAwaken, st("stacks")),
      name: st("afterDefeatEnemy"),
      states: Object.fromEntries(range(1, 3).map(c => [c, {
        name: st("stack", { count: c }),
        fields: [{
          node: atk_
        }, {
          text: sgt("duration"),
          value: 30,
          unit: 's'
        }],
      }]))
    }
  }]
}

export default new WeaponSheet(key, sheet, data_gen, data)