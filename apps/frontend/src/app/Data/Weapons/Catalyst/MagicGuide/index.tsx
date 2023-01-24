import { WeaponData } from '@genshin-optimizer/pipeline'
import { input } from '../../../../Formula'
import { equal, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '@genshin-optimizer/consts'
import { cond, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import data_gen_json from './data_gen.json'

const key: WeaponKey = "MagicGuide"
const data_gen = data_gen_json as WeaponData
const [, trm] = trans("weapon", key)

const dmgInc = [0.12, 0.15, 0.18, 0.21, 0.24]
const [condPassivePath, condPassive] = cond(key, "BaneOfStormAndTide")
const all_dmg_ = equal("on", condPassive, subscript(input.weapon.refineIndex, dmgInc))
const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    all_dmg_
  }
})

const sheet: IWeaponSheet = {
  document: [{
    value: condPassive,
    path: condPassivePath,
    name: trm("condName"),
    header: headerTemplate(key, st("conditional")),
    states: {
      on: {
        fields: [{
          node: all_dmg_,
        }]
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
