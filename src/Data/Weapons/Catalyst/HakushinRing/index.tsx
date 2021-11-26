import { WeaponData } from 'pipeline'
import { IWeaponSheet } from '../../../../Types/weapon'
import data_gen from './data_gen.json'
import icon from './Icon.png'
import iconAwaken from './AwakenIcon.png'
import { Translate } from '../../../../Components/Translate'
import ImgIcon from '../../../../Components/Image/ImgIcon'
import ColorText from '../../../../Components/ColoredText'
import { sgt } from '../../../Characters/SheetUtil'
const refinementVals = [10, 12.5, 15, 17.5, 20]
const tr = (strKey: string) => <Translate ns="weapon_HakushinRing_gen" key18={strKey} />
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  document: [{
    conditional: {
      key: "r",
      partyBuff: "partyOnly",
      header: {
        title: tr(`passiveName`),
        icon: stats => <ImgIcon size={2} sx={{ m: -1 }} src={stats.ascension < 2 ? icon : iconAwaken} />,
      },
      description: stats => tr(`passiveDescription.${stats.weapon.refineIndex}`),
      name: "After Electro Elemental Reaction",
      states: {
        an: {
          name: <ColorText color="anemo">{sgt("reaction.swirl")}</ColorText>,
          stats: stats => ({
            anemo_dmg_: refinementVals[stats.weapon.refineIndex]
          })
        },
        ge: {
          name: <ColorText color="geo">{sgt("reaction.crystallize")}</ColorText>,
          stats: stats => ({
            geo_dmg_: refinementVals[stats.weapon.refineIndex]
          })
        },
        py: {
          name: <ColorText color="pyro">{sgt("reaction.overloaded")}</ColorText>,
          stats: stats => ({
            pyro_dmg_: refinementVals[stats.weapon.refineIndex]
          })
        },
        hy: {
          name: <ColorText color="hydro">{sgt("reaction.electrocharged")}</ColorText>,
          stats: stats => ({
            hydro_dmg_: refinementVals[stats.weapon.refineIndex]
          })
        },
        cr: {
          name: <ColorText color="cryo">{sgt("reaction.Superconduct")}</ColorText>,
          stats: stats => ({
            cryo_dmg_: refinementVals[stats.weapon.refineIndex]
          })
        },
      }
    }
  }],
}
export default weapon