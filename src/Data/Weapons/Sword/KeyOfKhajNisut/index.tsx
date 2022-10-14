import { WeaponData } from 'pipeline'
import { input } from '../../../../Formula'
import { equal, lookup, naught, percent, prod, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { range } from '../../../../Util/Util'
import { cond, sgt, st } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { headerTemplate, IWeaponSheet } from "../../WeaponSheet"
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "KeyOfKhajNisut"
const data_gen = data_gen_json as WeaponData

const selfEmSrc = [0.0012, 0.0015, 0.0018, 0.0021, 0.0024]
const teamEmSrc = [0.002, 0.0025, 0.003, 0.0035, 0.004]
const stacksArr = range(1, 3)
const hp_ = equal(input.weapon.key, key, percent(0.2))

const [condAfterSkillStacksPath, condAfterSkillStacks] = cond(key, "afterSkill")
const selfEleMas = equal(input.weapon.key, key,
  lookup(condAfterSkillStacks, Object.fromEntries(stacksArr.map(stack => [
    stack,
    prod(
      stack,
      subscript(input.weapon.refineIndex, selfEmSrc, { key: "_", fixed: 2 }),
      input.total.hp
    )
  ])), naught)
)
const teamEleMas = equal(input.weapon.key, key,
  equal(condAfterSkillStacks, "3",
    prod(
      subscript(input.weapon.refineIndex, teamEmSrc, { key: "_", fixed: 2 }),
      input.total.hp
    )))

const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    hp_,
  },
  total: {
    eleMas: selfEleMas
  },
  teamBuff: {
    total: {
      eleMas: teamEleMas
    }
  }
}, {
  selfEleMas, teamEleMas
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    header: headerTemplate(key, icon, iconAwaken, st("base")),
    fields: [{ node: hp_ }]
  }, {
    header: headerTemplate(key, icon, iconAwaken, st("stacks")),
    teamBuff: true,
    path: condAfterSkillStacksPath,
    value: condAfterSkillStacks,
    name: st("hitOp.skill"),
    states: Object.fromEntries(stacksArr.map(stack => [
      stack,
      {
        name: st("stack", { count: stack }),
        fields: [{
          node: selfEleMas
        }, {
          text: sgt("duration"),
          value: 20,
          unit: "s"
        }]
      }
    ]))
  }, {
    header: headerTemplate(key, icon, iconAwaken, st("teamBuff")),
    canShow: equal(condAfterSkillStacks, "3", 1),
    teamBuff: true,
    fields: [{
      node: teamEleMas
    }, {
      text: sgt("duration"),
      value: 20,
      unit: "s"
    }]
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
