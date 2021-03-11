import card from './Character_Lisa_Card.jpg'
import thumb from './Character_Lisa_Thumb.png'
// import c1 from './Constellation_Infinite_Circuit.png'
// import c2 from './Constellation_Electromagnetic_Field.png'
// import c3 from './Constellation_Resonant_Thunder.png'
// import c4 from './Constellation_Plasma_Eruption.png'
// import c5 from './Constellation_Electrocute.png'
// import c6 from './Constellation_Pulsating_Witch.png'
// import normal from './Talent_Lightning_Touch.png'
// import skill from './Talent_Violet_Arc.png'
// import burst from './Talent_Lightning_Rose.png'
// import passive1 from './Talent_Induced_Aftershock.png'
// import passive2 from './Talent_Static_Electricity_Field.png'
// import passive3 from './Talent_General_Pharmaceutics.png'

const char = {
  name: "Lisa",
  cardImg: card,
  thumbImg: thumb,
  star: 4,
  elementKey: "electro",
  weaponTypeKey: "catalyst",
  gender: "F",
  constellationName: "Tempus Fugit",
  titles: ["Witch of Purple Rose", "The Librarian"],
  baseStat: {
    characterHP: [802, 2061, 2661, 3985, 4411, 5074, 5642, 6305, 6731, 7393, 7818, 8481, 8907, 9570],
    characterATK: [19, 50, 64, 96, 107, 123, 136, 153, 163, 179, 189, 205, 215, 232],
    characterDEF: [48, 123, 159, 239, 264, 304, 338, 378, 403, 443, 468, 508, 533, 573]
  },
  specializeStat: {
    key: "eleMas",
    value: [0, 0, 0, 0, 24, 24, 48, 48, 48, 48, 72, 72, 96, 96]
  },
};
export default char;
