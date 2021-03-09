import card from './Character_Klee_Card.jpg'
import thumb from './Character_Klee_Thumb.png'
// import c1 from './Constellation_Chained_Reactions.png'
// import c2 from './Constellation_Explosive_Frags.png'
// import c3 from './Constellation_Exquisite_Compound.png'
// import c4 from './Constellation_Sparkly_Explosion.png'
// import c5 from './Constellation_Nova_Burst.png'
// import c6 from './Constellation_Blazing_Delight.png'
// import normal from './Talent_Kaboom.png'
// import skill from './Talent_Jumpy_Dumpty.png'
// import burst from './Talent_Sparks_\'n\'_Splash.png'
// import passive1 from './Talent_Pounding_Surprise.png'
// import passive2 from './Talent_Sparkling_Burst.png'
// import passive3 from './Talent_All_Of_My_Treasures.png'

const char = {
  name: "Klee",
  cardImg: card,
  thumbImg: thumb,
  star: 5,
  elementKey: "pyro",
  weaponTypeKey: "catalyst",
  gender: "F",
  constellationName: "Trifolium",
  titles: ["Fleeing Sunlight", "Spark Knight", "Red Burny Girl"],
  baseStat: {
    characterHP: [801, 2077, 2764, 4136, 4623, 5319, 5970, 6673, 7161, 7870, 8358, 9076, 9563, 10287],
    characterATK: [24, 63, 84, 125, 140, 161, 180, 202, 216, 238, 253, 274, 289, 311],
    characterDEF: [48, 124, 165, 247, 276, 318, 357, 399, 428, 470, 500, 542, 572, 615]
  },
  specializeStat: {
    key: "pyro_dmg_",
    value: [0, 0, 0, 0, 7.2, 7.2, 14.4, 14.4, 14.4, 14.4, 21.6, 21.6, 28.8, 28.8]
  },
};
export default char;
