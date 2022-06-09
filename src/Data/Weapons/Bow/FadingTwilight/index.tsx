import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { lookup, naught, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { cond, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "FadingTwilight"
const data_gen = data_gen_json as WeaponData
const [, trm] = trans("weapon", key)

const [condStatePath, condState] = cond(key, "state")
const state_dmg_dict = {
  evengleam: subscript(input.weapon.refineIndex, [0.06, 0.075, 0.09, 0.105, 0.12]),
  afterglow: subscript(input.weapon.refineIndex, [0.1, 0.125, 0.15, 0.175, 0.20]),
  dawnblaze: subscript(input.weapon.refineIndex, [0.14, 0.175, 0.21, 0.245, 0.28])
}
const state_dmg_ = lookup(condState, state_dmg_dict, naught)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    all_dmg_: state_dmg_
  }
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    value: condState,
    path: condStatePath,
    header: headerTemplate(key, icon, iconAwaken, st("conditional")),
    name: trm("condName"),
    states: Object.fromEntries(Object.keys(state_dmg_dict).map(state => [
      state,
      {
        name: trm(`states.${state}`),
        fields: [{ node: state_dmg_ }]
      }]))
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
