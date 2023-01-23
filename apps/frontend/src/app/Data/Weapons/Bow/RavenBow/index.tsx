import { WeaponData } from '@genshin-optimizer/pipeline'
import { input } from '../../../../Formula'
import { equal, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { cond, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import data_gen_json from './data_gen.json'

const key: WeaponKey = "RavenBow"
const data_gen = data_gen_json as WeaponData
const [, trm] = trans("weapon", key)

const all_dmg_s = [.12, .15, .18, .21, .24]

const [condPassivePath, condPassive] = cond(key, "BaneOfFlameAndWater")
const all_dmg_ = equal(condPassive, "on", subscript(input.weapon.refineIndex, all_dmg_s))

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
          node: all_dmg_
        }]
      }
    }
  }]
}

export default new WeaponSheet(key, sheet, data_gen, data)
