import { WeaponData } from 'pipeline'
import { getTalentStatKey } from '../../../../Build/Build'
import ColorText from '../../../../Components/ColoredText'
import { Translate } from '../../../../Components/Translate'
import Stat from '../../../../Stat'
import { IWeaponSheet } from '../../../../Types/weapon'
import iconAwaken from './AwakenIcon.png'
import formula, { data } from './data'
import data_gen from './data_gen.json'
import icon from './Icon.png'
const def_ = [28, 35, 42, 49, 56]
const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  stats: stats => ({
    def_: def_[stats.weapon.refineIndex]
  }),
  document: [{
    conditional: {
      key: "e",
      name: <Translate ns="weapon_RedhornStonethresher_gen" key18="passiveName" />,
      fields: [{
        text: <Translate ns="weapon_RedhornStonethresher" key18="nameNormal" />,
        formulaText: stats => <span>{data.defConv[stats.weapon.refineIndex]}% {Stat.printStat("finalDEF", stats, true)} * {Stat.printStat(getTalentStatKey("normal", stats) + "_multi", stats)}</span>,
        formula: formula.normal,
        variant: stats => stats.characterEle
      }, {
        text: <Translate ns="weapon_RedhornStonethresher" key18="nameCharged" />,
        formulaText: stats => <span>{data.defConv[stats.weapon.refineIndex]}% {Stat.printStat("finalDEF", stats, true)} * {Stat.printStat(getTalentStatKey("charged", stats) + "_multi", stats)}</span>,
        formula: formula.charged,
        variant: stats => stats.characterEle
      }, {
        text: <ColorText color="warning">The normal and charged DMG increase is not currently being added to the character's skill damage as a singular damage number, pending future implemention.</ColorText>
      }],
    }
  }],
}
export default weapon