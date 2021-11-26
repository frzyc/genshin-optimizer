import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'
import ImgIcon from '../../../../Components/Image/ImgIcon'
import { Translate } from '../../../../Components/Translate'
const tr = (strKey: string) => <Translate ns="weapon_ThrillingTalesOfDragonSlayers_gen" key18={strKey} />
const refinementVals = [24, 30, 36, 42, 48]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  document: [{
    conditional: {// Heritage
      key: "h",
      partyBuff: "partyActive",
      canShow: stats => !stats.activeCharacter, // When calculating in the context of the char equipped, the char cannot be active.
      header: {
        title: tr(`passiveName`),
        icon: stats => <ImgIcon size={2} sx={{ m: -1 }} src={stats.ascension < 2 ? icon : iconAwaken} />,
      },
      description: stats => tr(`passiveDescription.${stats.weapon.refineIndex}`),
      name: <Translate ns="weapon_ThrillingTalesOfDragonSlayers" key18="condName" />,
      stats: stats => ({
        atk_: refinementVals[stats.weapon.refineIndex]
      })
    }
  }]

}
export default weapon