import card from './Traveler_Female_Card.jpg'
import thumb from './Icon.png'
import thumbSide from './IconSide.png'
import data_gen from './data_gen.json'
import { ICharacterSheet } from '../../../Types/character';
import anemo from './anemo'
import geo from './geo'
import electro from './electro'
import { Translate } from '../../../Components/Translate'
import { WeaponTypeKey } from '../../../Types/consts';
const tr = (strKey: string) => <Translate ns="char_Traveler_gen" key18={strKey} />
const char: ICharacterSheet = {
  name: tr("name"),
  cardImg: card,
  thumbImg: thumb,
  thumbImgSide: thumbSide,
  rarity: data_gen.star,
  weaponTypeKey: data_gen.weaponTypeKey as WeaponTypeKey,
  gender: "F/M",
  constellationName: tr("constellationName"),
  title: tr("title"),
  baseStat: data_gen.base,
  baseStatCurve: data_gen.curves,
  ascensions: data_gen.ascensions,
  talents: { anemo, geo, electro }
};
export default char;
