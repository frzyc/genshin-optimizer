import { Translate } from '../../../Components/Translate'
import { IConditionals } from '../../../Types/IConditional'
import { IWeaponSheet } from '../../../Types/weapon'
import img from './Weapon_Song_of_Broken_Pines.png'
const atk_ = [16, 20, 34, 28, 32]
const atkSPD_ = [12, 15, 18, 21, 24]
const condAtk_ = [20, 25, 30, 35, 40]
const tr = (strKey: string) => <Translate ns="weapon_SongOfBrokenPines_gen" key18={strKey} />
const conditionals: IConditionals = {
  r: {
    name: "Millennial Movement: Banner-Hymn",
    stats: stats => ({
      atk_: condAtk_[stats.weapon.refineIndex],
      atkSPD_: atkSPD_[stats.weapon.refineIndex],
    }),
  }
}
const weapon: IWeaponSheet = {
  name: tr("name"),
  weaponType: "claymore",
  img,
  rarity: 5,
  passiveName: tr("passiveName"),
  passiveDescription: stats => tr(`passiveDescription.${stats.weapon.refineIndex}`),
  description: tr("description"),
  baseStats: {
    main: [49, 68, 93, 119, 145, 176, 203, 230, 258, 286, 317, 346, 374, 406, 435, 464, 495, 525, 555, 586, 617, 648, 679, 709, 741],
    substatKey: "physical_dmg_",
    sub: [4.5, 5.2, 6.1, 7, 8, 8, 8.9, 9.8, 10.7, 11.6, 11.6, 12.5, 13.4, 13.4, 14.3, 15.2, 15.2, 16.1, 17, 17, 17.9, 18.9, 18.9, 19.8, 20.7],
  },
  stats: stats => ({
    atk_: atk_[stats.weapon.refineIndex]
  }),
  conditionals
}
export default weapon