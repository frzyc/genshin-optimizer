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

const hp_conv = [1, 1.5, 2, 2.5, 3]

export const data = dataObjForWeaponSheet("EverlastingMoonglow", "catalyst",
  { base: data_gen.mainStat.base, lvlCurve: data_gen.mainStat.curve, asc: data_gen.ascension.map(x => x.addStats.atk ?? 0) },
  [
    { stat: data_gen.subStat!.type as any, base: data_gen.subStat!.base, lvlCurve: data_gen.subStat!.curve, },
    { stat: "heal_", refinement: data_gen.addProps.map(x => x.heal_) as any },
  ],
  {
    dmgBonus: {
      normal: prod(subscript(input.weapon.refineIndex, hp_conv))
    }
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
        formula: ["number", "dmgBonus", "normal"], // TODO: is this right?
        variant: stats => stats.characterEle // TODO: should be handled by WR?
      }
    ],
  }],
}
export default weapon
