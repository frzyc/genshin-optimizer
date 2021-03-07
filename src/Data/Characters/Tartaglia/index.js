import card from './Character_Tartaglia_Card.png'
import thumb from './Character_Tartaglia_Thumb.png'
import c1 from './Constellation_Foul_Legacy_Tide_Withholder.png'
import c2 from './Constellation_Foul_Legacy_Understream.png'
import c3 from './Constellation_Abyssal_Mayhem_Vortex_of_Turmoil.png'
import c4 from './Constellation_Abyssal_Mayhem_Hydrosprout.png'
import c5 from './Constellation_Havoc_Formless_Blade.png'
import c6 from './Constellation_Havoc_Annihilation.png'
import normal from './Talent_Cutting_Torrent.png'
import skill from './Talent_Foul_Legacy_Raging_Tide.png'
import burst from './Talent_Havoc_Obliteration.png'
import passive1 from './Talent_Never_Ending.png'
import passive2 from './Talent_Sword_of_Torrents.png'
import passive3 from './Talent_Master_of_Weaponry.png'
//import DisplayPercent from '../../../Components/DisplayPercent'

//AUTO

const hitPercent = [
  [],
  [],
  [],
  [],
]

const charged_atk_spinnning = []
const charged_finalATK = []
const plunging_dmg = []
const plunging_dmg_low = []
const plunging_dmg_high = []

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
          finalVal: (tlvl, stats) => (percentArr[tlvl] / 100) * stats.physical_normal_avgHit,
          formula: (tlvl) => ({ physical_normal_avgHit: percentArr[tlvl] / 100 }),
        }))
      },
      charged: {
        text: <span>TEMPLATE</span>,
        fields: [{
          text: `Spinning DMG`,
          basicVal: (tlvl) => charged_atk_spinnning[tlvl] + "%",
          finalVal: (tlvl, stats) => (charged_atk_spinnning[tlvl] / 100) * stats.physical_charged_avgHit,
          formula: (tlvl) => ({ physical_charged_avgHit: charged_atk_spinnning[tlvl] / 100 }),
        }, {
          text: `Spinning Final DMG`,
          basicVal: (tlvl) => charged_finalATK[tlvl] + "%",
          finalVal: (tlvl, stats) => (charged_finalATK[tlvl] / 100) * stats.physical_charged_avgHit,
          formula: (tlvl) => ({ physical_charged_avgHit: charged_finalATK[tlvl] / 100 }),
        }, {
          text: `Stamina Cost`,
          value: `40/s`,
        }, {
          text: `Max Duration`,
          value: `5s`,
        }]
      },
      plunging: {
        text: <span>TEMPLATE</span>,
        fields: [{
          text: `Plunge DMG`,
          basicVal: (tlvl) => plunging_dmg[tlvl] + "%",
          finalVal: (tlvl, stats) => (plunging_dmg[tlvl] / 100) * stats.physical_plunging_avgHit,
          formula: (tlvl) => ({ physical_plunging_avgHit: plunging_dmg[tlvl] / 100 }),
        }, {
          text: `Low Plunge DMG`,
          basicVal: (tlvl) => plunging_dmg_low[tlvl] + "%",
          finalVal: (tlvl, stats) => (plunging_dmg_low[tlvl] / 100) * stats.physical_plunging_avgHit,
          formula: (tlvl) => ({ physical_plunging_avgHit: plunging_dmg_low[tlvl] / 100 }),
        }, {
          text: `High Plunge DMG`,
          basicVal: (tlvl) => plunging_dmg_high[tlvl] + "%",
          finalVal: (tlvl, stats) => (plunging_dmg_high[tlvl] / 100) * stats.physical_plunging_avgHit,
          formula: (tlvl) => ({ physical_plunging_avgHit: plunging_dmg_high[tlvl] / 100 }),
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
        finalVal: (tlvl, s) => (breastplateStats.skill_dmg[tlvl] / 100) * s.physical_skill_avgHit,
        formula: (tlvl) => ({ physical_skill_avgHit: breastplateStats.skill_dmg[tlvl] / 100 }),
      }, {
        text: "TEMPLATE",
        basicVal: (tlvl) => breastplateStats.shield_def[tlvl] + "% DEF + " + breastplateStats.shield_flat[tlvl],
        finalVal: (tlvl, s) => (breastplateStats.shield_def[tlvl] / 100) * s.def + breastplateStats.shield_flat[tlvl],
        formula: (tlvl) => ({ def: breastplateStats.shield_def[tlvl] / 100, flat: breastplateStats.shield_flat[tlvl] }),
      }, {
        text: "TEMPLATE",
        basicVal: (tlvl) => breastplateStats.heal_def[tlvl] + "% DEF + " + breastplateStats.heal_flat[tlvl],
        finalVal: (tlvl, s) => (breastplateStats.heal_def[tlvl] / 100) * s.def + breastplateStats.heal_flat[tlvl],
        formula: (tlvl) => ({ def: breastplateStats.heal_def[tlvl] / 100, flat: breastplateStats.heal_flat[tlvl] })
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
        finalVal: (tlvl, s) => (sweepingTimeStats.burst_dmg[tlvl] / 100) * s.physical_burst_avgHit,
        formula: (tlvl) => ({ physical_burst_avgHit: sweepingTimeStats.burst_dmg[tlvl] / 100 }),
      }, {
        text: "TEMPLATE",
        basicVal: (tlvl) => sweepingTimeStats.skill_dmg[tlvl] + "%",
        finalVal: (tlvl, s) => (sweepingTimeStats.skill_dmg[tlvl] / 100) * s.physical_burst_avgHit,
        formula: (tlvl) => ({ physical_burst_avgHit: sweepingTimeStats.skill_dmg[tlvl] / 100 }),
      }, {
        text: "TEMPLATE",
        basicVal: (tlvl, s, constellation) => `${sweepingTimeStats.atk_bonu[tlvl]}%${constellation >= 6 ? " +50%" : ""} DEF`,
        finalVal: (tlvl, s, constellation) => ((sweepingTimeStats.atk_bonu[tlvl] + (constellation >= 6 ? 50 : 0)) / 100) * s.def,
        formula: (tlvl, s, c) => ({ def: (sweepingTimeStats.atk_bonu[tlvl] + (c >= 6 ? 50 : 0)) / 100 }),
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
