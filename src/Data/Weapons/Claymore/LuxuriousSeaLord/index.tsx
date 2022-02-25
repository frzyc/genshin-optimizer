import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { constant, equal, prod, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { customDmgNode } from '../../../Characters/dataUtil'
import { cond, sgt, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { conditionaldesc, conditionalHeader, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "SongOfBrokenPines"
const data_gen = data_gen_json as WeaponData
const [tr] = trans("weapon", key)
const burst_dmg_Src = [0.12, 0.15, 0.18, 0.21, 0.24]
const dmg_Src = [1, 1.25, 1.5, 1.75, 2]

const burst_dmg_ = subscript(input.weapon.refineIndex, burst_dmg_Src)
const [condPassivePath, condPassive] = cond(key, "OceanicVictory")
// TODO: Is this the correct formula for the dmg dealt from the fishes?
const dmg_ = equal(condPassive, 'on', customDmgNode(prod(subscript(input.weapon.refineIndex, dmg_Src, { key: "_" }), input.premod.atk), "elemental", {
  hit: { ele: constant("physical") }
}))

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    burst_dmg_
  },
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    fields: [{ node: burst_dmg_ }],
    conditional: {
      value: condPassive,
      path: condPassivePath,
      teamBuff: true,
      header: conditionalHeader(tr, icon, iconAwaken),
      description: conditionaldesc(tr),
      name: sgt('hitOp.burst'),
      states: {
        on: {
          fields: [{
            node: dmg_
          }]
        }
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
