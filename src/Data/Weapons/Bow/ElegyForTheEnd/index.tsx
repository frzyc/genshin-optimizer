import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'
import ImgIcon from '../../../../Components/Image/ImgIcon'
import { Translate } from '../../../../Components/Translate'
import { sgt } from '../../../Characters/SheetUtil'
const tr = (strKey: string) => <Translate ns="weapon_ElegyForTheEnd_gen" key18={strKey} />
const refinementEM = [60, 75, 90, 105, 120]
const eleMass = [100, 125, 150, 175, 200]
const atk_s = [20, 25, 30, 35, 40]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  stats: stats => ({
    eleMas: refinementEM[stats.weapon.refineIndex],
  }),
  document: [{
    conditional: {
      key: "pr",
      partyBuff: "partyAll",
      header: {
        title: tr(`passiveName`),
        icon: stats => <ImgIcon size={2} sx={{ m: -1 }} src={stats.ascension < 2 ? icon : iconAwaken} />,
      },
      description: stats => tr(`passiveDescription.${stats.weapon.refineIndex}`),
      name: <Translate ns="weapon_ElegyForTheEnd" key18="condName" />,
      stats: stats => ({
        eleMas: eleMass[stats.weapon.refineIndex],
        atk_: atk_s[stats.weapon.refineIndex]
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