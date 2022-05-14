import type { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { equal, subscript } from "../../../../Formula/utils"
import { WeaponKey } from '../../../../Types/consts'
import { cond, sgt, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "ElegyForTheEnd"
const [, trm] = trans("weapon", key)
const data_gen = data_gen_json as WeaponData
const eleMasInc = [60, 75, 90, 105, 120]
const eleMasInc2 = [100, 125, 150, 175, 200]
const atk_s = [0.20, 0.25, 0.30, 0.35, 0.40]

const [condPath, condNode] = cond(key, "ThePartingRefrain")
const eleMas = subscript(input.weapon.refineIndex, eleMasInc, { key: "eleMas" })
// TODO: These should not stack, similar to NO. But I don't want to copy NO's
// solution, since then these nodes won't show in the team buff panel. And it's
// a bit unlikely people will try to stack this buff
const eleMas2 = equal(condNode, 'on', subscript(input.weapon.refineIndex, eleMasInc2, { key: "eleMas" }))
const atk_ = equal(condNode, 'on', subscript(input.weapon.refineIndex, atk_s,))

export const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    eleMas,
  },
  teamBuff: {
    premod: {
      atk_,
      eleMas: eleMas2
    }
  }
})
const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    header: headerTemplate(key, icon, iconAwaken, st("base")),
    fields: [{
      node: eleMas,
    }],
  }, {
    value: condNode,
    path: condPath,
    teamBuff: true,
    header: headerTemplate(key, icon, iconAwaken, st("conditional")),
    name: trm("condName"),
    states: {
      on: {
        fields: [{
          node: eleMas2
        }, {
          node: atk_
        }, {
          text: sgt("duration"),
          value: 12,
          unit: "s"
        }]
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
