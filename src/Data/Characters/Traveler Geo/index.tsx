import card from './Traveler_Male_Card.jpg'
import thumb from './Character_Traveler_Thumb.png'
import CharacterSheet from '../../CharacterSheetInterface';
// import c1 from './Constellation_Invincible_Stonewall.png'
// import c2 from './Constellation_Rockcore_Meltdown.png'
// import c3 from './Constellation_Will_of_the_Rock.png'
// import c4 from './Constellation_Reaction_Force.png'
// import c5 from './Constellation_Meteorite_Impact.png'
// import c6 from './Constellation_Everlasting_Boulder.png'
// import normal from './Talent_Foreign_Rockblade.png'
// import skill from './Talent_Starfell_Sword.png'
// import burst from './Talent_Wake_of_Earth.png'
// import passive1 from './Talent_Shattered_Darkrock.png'
// import passive2 from './Talent_Frenzied_Rockslide.png'

const char: CharacterSheet = {
  name: "Traveler (Geo)",
  cardImg: card,
  thumbImg: thumb,
  star: 5,
  elementKey: "geo",
  weaponTypeKey: "sword",
  gender: "F/M",
  constellationName: "Viator",//male const
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
