import type { WeaponData } from '@genshin-optimizer/pipeline'
import { input } from '../../../../Formula'
import { lookup, naught, percent, prod, subscript } from "../../../../Formula/utils"
import { allElementKeys, WeaponKey } from '@genshin-optimizer/consts'
import { objectKeyMap, range } from '../../../../Util/Util'
import { cond, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import { IWeaponSheet } from '../../IWeaponSheet'
import WeaponSheet, { headerTemplate } from "../../WeaponSheet"
import data_gen_json from './data_gen.json'

const key: WeaponKey = "LostPrayerToTheSacredWinds"
const data_gen = data_gen_json as WeaponData
const ele_dmg_s = [0.08, 0.10, 0.12, 0.14, 0.16]

const [condPassivePath, condPassive] = cond(key, "BoundlessBlessing")

const moveSPD_ = percent(0.1)
const eleDmgInc = subscript(input.weapon.refineIndex, ele_dmg_s, { unit: "%" })
const eleDmgStacks = Object.fromEntries(allElementKeys.map(ele => [ele, lookup(condPassive, {
  ...objectKeyMap(range(1, 4), i => prod(eleDmgInc, i)),
}, naught)]))

export const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    moveSPD_,
    ...Object.fromEntries(allElementKeys.map(ele => [`${ele}_dmg_`, eleDmgStacks[ele]])),
  },
})
const sheet: IWeaponSheet = {
  document: [{
    header: headerTemplate(key, st("base")),
    fields: [{ node: moveSPD_ }],
  }, {
    value: condPassive,
    path: condPassivePath,
    header: headerTemplate(key, st("stacks")),
    name: st("activeCharField"),
    states: objectKeyMap(range(1, 4), i => ({
      name: st("seconds", { count: i * 4 }),
      fields: allElementKeys.map(ele => ({ node: eleDmgStacks[ele] }))
    }))
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
