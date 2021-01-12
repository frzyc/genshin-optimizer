// import Character from '../../../Character/Character'
// import Stat from '../../../Stat'
import card from './Character_Ganyu_Card.png'
import thumb from './Character_Ganyu_Thumb.png'
/*
import c1 from './.png'
import c2 from './.png'
import c3 from './.png'
import c4 from './.png'
import c5 from './.png'
import c6 from './.png'
import normal from './.png'
import skill from './.png'
import burst from './.png'
import passive1 from './.png'
import passive2 from './.png'
import passive3 from './.png'
//import WeaponPercent from '../../../Components/WeaponPercent'

//AUTO

const hitPercent = [
  [],
  [],
  [],
  [],
]

const charged_atk_spinnning = []
const charged_atk_final = []
const plunge_dmg = []
const plunge_dmg_low = []
const plunge_dmg_high = []

//SKILL
const eleSkill = {
  skill_dmg: [],
}

//BURST
const eleBurst = {
  burst_dmg: [],
}
*/
let char = {
  name: "Ganyu",
  cardImg: card,
  thumbImg: thumb,
  star: 5,
  elementKey: "cryo",
  weaponTypeKey: "bow",
  gender: "F",
  constellationName: "Sinae Unicornis",
  titles: ["Plenilune Gaze"],
  baseStat: {
    hp_base: [763, 1978, 2632, 3939, 4403, 5066, 5686, 6355, 6820, 7495, 7960, 8643, 9108, 9797],
    atk_base: [26, 68, 90, 135, 151, 173, 194, 217, 233, 256, 272, 295, 311, 335],
    def_base: [49, 127, 169, 253, 283, 326, 366, 409, 439, 482, 512, 556, 586, 630]
  },
  specializeStat: {
    key: "crit_dmg",
    value: [0, 0, 0, 0, 9.6, 9.6, 19.2, 19.2, 19.2, 19.2, 28.8, 28.8, 38.4, 38.4]
  },

};
export default char;
