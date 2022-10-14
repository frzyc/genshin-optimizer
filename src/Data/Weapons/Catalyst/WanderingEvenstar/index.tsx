import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { equal, infoMut, percent, prod, subscript, unequal } from '../../../../Formula/utils'
import KeyMap from '../../../../KeyMap'
import { WeaponKey } from '../../../../Types/consts'
import { cond, stg, st, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "WanderingEvenstar"
const data_gen = data_gen_json as WeaponData
const [, trm] = trans("weapon", key)

const [condPassivePath, condPassive] = cond(key, "passive")
const atkArr = [0.24, 0.3, 0.36, 0.42, 0.48]
const selfAtk = equal(input.weapon.key, key, equal("on", condPassive, prod(
  subscript(input.weapon.refineIndex, atkArr, { unit: "%" }),
  input.premod.eleMas
)))
const teamAtkDisp = equal(input.weapon.key, key, prod(percent(0.3), selfAtk))
const teamAtk = unequal(input.activeCharKey, input.charKey, teamAtkDisp)

const data = dataObjForWeaponSheet(key, data_gen, {
  total: {
    atk: selfAtk
  },
  teamBuff: {
    total: {
      atk: teamAtk
    }
  }
}, {
  selfAtk,
  teamAtkDisp
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    value: condPassive,
    path: condPassivePath,
    teamBuff: true,
    name: trm("condName"),
    header: headerTemplate(key, icon, iconAwaken, st("conditional")),
    states: {
      on: {
        fields: [{
          node: selfAtk
        }, {
          text: stg("duration"),
          value: 12,
          unit: "s"
        }]
      }
    }
  }, {
    header: headerTemplate(key, icon, iconAwaken, st("teamBuff")),
    teamBuff: true,
    canShow: equal(condPassive, "on", 1),
    fields: [{
      node: infoMut(teamAtkDisp, { ...KeyMap.info("atk"), isTeamBuff: true }),
    }, {
      text: stg("duration"),
      value: 12,
      unit: "s"
    }]
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
