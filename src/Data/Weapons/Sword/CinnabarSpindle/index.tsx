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

const weapon: IWeaponSheet = {
  ...data_gen as WeaponData,
  icon,
  iconAwaken,
  document: [{
    conditional: {
      key: "e",
      name: <Translate ns="weapon_CinnabarSpindle_gen" key18="passiveName" />,
      fields: [{
        text: <Translate ns="weapon_CinnabarSpindle" key18="name" />,
        formulaText: stats => <span>{data.defConv[stats.weapon.refineIndex]}% {Stat.printStat("finalDEF", stats, true)} * {Stat.printStat(getTalentStatKey("skill", stats) + "_multi", stats)}</span>,
        formula: formula.skill,
        variant: stats => stats.characterEle
      }, {
        text: <ColorText color="warning">The Elemental Skill DMG increase is not currently being added to the character's skill damage as a singular damage number, pending future implemention.</ColorText>
      }],
    }
  }],
}
export default weapon