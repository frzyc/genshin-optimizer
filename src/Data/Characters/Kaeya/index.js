import card from './Character_Kaeya_Card.jpg'
import thumb from './Character_Kaeya_Thumb.png'
// import c1 from './Constellation_Excellent_Blood.png'
// import c2 from './Constellation_Never-Ending_Performance.png'
// import c3 from './Constellation_Dance_of_Frost.png'
// import c4 from './Constellation_Frozen_Kiss.png'
// import c5 from './Constellation_Frostbiting_Embrace.png'
// import c6 from './Constellation_Glacial_Whirlwind.png'
// import normal from './Talent_Ceremonial_Bladework.png'
// import skill from './Talent_Frostgnaw.png'
// import burst from './Talent_Glacial_Waltz.png'
// import passive1 from './Talent_Cold-Blooded_Strike.png'
// import passive2 from './Talent_Heart_of_the_Abyss.png'
// import passive3 from './Talent_Hidden_Strength.png'

const char = {
  name: "Kaeya",
  cardImg: card,
  thumbImg: thumb,
  star: 4,
  elementKey: "cryo",
  weaponTypeKey: "sword",
  gender: "M",
  constellationName: "Pavo Ocellus",
  titles: ["Cavalry Captain", "Quartermaster", "Frostblade"],
  baseStat: {
    characterHP: [976, 2506, 3235, 4846, 5364, 6170, 6860, 7666, 8184, 8989, 9507, 10312, 10830, 11636],
    characterATK: [19, 48, 62, 93, 103, 118, 131, 147, 157, 172, 182, 198, 208, 223],
    characterDEF: [66, 171, 220, 330, 365, 420, 467, 522, 557, 612, 647, 702, 737, 792]
  },
  specializeStat: {
    key: "enerRech_",
    value: [0, 0, 0, 0, 6.7, 6.7, 13.3, 13.3, 13.3, 13.3, 20, 20, 26.7, 26.7]
  },
};
export default char;
