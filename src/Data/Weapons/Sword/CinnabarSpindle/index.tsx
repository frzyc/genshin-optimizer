import { WeaponData } from 'pipeline'
import { Translate } from '../../../../Components/Translate'
import { input } from '../../../../Formula'
import { equal, prod, subscript } from '../../../../Formula/utils'
import { WeaponKey } from '../../../../Types/consts'
import { cond, trans } from '../../../SheetUtil'
import { dataObjForWeaponSheet } from '../../util'
import WeaponSheet, { conditionaldesc, conditionalHeader, IWeaponSheet } from '../../WeaponSheet'
import iconAwaken from './AwakenIcon.png'
import data_gen_json from './data_gen.json'
import icon from './Icon.png'

const key: WeaponKey = "CinnabarSpindle"
const data_gen = data_gen_json as WeaponData
const [tr] = trans("weapon", key)
const eleDmgIncSrc = [0.4, 0.5, 0.6, 0.7, 0.8]

const [condPassivePath, condPassive] = cond(key, "SpotlessHeart")

// Is this the right formula? Previous version also takes in elemental modifiers it seems
// Should it be input.total or should it be input.premod?
const skill_dmgInc = equal("on", condPassive, prod(subscript(input.weapon.refineIndex, eleDmgIncSrc), input.premod.def))

// Should this be in premod or total?
const data = dataObjForWeaponSheet(key, data_gen, {
  premod: {
    skill_dmgInc
  }
})

const sheet: IWeaponSheet = {
  icon,
  iconAwaken,
  document: [{
    conditional: {
      value: condPassive,
      path: condPassivePath,
      header: conditionalHeader(tr, icon, iconAwaken),
      description: conditionaldesc(tr),
      name: <Translate ns="weapon_CinnabarSpindle" key18="name" />,
      states: {
        on: {
          fields: [{
            node: skill_dmgInc
          }]
        }
      }
    }
  }],
}
export default new WeaponSheet(key, sheet, data_gen, data)
