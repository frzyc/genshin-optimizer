import { Translate } from '../../../Components/Translate'
import { IConditionals } from '../../../Types/IConditional'
import { IWeaponSheet } from '../../../Types/weapon'
import img from './Weapon_Mitternachts_Waltz.png'
const skill_ = [20, 25, 30, 35, 40]
const normal_ = [20, 25, 30, 35, 40]
const conditionals: IConditionals = {
  a: {
    name: <Translate ns="sheet" key18="hitOp.normal" />,
    stats: stats => ({
      skill_dmg_: skill_[stats.weapon.refineIndex],
    })
  },
  s: {
    name: <Translate ns="sheet" key18="hitOp.skill" />,
    stats: stats => ({
      normal_dmg_: normal_[stats.weapon.refineIndex],
    })
  }
}
const tr = (strKey: string) => <Translate ns="weapon_MitternachtsWaltz_gen" key18={strKey} />
const weapon: IWeaponSheet = {
  name: tr("name"),
  weaponType: "bow",
  img,
  rarity: 4,
  passiveName: tr("passiveName"),
  passiveDescription: stats => tr(`passiveDescription.${stats.weapon.refineIndex}`),
  description: tr("description"),
  baseStats: {
    main: [42, 56, 74, 91, 109, 135, 152, 170, 187, 205, 231, 248, 266, 292, 309, 327, 353, 370, 388, 414, 431, 449, 475, 492, 510],
    substatKey: "physical_dmg_",
    sub: [11.3, 13.1, 15.3, 17.6, 19.9, 19.9, 22.2, 24.4, 26.7, 29, 29, 31.3, 33.5, 33.5, 35.8, 38.1, 38.1, 40.4, 42.6, 42.6, 44.9, 47.2, 47.2, 49.5, 51.7],
  },
  conditionals
}
export default weapon