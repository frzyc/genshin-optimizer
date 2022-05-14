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

const key: WeaponKey = "SongOfBrokenPines"
const data_gen = data_gen_json as WeaponData
const [, trm] = trans("weapon", key)

const atk_Src = [0.16, 0.20, 0.24, 0.28, 0.32]
const atkTeam_Src = [0.20, 0.25, 0.30, 0.35, 0.40]
const atkSPD_Src = [0.12, 0.15, 0.18, 0.21, 0.24]
const [condPassivePath, condPassive] = cond(key, "RebelsBannerHymn")
const atk_ = subscript(input.weapon.refineIndex, atk_Src, { key: "_" })
const atkTeam_ = equal("on", condPassive, subscript(input.weapon.refineIndex, atkTeam_Src, { key: "atk_" }))
const atkSPD_ = equal("on", condPassive, subscript(input.weapon.refineIndex, atkSPD_Src))

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    atk_
  },
  teamBuff: {
    premod: {
      atk_: atkTeam_,
      atkSPD_,
    }
  }
})
const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    header: headerTemplate(key, icon, iconAwaken, st("base")),
    fields: [{ node: atk_ }],
  }, {
    value: condPassive,
    path: condPassivePath,
    teamBuff: true,
    header: headerTemplate(key, icon, iconAwaken, st("conditional")),
    name: trm("name"),
    states: {
      on: {
        fields: [{
          node: atkTeam_
        }, {
          node: atkSPD_
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
