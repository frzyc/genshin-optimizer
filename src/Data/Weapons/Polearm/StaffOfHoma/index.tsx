import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { equal, infoMut, prod, subscript, sum } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { cond, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "StaffOfHoma"
const data_gen = data_gen_json as WeaponData

const hpInc = [0.2, 0.25, 0.3, 0.35, 0.4]
const atkInc = [0.008, 0.01, 0.012, 0.014, 0.016]
const lowHpAtkInc = [0.01, 0.012, 0.014, 0.016, 0.018]
const hp_ = subscript(input.weapon.refineIndex, hpInc, { key: "_" })
const [condPassivePath, condPassive] = cond(key, "RecklessCinnabar")
const atk1 = prod(subscript(input.weapon.refineIndex, atkInc, { key: "_" }), input.premod.hp)
const atk2 = equal(input.weapon.key, key,
  equal("on", condPassive, prod(subscript(input.weapon.refineIndex, lowHpAtkInc, { key: "_" }), input.premod.hp), { key: "atk" }))
const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    hp_,
  },
  total: {
    atk: sum(atk1, atk2)
  }
}, {
  atk2_: atk2
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    header: headerTemplate(key, icon, iconAwaken, st("base")),
    fields: [{
      node: hp_
    }, {
      node: infoMut(atk1, { key: "atk" })
    }],
  }, {
    value: condPassive,
    path: condPassivePath,
    teamBuff: true,
    header: headerTemplate(key, icon, iconAwaken),
    name: st("lessPercentHP", { percent: 50 }),
    states: {
      on: {
        fields: [{
          node: infoMut(atk2, { key: "atk" }),
        }]
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
