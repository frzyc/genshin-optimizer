import { WeaponData } from 'pipeline'
import { Translate } from '../../../../Components/Translate'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'
import ImgIcon from '../../../../Components/Image/ImgIcon'
import { sgt } from '../../../Characters/SheetUtil'
const tr = (strKey: string) => <Translate ns="weapon_SongOfBrokenPines_gen" key18={strKey} />
const atk_ = [16, 20, 24, 28, 32]
const atkSPD_ = [12, 15, 18, 21, 24]
const condAtk_ = [20, 25, 30, 35, 40]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  stats: stats => ({
    atk_: atk_[stats.weapon.refineIndex]
  }),
  document: [{
    conditional: {
      key: "r",
      partyBuff: "partyAll",
      header: {
        title: tr(`passiveName`),
        icon: stats => <ImgIcon size={2} sx={{ m: -1 }} src={stats.ascension < 2 ? icon : iconAwaken} />,
      },
      description: stats => tr(`passiveDescription.${stats.weapon.refineIndex}`),
      name: <Translate ns="weapon_SongOfBrokenPines" key18="name" />,
      stats: stats => ({
        atk_: condAtk_[stats.weapon.refineIndex],
        atkSPD_: atkSPD_[stats.weapon.refineIndex],
      }),
      fields: [{
        text: sgt("duration"),
        value: 12,
        unit: "s"
      }]
    }
  }],
}
export default weapon