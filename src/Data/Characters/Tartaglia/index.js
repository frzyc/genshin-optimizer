import card from './Character_Tartaglia_Card.png'
import thumb from './Character_Tartaglia_Thumb.png'
// import c1 from './Constellation_Foul_Legacy_Tide_Withholder.png'
// import c2 from './Constellation_Foul_Legacy_Understream.png'
// import c3 from './Constellation_Abyssal_Mayhem_Vortex_of_Turmoil.png'
// import c4 from './Constellation_Abyssal_Mayhem_Hydrosprout.png'
// import c5 from './Constellation_Havoc_Formless_Blade.png'
// import c6 from './Constellation_Havoc_Annihilation.png'
// import normal from './Talent_Cutting_Torrent.png'
// import skill from './Talent_Foul_Legacy_Raging_Tide.png'
// import burst from './Talent_Havoc_Obliteration.png'
// import passive1 from './Talent_Never_Ending.png'
// import passive2 from './Talent_Sword_of_Torrents.png'
// import passive3 from './Talent_Master_of_Weaponry.png'

const char = {
  name: "Tartaglia",
  cardImg: card,
  thumbImg: thumb,
  star: 5,
  elementKey: "hydro",
  weaponTypeKey: "bow",
  gender: "M",
  constellationName: "Monoceros Caeli",
  titles: ["Childe", "11th of the Eleven Fatui Harbingers"],
  baseStat: {
    characterHP: [1020, 2646, 3521, 5268, 5889, 6776, 7604, 8500, 9121, 10025, 10647, 11561, 12182, 13103],
    characterATK: [23, 61, 81, 121, 135, 156, 175, 195, 210, 231, 245, 266, 280, 301],
    characterDEF: [63, 165, 219, 328, 366, 421, 473, 528, 567, 623, 662, 719, 757, 815]
  },
  specializeStat: {
    key: "hydro_dmg_",
    value: [0, 0, 0, 0, 7.2, 7.2, 14.4, 14.4, 14.4, 14.4, 21.6, 21.6, 28.8, 28.8]
  },
};
export default char;
