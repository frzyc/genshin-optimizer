import card from './Character_Albedo_Card.png'
import thumb from './Character_Albedo_Thumb.png'
// import c1 from './Constellation_Flower_of_Eden.png'
// import c2 from './Constellation_Opening_of_Phanerozoic.png'
// import c3 from './Constellation_Grace_of_Helios.png'
// import c4 from './Constellation_Descent_of_Divinity.png'
// import c5 from './Constellation_Tide_of_Hadaen.png'
// import c6 from './Constellation_Dust_of_Purification.png'
// import normal from './Talent_Favonius_Bladework_-_Weiss.png'
// import skill from './Talent_Abiogenesis_-_Solar_Isotoma.png'
// import burst from './Talent_Rite_of_Progeniture_-_Tectonic_Tide.png'
// import passive1 from './Talent_Calcite_Might.png'
// import passive2 from './Talent_Homuncular_Nature.png'
// import passive3 from './Talent_Flash_of_Genius_(Albedo).png'
const char = {
  name: "Albedo",
  cardImg: card,
  thumbImg: thumb,
  star: 5,
  elementKey: "geo",
  weaponTypeKey: "sword",
  gender: "M",
  constellationName: "Princeps Cretaceus",
  titles: ["Kreideprinz", "The Chalk Prince", "Chief Alchemist"],
  baseStat: {
    characterHP: [1030, 2671, 3554, 5317, 5944, 6839, 7675, 8579, 9207, 10119, 10746, 11669, 12296, 13226],
    characterATK: [20, 51, 67, 101, 113, 130, 146, 163, 175, 192, 204, 222, 233, 251],
    characterDEF: [68, 177, 235, 352, 394, 453, 508, 568, 610, 670, 712, 773, 815, 876]
  },
  specializeStat: {
    key: "geo_dmg_",
    value: [0, 0, 0, 0, 7.2, 7.2, 14.4, 14.4, 14.4, 14.4, 21.6, 21.6, 28.8, 28.8]
  },
};
export default char;
