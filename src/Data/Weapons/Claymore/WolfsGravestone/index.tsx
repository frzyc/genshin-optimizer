import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'
import { Translate } from '../../../../Components/Translate'
import ImgIcon from '../../../../Components/Image/ImgIcon'
const tr = (strKey: string) => <Translate ns="weapon_WolfsGravestone_gen" key18={strKey} />
const atk_s = [20, 25, 30, 35, 40]
const atk_partys = [40, 50, 60, 70, 80]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  stats: stats => ({
    atk_: atk_s[stats.weapon.refineIndex]
  }),
  document: [{
    conditional: {
      key: "wt",
      partyBuff: "partyAll",
      header: {
        title: tr(`passiveName`),
        icon: stats => <ImgIcon size={2} sx={{ m: -1 }} src={stats.ascension < 2 ? icon : iconAwaken} />,
      },
      description: stats => tr(`passiveDescription.${stats.weapon.refineIndex}`),
      name: <Translate ns="weapon_WolfsGravestone" key18="condName" />,
      stats: stats => ({
        atk_: atk_partys[stats.weapon.refineIndex]
      })
    }
  }],
}
export default weapon