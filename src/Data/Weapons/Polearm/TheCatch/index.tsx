import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet"
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "TheCatch"
const data_gen = data_gen_json as WeaponData

const burstDmgSrc_ = [0.16, 0.2, 0.24, 0.28, 0.32]
const burstCritSrc_ = [0.06, 0.075, 0.09, 0.105, 0.12]
const burst_dmg_ = subscript(input.weapon.refineIndex, burstDmgSrc_)
const burst_critRate_ = subscript(input.weapon.refineIndex, burstCritSrc_)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    burst_dmg_,
    burst_critRate_,
  }
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    header: headerTemplate(key, icon, iconAwaken, st("base")),
    fields: [{ node: burst_dmg_ }, { node: burst_critRate_ }],
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
