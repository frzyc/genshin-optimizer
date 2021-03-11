import card from './Character_Chongyun_Card.jpg'
import thumb from './Character_Chongyun_Thumb.png'
// import c1 from './Constellation_Ice_Unleashed.png'
// import c2 from './Constellation_Atmospheric_Revolution.png'
// import c3 from './Constellation_Cloudburst.png'
// import c4 from './Constellation_Frozen_Skies.png'
// import c5 from './Constellation_The_True_Path.png'
// import c6 from './Constellation_Rally_of_Four_Blades.png'
// import normal from './Talent_Demonbane.png'
// import skill from './Talent_Spirit_Blade_-_Chonghua\'s_Layered_Frost.png'
// import burst from './Talent_Spirit_Blade_-_Cloud-parting_Star.png'
// import passive1 from './Talent_Steady_Breathing.png'
// import passive2 from './Talent_Rimechaser_Blade.png'
// import passive3 from './Talent_Gallant_Journey.png'

const char = {
  name: "Chongyun",
  cardImg: card,
  thumbImg: thumb,
  star: 4,
  elementKey: "cryo",
  weaponTypeKey: "claymore",
  gender: "M",
  constellationName: "Nubis Caesor",
  titles: ["Frozen Ardor", "Banisher of Evil and Rumors Thereof"],
  baseStat: {
    characterHP: [921, 2366, 3054, 4574, 5063, 5824, 6475, 7236, 7725, 8485, 8974, 9734, 10223, 10984],
    characterATK: [19, 48, 62, 93, 103, 119, 131, 147, 157, 172, 182, 198, 208, 223],
    characterDEF: [54, 140, 180, 270, 299, 344, 382, 427, 456, 501, 530, 575, 603, 648]
  },
  specializeStat: {
    key: "atk_",
    value: [0, 0, 0, 0, 6, 6, 12, 12, 12, 12, 18, 18, 24, 24]
  },
};
export default char;
