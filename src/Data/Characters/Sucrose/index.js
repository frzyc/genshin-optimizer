import card from './Character_Sucrose_Card.jpg'
import thumb from './Character_Sucrose_Thumb.png'
// import c1 from './Constellation_Clustered_Vacuum_Field.png'
// import c2 from './Constellation_Beth_Unbound_Form.png'
// import c3 from './Constellation_Flawless_Alchemistress.png'
// import c4 from './Constellation_Alchemania.png'
// import c5 from './Constellation_Caution_Standard_Flask.png'
// import c6 from './Constellation_Chaotic_Entropy.png'
// import normal from './Talent_Wind_Spirit_Creation.png'
// import skill from './Talent_Astable_Anemohypostasis_Creation_-_6308.png'
// import burst from './Talent_Forbidden_Creation_-_Isomer_75_Type_II.png'
// import passive1 from './Talent_Catalyst_Conversion.png'
// import passive2 from './Talent_Mollis_Favonius.png'
// import passive3 from './Talent_Astable_Invention.png'

const char = {
  name: "Sucrose",
  cardImg: card,
  thumbImg: thumb,
  star: 4,
  elementKey: "anemo",
  weaponTypeKey: "catalyst",
  gender: "F",
  constellationName: "Ampulla",
  titles: ["Harmless Sweetie", "Knights of Favonius Alchemist"],
  baseStat: {
    characterHP: [775, 1991, 2570, 3850, 4261, 4901, 5450, 6090, 6501, 7141, 7552, 8192, 8603, 9244],
    characterATK: [14, 37, 47, 71, 78, 90, 100, 112, 120, 131, 139, 151, 159, 170],
    characterDEF: [59, 151, 195, 293, 324, 373, 414, 463, 494, 543, 574, 623, 654, 703]
  },
  specializeStat: {
    key: "anemo_dmg_",
    value: [0, 0, 0, 0, 6, 6, 12, 12, 12, 12, 18, 18, 24, 24]
  },
};
export default char;
