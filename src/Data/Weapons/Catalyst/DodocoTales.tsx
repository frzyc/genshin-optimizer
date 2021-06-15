import { Translate } from '../../../Components/Translate'
import { IConditionals } from '../../../Types/IConditional'
import { IWeaponSheet } from '../../../Types/weapon'
import img from './Weapon_Dodoco_Tales.png'
const cdmg_ = [16, 20, 24, 28, 32]
const atk_ = [8, 10, 12, 14, 16]
const conditionals: IConditionals = {
  a: {
    name: <Translate ns="sheet" key18="hitOp.normal" />,
    stats: stats => ({
      charged_dmg_: cdmg_[stats.weapon.refineIndex],
    })
  },
  c: {
    name: <Translate ns="sheet" key18="hitOp.charged" />,
    stats: stats => ({
      atk_: atk_[stats.weapon.refineIndex],
    })
  }
}
const tr = (strKey: string) => <Translate ns="weapon_DodocoTales_gen" key18={strKey} />
const weapon: IWeaponSheet = {
  name: tr("name"),
  weaponType: "catalyst",
  img,
  rarity: 4,
  passiveName: tr("passiveName"),
  passiveDescription: stats => tr(`passiveDescription.${stats.weapon.refineIndex}`),
  description: tr("description"),
  baseStats: {
    main: [41, 54, 69, 84, 99, 125, 140, 155, 169, 184, 210, 224, 238, 264, 278, 293, 319, 333, 347, 373, 387, 401, 427, 440, 454],
    substatKey: "atk_",
    sub: [12, 13.9, 16.4, 18.8, 21.2, 21.2, 23.6, 26.1, 28.5, 30.9, 30.9, 33.3, 35.7, 35.7, 38.2, 40.6, 40.6, 43, 45.4, 45.4, 47.9, 50.3, 50.3, 52.7, 55.1],
  },
  conditionals
}
export default weapon