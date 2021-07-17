import card from './Traveler_Female_Card.jpg'
import thumb from './Character_Traveler_Thumb.png'
import data_gen from './data_anemo_gen.json'
import { ICharacterSheet } from '../../../Types/character';
import anemoTalent from './anemoTalentSheet'
import geoTalent from './geoTalentSheet'
import { Translate } from '../../../Components/Translate'
const tr = (strKey: string) => <Translate ns="char_traveler_anemo_gen" key18={strKey} />
const char: ICharacterSheet = {
  name: tr("name"),
  cardImg: card,
  thumbImg: thumb,
  star: 5,
  weaponTypeKey: "sword",
  gender: "F/M",
  constellationName: tr("constellationName"),
  title: tr("title"),
  baseStat: data_gen.base,
  baseStatCurve: data_gen.curves,
  ascensions: data_gen.ascensions,
  talents: { anemo: anemoTalent, geo: geoTalent }
};
export default char;
