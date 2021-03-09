import card from './Character_Jean_Card.jpg'
import thumb from './Character_Jean_Thumb.png'
// import c1 from './Constellation_Spiraling_Tempest.png'
// import c2 from './Constellation_People\'s_Aegis.png'
// import c3 from './Constellation_When_the_West_Wind_Arises.png'
// import c4 from './Constellation_Lands_of_Dandelion.png'
// import c5 from './Constellation_Outbursting_Gust.png'
// import c6 from './Constellation_Lion\'s_Fang,_Fair_Protector_of_Mondstadt.png'
// import normal from './Talent_Favonius_Bladework.png'
// import skill from './Talent_Gale_Blade.png'
// import burst from './Talent_Dandelion_Breeze.png'
// import passive1 from './Talent_Wind_Companion.png'
// import passive2 from './Talent_Let_the_Wind_Lead.png'
// import passive3 from './Talent_Guiding_Breeze.png'

const char = {
  name: "Jean",
  cardImg: card,
  thumbImg: thumb,
  star: 5,
  elementKey: "anemo",
  weaponTypeKey: "sword",
  gender: "F",
  constellationName: "Leo Minor",
  titles: ["Acting Grand Master", "Dandelion Knight", "Lionfang Knight"],
  baseStat: {
    characterHP: [1144, 2967, 3948, 5908, 6605, 7599, 8528, 9533, 10230, 11243, 11940, 12965, 13662, 14695],
    characterATK: [19, 48, 64, 96, 108, 124, 139, 155, 166, 183, 194, 211, 222, 239],
    characterDEF: [60, 155, 206, 309, 345, 397, 446, 499, 535, 588, 624, 678, 715, 769]
  },
  specializeStat: {
    key: "heal_",
    value: [0, 0, 0, 0, 5.5, 5.5, 11.1, 11.1, 11.1, 11.1, 16.6, 16.6, 22.2, 22.2]
  },
};
export default char;
