import { WeaponData } from '@genshin-optimizer/pipeline'
import { input } from '../../../../Formula'
import { constant, equal, infoMut, percent, prod } from '../../../../Formula/utils'
import { WeaponKey } from '@genshin-optimizer/consts'
import { customDmgNode } from '../../../Characters/dataUtil'
import { cond, stg, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from "../../WeaponSheet"
import data_gen_json from './data_gen.json'

const key: WeaponKey = "KagotsurubeIsshin"
const data_gen = data_gen_json as WeaponData

const [condPassivePath, condPassive] = cond(key, "passive")
const atk_ = equal(condPassive, "on", percent(0.15)) // No refinement data
const dmg = equal(input.weapon.key, key,
  customDmgNode(
    prod(
      percent(1.8),
      input.total.atk
    ),
    "elemental",
    { hit: { ele: constant("physical") } }
  )
)

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    atk_
  }
}, {
  dmg
})

const sheet: IWeaponSheet = {
  document: [{
    header: headerTemplate(key, st("base")),
    fields: [{
      node: infoMut(dmg, { name: st("dmg") })
    }]
  }, {
    header: headerTemplate(key, st("conditional")),
    value: condPassive,
    path: condPassivePath,
    name: st("hitOp.normalChargedOrPlunging"),
    states: {
      on: {
        fields: [{
          node: atk_
        }, {
          text: stg("duration"),
          value: 8,
          unit: "s"
        }, {
          text: stg("cd"),
          value: 8,
          unit: "s"
        }]
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
