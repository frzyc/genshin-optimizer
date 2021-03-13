import card from './Character_Diona_Card.png'
import thumb from './Character_Diona_Thumb.png'
// import c1 from './Constellation_A_Lingering_Flavor.png'
// import c2 from './Constellation_Shaken,_Not_Purred.png'
// import c3 from './Constellation_A-Another_Round_.png'
// import c4 from './Constellation_Wine_Industry_Slayer.png'
// import c5 from './Constellation_Double_Shot,_On_The_Rocks.png'
// import c6 from './Constellation_Cat\'s_Tail_Closing_Time.png'
// import normal from './Talent_Kätzlein_Style.png'
// import skill from './Talent_Icy_Paws.png'
// import burst from './Talent_Signature_Mix.png'
// import passive1 from './Talent_Cat\'s_Tail_Secret_Menu.png'
// import passive2 from './Talent_Drunkards\'_Farce.png'
// import passive3 from './Talent_Complimentary_Bar_Food.png'

const char = {
  name: "Diona",
  cardImg: card,
  thumbImg: thumb,
  star: 4,
  elementKey: "cryo",
  weaponTypeKey: "bow",
  gender: "F",
  constellationName: "Feles",
  titles: ["Kätzlein Cocktail", "Wine Industry Slayer (Self-proclaimed)"],
  baseStat: {
    characterHP: [802, 2061, 2661, 3985, 4411, 5074, 5642, 6305, 6731, 7393, 7818, 8481, 8907, 9570],
    characterATK: [18, 46, 59, 88, 98, 113, 125, 140, 149, 164, 174, 188, 198, 212],
    characterDEF: [50, 129, 167, 250, 277, 318, 354, 396, 422, 464, 491, 532, 559, 601]
  },
  specializeStat: {
    key: "cryo_dmg_",
    value: [0, 0, 0, 0, 6, 6, 12, 12, 12, 12, 18, 18, 24, 24]
  },
};
export default char;
