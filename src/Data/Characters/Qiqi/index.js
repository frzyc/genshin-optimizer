import card from './Character_Qiqi_Card.jpg'
import thumb from './Character_Qiqi_Thumb.png'
// import c1 from './Constellation_Ascetics_of_Frost.png'
// import c2 from './Constellation_Frozen_to_the_Bone.png'
// import c3 from './Constellation_Ascendant_Praise.png'
// import c4 from './Constellation_Divine_Suppression.png'
// import c5 from './Constellation_Crimson_Lotus_Bloom.png'
// import c6 from './Constellation_Rite_of_Resurrection.png'
// import normal from './Talent_Ancient_Sword_Art.png'
// import skill from './Talent_Adeptus_Art_-_Herald_of_Frost.png'
// import burst from './Talent_Adeptus_Art_-_Preserver_of_Fortune.png'
// import passive1 from './Talent_Life-Prolonging_Methods.png'
// import passive2 from './Talent_A_Glimpse_into_Arcanum.png'
// import passive3 from './Talent_Former_Life_Memories.png'

const char = {
  name: "Qiqi",
  cardImg: card,
  thumbImg: thumb,
  star: 5,
  elementKey: "cryo",
  weaponTypeKey: "sword",
  gender: "F",
  constellationName: "Pristina Nola",
  titles: ["Pharmacist", "Icy Resurrection"],
  baseStat: {
    characterHP: [963, 2498, 3323, 4973, 5559, 6396, 7178, 8023, 8610, 9463, 10050, 10912, 11499, 12368],
    characterATK: [22, 58, 77, 115, 129, 149, 167, 186, 200, 220, 233, 253, 267, 287],
    characterDEF: [72, 186, 248, 371, 415, 477, 535, 598, 642, 706, 749, 814, 857, 922]
  },
  specializeStat: {
    key: "heal_",
    value: [0, 0, 0, 0, 5.5, 5.5, 11.1, 11.1, 11.1, 11.1, 16.6, 16.6, 22.2, 22.2]
  },
};
export default char;
