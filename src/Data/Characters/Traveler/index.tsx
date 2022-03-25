import card from './Traveler_Female_Card.jpg'
import thumb from './Icon.png'
import thumbSide from './IconSide.png'
import anemo, { data as anemoData } from './anemo'
// import geo, { data as geoData } from './geo'
import electro, { data as electroData} from './electro'
import { CharacterKey, WeaponTypeKey } from '../../../Types/consts';
import CharacterSheet, { ICharacterSheet } from '../CharacterSheet'
import data_gen_src from './data_gen.json'
import { CharacterData } from 'pipeline'
import { trans } from '../../SheetUtil'
const data_gen = data_gen_src as CharacterData
const key: CharacterKey = "Traveler"
const [tr] = trans("char", key)

const sheet: ICharacterSheet = {
  name: tr("name"),
  cardImg: card,
  thumbImg: thumb,
  thumbImgSide: thumbSide,
  rarity: data_gen.star,
  weaponTypeKey: data_gen.weaponTypeKey as WeaponTypeKey,
  gender: "F/M",
  constellationName: tr("constellationName"),
  title: tr("title"),
  talents: {
    anemo,
    // geo,
    electro,
  }
};
export default new CharacterSheet(sheet, {
  anemo: anemoData,
  // geo: geoData,
  electro: electroData,
});
