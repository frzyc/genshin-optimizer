import { Translate, TransWrapper } from '../../../Components/Translate'
import { IConditionals } from '../../../Types/IConditional'
import { IWeaponSheet } from '../../../Types/weapon'
import img from './Weapon_Freedom-Sworn.png'
const dmg_ = [10, 12.5, 15, 17.5, 20]
const auto = [16, 20, 24, 28, 32]
const atk_ = [20, 25, 30, 35, 40]
const tr = (strKey: string) => <Translate ns="weapon_FreedomSworn_gen" key18={strKey} />
const conditionals: IConditionals = {
  r: {
    name: <TransWrapper ns="weapon_FreedomSworn" key18="name" />,
    stats: stats => ({
      atk_: atk_[stats.weapon.refineIndex],
      normal_dmg_: auto[stats.weapon.refineIndex],
      charged_dmg_: auto[stats.weapon.refineIndex],
      plunging_dmg_: auto[stats.weapon.refineIndex],
    }),
  }
}
const weapon: IWeaponSheet = {
  name: tr("name"),
  weaponType: "sword",
  img,
  rarity: 5,
  passiveName: tr("passiveName"),
  passiveDescription: stats => tr(`passiveDescription.${stats.weapon.refineIndex}`),
  description: tr("description"),
  baseStats: {
    main: [46, 62, 82, 102, 122, 153, 173, 194, 214, 235, 266, 287, 308, 340, 361, 382, 414, 435, 457, 488, 510, 532, 563, 586, 608],
    substatKey: "eleMas",
    sub: [43, 50, 59, 68, 76, 76, 85, 94, 103, 111, 111, 120, 129, 129, 137, 146, 146, 155, 164, 164, 172, 181, 181, 190, 198],
  },
  stats: stats => ({
    dmg_: dmg_[stats.weapon.refineIndex]
  }),
  conditionals
}
export default weapon