import card from './Traveler_Female_Card.jpg'
import thumb from './Character_Traveler_Thumb.png'
import ICharacterSheet from '../../ICharacterSheet';
// import c1 from './Constellation_Raging_Vortex.png'
// import c2 from './Constellation_Uprising_Whirlwind.png'
// import c3 from './Constellation_Sweeping_Gust.png'
// import c4 from './Constellation_Cherishing_Breezes.png'
// import c5 from './Constellation_Vortex_Stellaris.png'
// import c6 from './Constellation_Interwinded_Winds.png'
// import normal from './Talent_Foreign_Ironwind.png'
// import skill from './Talent_Palm_Vortex.png'
// import burst from './Talent_Gust_Surge.png'
// import passive1 from './Talent_Slitting_Wind.png'
// import passive2 from './Talent_Second_Wind.png'

const char: ICharacterSheet = {
  name: "Traveler (Anemo)",
  cardImg: card,
  thumbImg: thumb,
  star: 5,
  elementKey: "anemo",
  weaponTypeKey: "sword",
  gender: "F/M",
  constellationName: "Viatrix",//female const
  titles: ["Outlander", "Honorary Knight"],
  baseStat: {
    characterHP: [912, 2342, 3024, 4529, 5013, 5766, 6411, 7164, 7648, 8401, 8885, 9638, 10122, 10875],
    characterATK: [18, 46, 60, 88, 98, 112, 126, 140, 149, 164, 174, 188, 198, 213],
    characterDEF: [57, 147, 190, 284, 315, 362, 405, 450, 480, 527, 558, 605, 635, 682]
  },
  specializeStat: {
    key: "atk_",
    value: [0, 0, 0, 0, 6, 6, 12, 12, 12, 12, 18, 18, 24, 24]
  },
  formula: {},
  conditionals: {},
  talent: {}
};
export default char;
