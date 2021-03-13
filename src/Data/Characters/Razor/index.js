import card from './Character_Razor_Card.jpg'
import thumb from './Character_Razor_Thumb.png'
// import c1 from './Constellation_Wolf\'s_Instinct.png'
// import c2 from './Constellation_Suppression.png'
// import c3 from './Constellation_Soul_Companion.png'
// import c4 from './Constellation_Bite.png'
// import c5 from './Constellation_Sharpened_Claws.png'
// import c6 from './Constellation_Lupus_Fulguris.png'
// import normal from './Talent_Steel_Fang.png'
// import skill from './Talent_Claw_and_Thunder.png'
// import burst from './Talent_Lightning_Fang.png'
// import passive1 from './Talent_Awakening.png'
// import passive2 from './Talent_Hunger.png'
// import passive3 from './Talent_Wolvensprint.png'

const char = {
  name: "Razor",
  cardImg: card,
  thumbImg: thumb,
  star: 4,
  elementKey: "electro",
  weaponTypeKey: "claymore",
  gender: "M",
  constellationName: "Lupus Minor",
  titles: ["Legend of Wolvendom", "Wolf Boy"],
  baseStat: {
    characterHP: [1003, 2577, 3326, 4982, 5514, 6343, 7052, 7881, 8413, 9241, 9773, 10602, 11134, 11962],
    characterATK: [20, 50, 65, 97, 108, 124, 138, 154, 164, 180, 191, 207, 217, 234],
    characterDEF: [63, 162, 209, 313, 346, 398, 443, 495, 528, 580, 613, 665, 699, 751]
  },
  specializeStat: {
    key: "physical_dmg_",
    value: [0, 0, 0, 0, 7.5, 7.5, 15, 15, 15, 15, 22.5, 22.5, 30, 30]
  },
};
export default char;
