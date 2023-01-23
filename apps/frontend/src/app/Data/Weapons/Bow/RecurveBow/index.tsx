import type { WeaponData } from '@genshin-optimizer/pipeline'
import { input } from '../../../../Formula'
import { equal, infoMut, prod, subscript } from "../../../../Formula/utils"
import { WeaponKey } from '../../../../Types/consts'
import { customHealNode } from '../../../Characters/dataUtil'
import { stg, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from "../../WeaponSheet"
import data_gen_json from './data_gen.json'

const key: WeaponKey = "RecurveBow"
const data_gen = data_gen_json as WeaponData

const healing_s = [.08, .10, .12, .14, .16]
const healing = equal(input.weapon.key, key,
  customHealNode(prod(input.total.hp, subscript(input.weapon.refineIndex, healing_s))))

const data = dataObjForWeaponSheet(key, data_gen, undefined, { healing })

const sheet: IWeaponSheet = {
  document: [{
    header: headerTemplate(key, st("base")),
    fields: [{
      node: infoMut(healing, { name: stg("healing"), variant: "heal" })
    }]
  }]
}

export default new WeaponSheet(key, sheet, data_gen, data)
