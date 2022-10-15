import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { equal, subscript } from '../../../../Formula/utils'
import { allElements, WeaponKey } from '../../../../Types/consts'
import { cond, stg, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'
const key: WeaponKey = "TheWidsith"
const data_gen = data_gen_json as WeaponData
const [tr, trm] = trans("weapon", key)

const refinementAtkVals = [0.6, 0.75, 0.9, 1.05, 1.2]
const refinementEleDmgVals = [0.48, 0.6, 0.72, 0.84, 0.96]
const refinementEleMasVals = [240, 300, 360, 420, 480]

const [condPassivePath, condPassive] = cond(key, "Debut")
const atk_ = equal("recitative", condPassive, subscript(input.weapon.refineIndex, refinementAtkVals))
const eleBonus_ = Object.fromEntries(allElements.map(
  ele => [ele, equal("aria", condPassive, subscript(input.weapon.refineIndex, refinementEleDmgVals))]
))
const eleMas = equal("interlude", condPassive, subscript(input.weapon.refineIndex, refinementEleMasVals))

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    atk_,
    ...Object.fromEntries(allElements.map(ele => [`${ele}_dmg_`, eleBonus_[ele]])),
    eleMas
  }
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    value: condPassive,
    path: condPassivePath,
    teamBuff: true,
    header: headerTemplate(key, icon, iconAwaken, st("conditional")),
    name: tr("passiveName"),
    states: {
      aria: {
        name: trm("aria"),
        fields: [
          ...allElements.map(ele => ({ node: eleBonus_[ele] }))
        ,{
          text: stg("duration"),
          value: 10,
          unit: "s"
        }]
      },
      interlude: {
        name: trm("interlude"),
        fields: [{
          node: eleMas
        }, {
          text: stg("duration"),
          value: 10,
          unit: "s"
        }]
      },
      recitative: {
        name: trm("recitative"),
        fields: [{
          node: atk_
        }, {
          text: stg("duration"),
          value: 10,
          unit: "s"
        }]
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
