import card from './Character_Fischl_Card.jpg'
import thumb from './Character_Fischl_Thumb.png'
import c1 from './Constellation_Gaze_of_the_Deep.png'
import c2 from './Constellation_Devourer_of_All_Sins.png'
import c3 from './Constellation_Wings_of_Nightmare.png'
import c4 from './Constellation_Her_Pilgrimage_of_Bleak.png'
import c5 from './Constellation_Against_the_Fleeing_Light.png'
import c6 from './Constellation_Evernight_Raven.png'
import normal from './Talent_Bolts_of_Downfall.png'
import skill from './Talent_Nightrider.png'
import burst from './Talent_Midnight_Phantasmagoria.png'
import passive1 from './Talent_Stellar_Predator.png'
import passive2 from './Talent_Lightning_Smite.png'
import passive3 from './Talent_Mein_Hausgarten.png'
//import DisplayPercent from '../../../Components/DisplayPercent'

//AUTO
const hitPercent = [
  [44.12, 47.71, 51.3, 56.43, 60.02, 64.13, 69.77, 75.41, 81.05, 87.21, 93.37, 99.52, 105.68, 111.83, 117.99],
  [46.78, 50.59, 54.4, 59.84, 63.65, 68, 73.98, 79.97, 85.95, 92.48, 99.01, 105.54, 112.06, 118.59, 125.12],
  [58.14, 62.87, 67.6, 74.36, 79.09, 84.5, 91.94, 99.37, 106.81, 114.92, 123.03, 131.14, 139.26, 147.37, 155.48],
  [57.71, 62.4, 67.1, 73.81, 78.51, 83.88, 91.26, 98.64, 106.02, 114.07, 122.12, 130.17, 138.23, 146.28, 154.33],
  [72.07, 77.93, 83.8, 92.18, 98.05, 104.75, 113.97, 123.19, 132.4, 142.46, 152.52, 162.57, 172.63, 182.68, 192.74],
]

const aimed = [43.86, 47.43, 51, 56.1, 59.67, 63.75, 69.36, 74.97, 80.58, 86.7, 92.82, 98.94, 105.06, 111.18, 117.3]
const aimed_full = [124, 133.3, 142.6, 155, 164.3, 173.6, 186, 198.4, 210.8, 223.2, 235.6, 248, 263.5, 279, 294.5]
const plunge_dmg = [56.83, 61.45, 66.08, 72.69, 77.31, 82.6, 89.87, 97.14, 104.41, 112.34, 120.27, 128.2, 136.12, 144.05, 151.98]
const plunge_dmg_low = [113.63, 122.88, 132.13, 145.35, 154.59, 165.17, 179.7, 194.23, 208.77, 224.62, 240.48, 256.34, 272.19, 288.05, 303.9]
const plunge_dmg_high = [141.93, 153.49, 165.04, 181.54, 193.1, 206.3, 224.45, 242.61, 260.76, 280.57, 300.37, 320.18, 339.98, 359.79, 379.59]

//SKILL
const breastplateStats = {
  skill_dmg: [],
  shield_def: [],
  shield_flat: [],
  heal_def: [],
  heal_flat: [],
  heal_trigger: [],
}

//BURST
const sweepingTimeStats = {
  burst_dmg: [],
  skill_dmg: [],
  atk_bonu: [],
}

let char = {
  name: "Fischl",
  cardImg: card,
  thumbImg: thumb,
  star: 4,
  elementKey: "electro",
  weaponTypeKey: "bow",
  gender: "F",
  constellationName: "Corvus",
  titles: ["Prinzessin der Verurteilung", "Sovereign of Immernachtreich", "Ruler of the Ashen Darkness"],
  baseStat: {
    hp_base: [770, 1979, 2555, 3827, 4236, 4872, 5418, 6054, 6463, 7099, 7508, 8144, 8553, 9189],
    atk_base: [20, 53, 68, 102, 113, 130, 144, 161, 172, 189, 200, 216, 227, 244],
    def_base: [50, 128, 165, 247, 274, 315, 350, 391, 418, 459, 485, 526, 553, 594]
  },
  specializeStat: {
    key: "atk_",
    value: [0, 0, 0, 0, 6, 6, 12, 12, 12, 12, 18, 18, 24, 24]
  },
  talent: {
    auto: {
      name: "Bolts of Downfall",
      img: normal,
      infusable: false,
      document: [{
        text: <span><strong>Normal Attack</strong> Perform up to 5 consecutive shots with a bow.</span>,
        fields: hitPercent.map((percentArr, i) =>
        ({
          text: `${i + 1}-Hit DMG`,
          basicVal: (tlvl) => percentArr[tlvl] + "%",
          finalVal: (tlvl, stats) => (percentArr[tlvl] / 100) * stats.norm_atk_avg_dmg
        }))
      }, {
        text: <span><strong>Charged Attack</strong> Perform a more precise Aimed Shot with increased DMG. While aiming, the dark lightning spirits of Immernachtreich shall heed the call of their Prinzessin and indwell the enchanted arrowhead. When fully indwelt, the Rachsüchtig Blitz shall deal immense <span className="text-electro">Electro DMG.</span></span>,
        fields: [{
          text: `Spinning DMG`,
          basicVal: (tlvl) => aimed[tlvl] + "%",
          finalVal: (tlvl, stats) => (aimed[tlvl] / 100) * stats.char_atk_avg_dmg
        }, {
          text: `Spinning Final DMG`,
          basicVal: (tlvl) => aimed_full[tlvl] + "%",
          finalVal: (tlvl, stats) => (aimed_full[tlvl] / 100) * stats.char_atk_avg_dmg
        }, {
          text: `Stamina Cost`,
          value: `40/s`,
        }, {
          text: `Max Duration`,
          value: `5s`,
        }]
      }, {
        text: <span><strong>Plunging Attack</strong>TEMPLATE</span>,
        fields: [{
          text: `Plunge DMG`,
          basicVal: (tlvl) => plunge_dmg[tlvl] + "%",
          finalVal: (tlvl, stats) => (plunge_dmg[tlvl] / 100) * stats.plunge_avg_dmg
        }, {
          text: `Low Plunge DMG`,
          basicVal: (tlvl) => plunge_dmg_low[tlvl] + "%",
          finalVal: (tlvl, stats) => (plunge_dmg_low[tlvl] / 100) * stats.plunge_avg_dmg
        }, {
          text: `High Plunge DMG`,
          basicVal: (tlvl) => plunge_dmg_high[tlvl] + "%",
          finalVal: (tlvl, stats) => (plunge_dmg_high[tlvl] / 100) * stats.plunge_avg_dmg
        }]
      }],
    },
    skill: {
      name: "TEMPLATE",
      img: skill,
      document: [{
        text: <span>TEMPLATE</span>,
        fields: [{
          text: "TEMPLATE",
          basicVal: (tlvl) => breastplateStats.skill_dmg[tlvl] + "%",
          finalVal: (tlvl, s) => (breastplateStats.skill_dmg[tlvl] / 100) * s.skill_avg_dmg,
        }, {
          text: "TEMPLATE",
          basicVal: (tlvl) => breastplateStats.shield_def[tlvl] + "% DEF + " + breastplateStats.shield_flat[tlvl],
          finalVal: (tlvl, s) => (breastplateStats.shield_def[tlvl] / 100) * s.def + breastplateStats.shield_flat[tlvl],
        }, {
          text: "TEMPLATE",
          basicVal: (tlvl) => breastplateStats.heal_def[tlvl] + "% DEF + " + breastplateStats.heal_flat[tlvl],
          finalVal: (tlvl, s) => (breastplateStats.heal_def[tlvl] / 100) * s.def + breastplateStats.heal_flat[tlvl],
        }, {
          text: "CD",
          value: "12s",
        }, {
          text: "TEMPLATE",
          value: (tlvl, s, c, a) => "24s" + a > 4 ? " -1s Every 4 hits" : "",
        }]
      }],
    },
    burst: {
      name: "TEMPLATE",
      img: burst,
      document: [{
        text: <span>TEMPLATE</span>,
        fields: [{
          text: "TEMPLATE",
          basicVal: (tlvl) => sweepingTimeStats.burst_dmg[tlvl] + "%",
          finalVal: (tlvl, s) => (sweepingTimeStats.burst_dmg[tlvl] / 100) * s.burst_avg_dmg,
        }, {
          text: "TEMPLATE",
          basicVal: (tlvl) => sweepingTimeStats.skill_dmg[tlvl] + "%",
          finalVal: (tlvl, s) => (sweepingTimeStats.skill_dmg[tlvl] / 100) * s.burst_avg_dmg,
        }, {
          text: "TEMPLATE",
          basicVal: (tlvl, s, constellation) => `${sweepingTimeStats.atk_bonu[tlvl]}%${constellation >= 6 ? " +50%" : ""} DEF`,
          finalVal: (tlvl, s, constellation) => ((sweepingTimeStats.atk_bonu[tlvl] + (constellation >= 6 ? 50 : 0)) / 100) * s.def,
        }, {
          text: "TEMPLATE",
          value: (tlvl, s, constellation) => "15s" + (constellation >= 6 ? " +1s per kill, up to 10s" : ""),
        }, {
          text: "CD",
          value: "15s",
        }, {
          text: "Energy Cost",
          value: 60,
        }]
      }],
    },
    passive1: {
      name: "TEMPLATE",
      img: passive1,
      document: [{ text: <span>TEMPLATE</span> }],
    },
    passive2: {
      name: "TEMPLATE",
      img: passive2,
      document: [{ text: <span>TEMPLATE</span> }],
    },
    passive3: {
      name: "TEMPLATE",
      img: passive3,
      document: [{ text: <span>TEMPLATE</span> }],
    },
    constellation1: {
      name: "TEMPLATE",
      img: c1,
      document: [{ text: <span>TEMPLATE</span> }],
    },
    constellation2: {
      name: "TEMPLATE",
      img: c2,
      document: [{ text: <span>TEMPLATE</span> }],
    },
    constellation3: {
      name: "TEMPLATE",
      img: c3,
      document: [{ text: <span>TEMPLATE</span> }],
      talentBoost: { burst: 3 }
    },
    constellation4: {
      name: "TEMPLATE",
      img: c4,
      document: [{ text: <span>TEMPLATE</span> }],
    },
    constellation5: {
      name: "TEMPLATE",
      img: c5,
      document: [{ text: <span>TEMPLATE</span> }],
      talentBoost: { burst: 3 }
    },
    constellation6: {
      name: "TEMPLATE",
      img: c6,
      document: [{ text: <span>TEMPLATE</span> }],
    }
  },
};
export default char;
