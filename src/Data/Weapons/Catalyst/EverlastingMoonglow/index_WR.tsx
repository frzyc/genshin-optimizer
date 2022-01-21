import { WeaponData } from 'pipeline'
import { Translate } from '../../../../Components/Translate'
import { IWeaponSheet } from '../../../../Types/weapon_WR'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'
import { prod, subscript } from "../../../../Formula/utils"
import { dataObjForWeaponSheet } from '../../../../Formula/api'
import { input } from '../../../../Formula/index'
import data_gen_json from './data_gen.json'
const data_gen = data_gen_json as WeaponData

const hp_conv = [0.01, 0.015, 0.02, 0.025, 0.03]

const normalDmgInc = prod(subscript(input.weapon.refineIndex, hp_conv, { key: '_' }), input.premod.hp)
normalDmgInc.info = { key: "normal_dmg_inc" }
export const data = dataObjForWeaponSheet("EverlastingMoonglow", "catalyst",
  { base: data_gen.mainStat.base, lvlCurve: data_gen.mainStat.curve, asc: data_gen.ascension.map(x => x.addStats.atk ?? 0) },
  { stat: data_gen.subStat!.type, base: data_gen.subStat!.base, lvlCurve: data_gen.subStat!.curve, },
  { stat: "heal_", refinement: data_gen.addProps.map(x => x.heal_) as any },
  {
    normalDmgInc
  }
)
const weapon: IWeaponSheet = {
  weaponType: data_gen.weaponType,
  rarity: data_gen.rarity,
  icon,
  iconAwaken,
  document: [{
    fields: [
      {
        text: <Translate ns="weapon_EverlastingMoonglow" key18="name" />,
        node: normalDmgInc,
      }
    ],
  }],
}
export default weapon
