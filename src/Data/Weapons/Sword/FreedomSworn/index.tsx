import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { equal, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { cond, sgt, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet"
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "FreedomSworn"
const data_gen = data_gen_json as WeaponData
const [, trm] = trans("weapon", key)

const [condPassivePath, condPassive] = cond(key, "MillennialMovement")
const autoSrc = [0.16, 0.20, 0.24, 0.28, 0.32]
const atk_Src = [0.2, 0.25, 0.3, 0.35, 0.40]
const dmg_ = subscript(input.weapon.refineIndex, data_gen.addProps.map(x => x.dmg_ ?? NaN))
// TODO: These should not stack, similar to NO. But I don't want to copy NO's
// solution, since then these nodes won't show in the team buff panel. And it's
// a bit unlikely people will try to stack this buff
const atk_ = equal("on", condPassive, subscript(input.weapon.refineIndex, atk_Src))
const normal_dmg_ = equal("on", condPassive, subscript(input.weapon.refineIndex, autoSrc))
const charged_dmg_ = { ...normal_dmg_ }
const plunging_dmg_ = { ...normal_dmg_ }

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    all_dmg_: dmg_
  },
  teamBuff: {
    premod: {
      atk_,
      normal_dmg_,
      charged_dmg_,
      plunging_dmg_,
    }
  }
})
const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    header: headerTemplate(key, icon, iconAwaken, st("base")),
    fields: [{ node: dmg_ }],
  }, {
    value: condPassive,
    path: condPassivePath,
    teamBuff: true,
    header: headerTemplate(key, icon, iconAwaken, st("conditional")),
    name: trm("sigilsConsumed"),
    states: {
      on: {
        fields: [{
          node: atk_
        }, {
          node: normal_dmg_
        }, {
          node: charged_dmg_
        }, {
          node: plunging_dmg_
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
