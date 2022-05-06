import type { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { lookup, naught, prod, subscript } from "../../../../Formula/utils"
import { WeaponKey } from '../../../../Types/consts'
import { objectKeyMap, range } from '../../../../Util/Util'
import { cond, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "AlleyHunter"
const data_gen = data_gen_json as WeaponData
const [, trm] = trans("weapon", key)
const dmgInc = [.02, .025, .03, .035, .04]

const [condPassivePath, condPassive] = cond(key, "OppidanAmbush")
const all_dmg_ = lookup(condPassive, {
  ...objectKeyMap(range(1, 10), i => prod(subscript(input.weapon.refineIndex, dmgInc), i))
}, naught)


const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    all_dmg_
  }
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    value: condPassive,
    path: condPassivePath,
    header: headerTemplate(key, icon, iconAwaken, st("conditional")),
    name: trm("condName"),
    states: Object.fromEntries(range(1, 10).map(c => [c, {
      name: st("seconds", { count: c }),
      fields: [{
        node: all_dmg_
      }],
    }]))
  }]
}

export default new WeaponSheet(key, sheet, data_gen, data)
