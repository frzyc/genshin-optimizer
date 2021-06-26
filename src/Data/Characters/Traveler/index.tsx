import card from './Traveler_Female_Card.jpg'
import thumb from './Character_Traveler_Thumb.png'
import { specializeStat, baseStat } from './data'
import { ICharacterSheet } from '../../../Types/character';
import anemoTalent from './anemoTalentSheet'
import geoTalent from './geoTalentSheet'

const char: ICharacterSheet = {
  name: "Traveler",
  cardImg: card,
  thumbImg: thumb,
  star: 5,
  weaponTypeKey: "sword",
  gender: "F/M",
  constellationName: "Viatrix",//female const
  titles: ["Outlander", "Honorary Knight"],
  baseStat,
  specializeStat,
  talents: { anemo: anemoTalent, geo: geoTalent }
};
export default char;
