import { WeaponData } from 'pipeline'
import { equal, percent } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { cond, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "SacrificialSword"
const data_gen = data_gen_json as WeaponData
const [, trm] = trans("weapon", key)

// TODO: Should this be in: premod { cdRed_ }? Previous sheet uses cdRed_ instead 
// Or this doesn't even affect cdRed considering the passive resets the skill cooldown instead of reduction
const [condPassivePath, condPassive] = cond(key, "Composed")
const cdRed_ = equal(condPassive, 'on', percent(1))

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    cdRed_,
  },
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    conditional: {
      value: condPassive,
      path: condPassivePath,
      name: trm("condName"),
      states: {
        on: {
          fields: [{
            node: cdRed_
          },]
        }
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
