import type { WeaponData } from '@genshin-optimizer/pipeline'
import { input } from '../../../../Formula'
import { constant, equal, infoMut, percent, prod, subscript } from "../../../../Formula/utils"
import { WeaponKey } from '../../../../Types/consts'
import { customDmgNode } from '../../../Characters/dataUtil'
import { st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet"
import data_gen_json from './data_gen.json'

const key: WeaponKey = "SkywardHarp"
const data_gen = data_gen_json as WeaponData

const critd_s = [.20, .25, .30, .35, .40]
const dmgPerc = percent(1.25)
const critDMG_ = subscript(input.weapon.refineIndex, critd_s)
const dmg = equal(input.weapon.key, key,
  customDmgNode(prod(dmgPerc, input.total.atk), "elemental", { hit: { ele: constant("physical") } }))

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    critDMG_
  },
}, {
  dmg
})

const sheet: IWeaponSheet = {
  document: [{
    header: headerTemplate(key, st("base")),
    fields: [{
      node: critDMG_
    }, {
      node: infoMut(dmg, { name: st("dmg") })
    }]
  }]
}

export default new WeaponSheet(key, sheet, data_gen, data)
