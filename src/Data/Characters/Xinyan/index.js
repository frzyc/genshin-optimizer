import card from './Character_Xinyan_Card.jpg'
import thumb from './Character_Xinyan_Thumb.png'
import c1 from './Constellation_Fatal_Acceleration.png'
import c2 from './Constellation_Impromptu_Opening.png'
import c3 from './Constellation_Double-Stop.png'
import c4 from './Constellation_Wildfire_Rhythm.png'
import c5 from './Constellation_Screamin\'_for_an_Encore.png'
import c6 from './Constellation_Rockin\'_in_a_Flaming_World.png'
import normal from './Talent_Dance_on_Fire.png'
import skill from './Talent_Sweeping_Fervor.png'
import burst from './Talent_Riff_Revolution.png'
import passive1 from './Talent__The_Show_Goes_On,_Even_Without_an_Audience..._.png'
import passive2 from './Talent__...Now_That\'s_Rock_\'N\'_Roll_.png'
import passive3 from './Talent_A_Rad_Recipe.png'
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
const plunge_dng_low = []
const plunge_dmg_high = []

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
    hp: [939, 2413, 3114, 4665, 5163, 5939, 6604, 7379, 7878, 8653, 9151, 9927, 10425, 11201],
    atk: [21, 54, 69, 103, 115, 132, 147, 164, 175, 192, 203, 220, 231, 249],
    def: [67, 172, 222, 333, 368, 423, 471, 526, 562, 617, 652, 708, 743, 799]
  },
  specializeStat: {
    key: "atk_",
    value: [0, 0, 0, 0, 6, 6, 12, 12, 12, 12, 18, 18, 24, 24]
  },
  talent: {
    auto: {
      name: "TEMPLATE",
      img: normal,
      normal: {
        text: <span>TEMPLATE</span>,
        fields: hitPercent.map((percentArr, i) =>
        ({
          text: `${i + 1}-Hit DMG`,
          basicVal: (tlvl) => percentArr[tlvl] + "%",
          finalVal: (tlvl, stats) => (percentArr[tlvl] / 100) * stats.norm_atk_avg_dmg
        }))
      },
      charged: {
        text: <span>TEMPLATE</span>,
        fields: [{
          text: `Spinning DMG`,
          basicVal: (tlvl) => charged_atk_spinnning[tlvl] + "%",
          finalVal: (tlvl, stats) => (charged_atk_spinnning[tlvl] / 100) * stats.char_atk_avg_dmg
        }, {
          text: `Spinning Final DMG`,
          basicVal: (tlvl) => charged_atk_final[tlvl] + "%",
          finalVal: (tlvl, stats) => (charged_atk_final[tlvl] / 100) * stats.char_atk_avg_dmg
        }, {
          text: `Stamina Cost`,
          value: `40/s`,
        }, {
          text: `Max Duration`,
          value: `5s`,
        }]
      },
      plunge: {
        text: <span>TEMPLATE</span>,
        fields: [{
          text: `Plunge DMG`,
          basicVal: (tlvl) => plunge_dmg[tlvl] + "%",
          finalVal: (tlvl, stats) => (plunge_dmg[tlvl] / 100) * stats.phy_avg_dmg
        }, {
          text: `Low Plunge DMG`,
          basicVal: (tlvl) => plunge_dng_low[tlvl] + "%",
          finalVal: (tlvl, stats) => (plunge_dng_low[tlvl] / 100) * stats.phy_avg_dmg
        }, {
          text: `High Plunge DMG`,
          basicVal: (tlvl) => plunge_dmg_high[tlvl] + "%",
          finalVal: (tlvl, stats) => (plunge_dmg_high[tlvl] / 100) * stats.phy_avg_dmg
        }]
      }
    },
    skill: {
      name: "TEMPLATE",
      img: skill,
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
    },
    burst: {
      name: "TEMPLATE",
      img: burst,
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
    },
    passive1: {
      name: "TEMPLATE",
      img: passive1,
      text: <span>TEMPLATE</span>
    },
    passive2: {
      name: "TEMPLATE",
      img: passive2,
      text: <span>TEMPLATE</span>
    },
    passive3: {
      name: "TEMPLATE",
      img: passive3,
      text: <span>TEMPLATE</span>
    },
  },
  constellation: [{
    name: "TEMPLATE",
    img: c1,
    text: <span>TEMPLATE</span>
  }, {
    name: "TEMPLATE",
    img: c2,
    text: <span>TEMPLATE</span>
  }, {
    name: "TEMPLATE",
    img: c3,
    text: <span>TEMPLATE</span>
  }, {
    name: "TEMPLATE",
    img: c4,
    text: <span>TEMPLATE</span>
  }, {
    name: "TEMPLATE",
    img: c5,
    text: <span>TEMPLATE</span>
  }, {
    name: "TEMPLATE",
    img: c6,
    text: <span>TEMPLATE</span>
  }],
};
export default char;
