import card from './Character_Zhongli_Card.png'
import thumb from './Character_Zhongli_Thumb.png'
// import c1 from './Constellation_Rock,_the_Backbone_of_Earth.png'
// import c2 from './Constellation_Stone,_the_Cradle_of_Jade.png'
// import c3 from './Constellation_Jade,_Shimmering_through_Darkness.png'
// import c4 from './Constellation_Topaz,_Unbreakable_and_Fearless.png'
// import c5 from './Constellation_Lazuli,_Herald_of_the_Order.png'
// import c6 from './Constellation_Chrysos,_Bounty_of_Dominator.png'
// import normal from './Talent_Rain_of_Stone.png'
// import skill from './Talent_Dominus_Lapidis.png'
// import burst from './Talent_Planet_Befall.png'
// import passive1 from './Talent_Resonant_Waves.png'
// import passive2 from './Talent_Dominance_of_Earth.png'
// import passive3 from './Talent_Arcanum_of_Crystal.png'

const char = {
  name: "Zhongli",
  cardImg: card,
  thumbImg: thumb,
  star: 5,
  elementKey: "geo",
  weaponTypeKey: "polearm",
  gender: "M",
  constellationName: "Lapis Dei",
  titles: ["Vago Mundo"],
  baseStat: {
    characterHP: [1144, 2967, 3948, 5908, 6605, 7599, 8528, 9533, 10230, 11243, 11940, 12965, 13662, 14695],
    characterATK: [20, 51, 67, 101, 113, 130, 146, 163, 175, 192, 204, 222, 233, 251],
    characterDEF: [57, 149, 198, 297, 332, 382, 428, 479, 514, 564, 699, 651, 686, 738]
  },
  specializeStat: {
    key: "geo_dmg_",
    value: [0, 0, 0, 0, 7.2, 7.2, 14.4, 14.4, 14.4, 14.4, 21.6, 21.6, 28.8, 28.8]
  },
};
export default char;
