import card from './Character_Xiangling_Card.jpg'
import thumb from './Character_Xiangling_Thumb.png'
// import c1 from './Constellation_Crispy_Outside,_Tender_Inside.png'
// import c2 from './Constellation_Oil_Meets_Fire.png'
// import c3 from './Constellation_Deepfry.png'
// import c4 from './Constellation_Slowbake.png'
// import c5 from './Constellation_Guoba_Mad.png'
// import c6 from './Constellation_Condensed_Pyronado.png'
// import normal from './Talent_Dough-Fu.png'
// import skill from './Talent_Guoba_Attack.png'
// import burst from './Talent_Pyronado.png'
// import passive1 from './Talent_Crossfire.png'
// import passive2 from './Talent_Beware,_It\'s_Super_Hot.png'
// import passive3 from './Talent_Chef_de_Cuisine.png'

const char = {
  name: "Xiangling",
  cardImg: card,
  thumbImg: thumb,
  star: 4,
  elementKey: "pyro",
  weaponTypeKey: "polearm",
  gender: "F",
  constellationName: "Trulla",
  titles: ["Exquisite Delicacy", "Chef de Cuisine"],
  baseStat: {
    characterHP: [912, 2342, 3024, 4529, 5013, 5766, 6411, 7164, 7648, 8401, 8885, 9638, 10122, 10875],
    characterATK: [19, 49, 63, 94, 104, 119, 133, 149, 159, 174, 184, 200, 210, 225],
    characterDEF: [56, 144, 186, 279, 308, 355, 394, 441, 470, 517, 546, 593, 623, 669]
  },
  specializeStat: {
    key: "eleMas",
    value: [0, 0, 0, 0, 24, 24, 48, 48, 48, 48, 72, 72, 96, 96]
  },
};
export default char;
