import type { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { equal, lookup, naught, subscript } from "../../../../Formula/utils"
import { WeaponKey } from '../../../../Types/consts'
import { cond, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "Deathmatch"
const data_gen = data_gen_json as WeaponData

const [, trm] = trans("weapon", key)

const [condStackPath, condStack] = cond(key, "stack")
const atkDefInc = [0.16, 0.2, 0.24, 0.28, 0.32]
const atkInc = [0.24, 0.3, 0.36, 0.42, 0.48]
const atk_ = lookup(condStack, { "oneOrNone": subscript(input.weapon.refineIndex, atkInc, { key: "_" }), "moreThanOne": subscript(input.weapon.refineIndex, atkDefInc, { key: "_" }) }, naught)
const def_ = equal(condStack, "moreThanOne", subscript(input.weapon.refineIndex, atkDefInc, { key: "_" }))

export const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    atk_,
    def_
  },
})
const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    value: condStack,
    path: condStackPath,
    teamBuff: true,
    header: headerTemplate(key, icon, iconAwaken, st("conditional")),
    name: trm("condName"),
    states: {
      "oneOrNone": {
        name: trm("opponents.oneOrNone"),
        fields: [{ node: atk_ }, { node: def_ }]
      },
      "moreThanOne": {
        name: trm("opponents.moreThanOne"),
        fields: [{ node: atk_ }, { node: def_ }]
      },
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
