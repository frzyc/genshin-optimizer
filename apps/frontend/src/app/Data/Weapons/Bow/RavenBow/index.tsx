import { WeaponKey } from '@genshin-optimizer/consts'
import { WeaponData } from '@genshin-optimizer/pipeline'
import { input } from '../../../../Formula'
import { equal, subscript } from '../../../../Formula/utils'
import { cond, st } from '../../../SheetUtil'
import { IWeaponSheet } from '../../IWeaponSheet'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate } from '../../WeaponSheet'
import data_gen_json from './data_gen.json'

const key: WeaponKey = "RavenBow"
const data_gen = data_gen_json as WeaponData

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
    name: st("enemyAffected.1or2", { one: st("coloredEle.hydro"), two: st("coloredEle.pyro") }),
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
