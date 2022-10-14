import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { equal, infoMut, percent, prod, subscript, unequal } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { cond, sgt, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet"
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "XiphosMoonlight"
const data_gen = data_gen_json as WeaponData
const [, trm] = trans("weapon", key)

const [condPassivePath, condPassive] = cond(key, "passive")

const enerRech_arr = [0.00036, 0.00045, 0.00054, 0.00063, 0.00072]
const selfEnerRech_ = equal(input.weapon.key, key, equal(condPassive, "on",
  prod(
    subscript(input.weapon.refineIndex, enerRech_arr, { key: "_", fixed: 3 }),
    input.premod.eleMas,
  )
))
const teamEnerRech_disp = equal(input.weapon.key, key, prod(percent(0.3), selfEnerRech_))
const teamEnerRech_ = unequal(input.activeCharKey, input.charKey, teamEnerRech_disp)

const data = dataObjForWeaponSheet(key, data_gen, {
  total: {
    enerRech_: selfEnerRech_
  },
  teamBuff: {
    total: {
      enerRech_: teamEnerRech_
    }
  }
}, {
  selfEnerRech_,
  teamEnerRech_disp
})
const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    header: headerTemplate(key, icon, iconAwaken, st("conditional")),
    path: condPassivePath,
    value: condPassive,
    name: trm("condName"),
    teamBuff: true,
    states: {
      on: {
        fields: [{
          node: selfEnerRech_,
        }, {
          text: sgt("duration"),
          value: 12,
          unit: "s"
        }]
      }
    }
  }, {
    header: headerTemplate(key, icon, iconAwaken, st("teamBuff")),
    teamBuff: true,
    canShow: equal(condPassive, "on", 1),
    fields: [{
      node: infoMut(teamEnerRech_disp, { key: "enerRech_", isTeamBuff: true }),
    }, {
        text: sgt("duration"),
        value: 12,
        unit: "s"
    }]
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
