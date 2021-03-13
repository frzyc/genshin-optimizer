import card from './Character_Xinyan_Card.jpg'
import thumb from './Character_Xinyan_Thumb.png'
// import c1 from './Constellation_Fatal_Acceleration.png'
// import c2 from './Constellation_Impromptu_Opening.png'
// import c3 from './Constellation_Double-Stop.png'
// import c4 from './Constellation_Wildfire_Rhythm.png'
// import c5 from './Constellation_Screamin\'_for_an_Encore.png'
// import c6 from './Constellation_Rockin\'_in_a_Flaming_World.png'
// import normal from './Talent_Dance_on_Fire.png'
// import skill from './Talent_Sweeping_Fervor.png'
// import burst from './Talent_Riff_Revolution.png'
// import passive1 from './Talent__The_Show_Goes_On,_Even_Without_an_Audience..._.png'
// import passive2 from './Talent__...Now_That\'s_Rock_\'N\'_Roll_.png'
// import passive3 from './Talent_A_Rad_Recipe.png'

const char = {
  name: "Xinyan",
  cardImg: card,
  thumbImg: thumb,
  star: 4,
  elementKey: "pyro",
  weaponTypeKey: "claymore",
  gender: "F",
  constellationName: "Fila Ignium",
  titles: ["Blazing Riff", "Rock 'n' Roll Musician"],
  baseStat: {
    characterHP: [939, 2413, 3114, 4665, 5163, 5939, 6604, 7379, 7878, 8653, 9151, 9927, 10425, 11201],
    characterATK: [21, 54, 69, 103, 115, 132, 147, 164, 175, 192, 203, 220, 231, 249],
    characterDEF: [67, 172, 222, 333, 368, 423, 471, 526, 562, 617, 652, 708, 743, 799]
  },
  specializeStat: {
    key: "atk_",
    value: [0, 0, 0, 0, 6, 6, 12, 12, 12, 12, 18, 18, 24, 24]
  },
};
export default char;
