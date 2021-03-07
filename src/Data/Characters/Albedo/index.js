import card from './Character_Albedo_Card.png'
import thumb from './Character_Albedo_Thumb.png'
import c1 from './Constellation_Flower_of_Eden.png'
import c2 from './Constellation_Opening_of_Phanerozoic.png'
import c3 from './Constellation_Grace_of_Helios.png'
import c4 from './Constellation_Descent_of_Divinity.png'
import c5 from './Constellation_Tide_of_Hadaen.png'
import c6 from './Constellation_Dust_of_Purification.png'
import normal from './Talent_Favonius_Bladework_-_Weiss.png'
import skill from './Talent_Abiogenesis_-_Solar_Isotoma.png'
import burst from './Talent_Rite_of_Progeniture_-_Tectonic_Tide.png'
import passive1 from './Talent_Calcite_Might.png'
import passive2 from './Talent_Homuncular_Nature.png'
import passive3 from './Talent_Flash_of_Genius_(Albedo).png'
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
  talent: {
    auto: {
      name: "TEMPLATE",
      img: normal,
      infusable: false,
      document: [{
        text: <span><strong>Normal Attack</strong>TEMPLATE</span>,
        fields: hitPercent.map((percentArr, i) =>
        ({
          text: `${i + 1}-Hit DMG`,
          basicVal: (tlvl) => percentArr[tlvl] + "%",
          finalVal: (tlvl, stats) => (percentArr[tlvl] / 100) * stats.normal_avgHit,
          formula: (tlvl) => ({ normal_avgHit: percentArr[tlvl] / 100 }),
        }))
      }, {
        text: <span><strong>Charged Attack</strong>TEMPLATE</span>,
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
      }, {
        text: <span><strong>Plunging Attack</strong>TEMPLATE</span>,
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
          formula: (tlvl) => ({ def: breastplateStats.heal_def[tlvl] / 100, flat: breastplateStats.heal_flat[tlvl] }),
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
          finalVal: (tlvl, s) => (sweepingTimeStats.burst_dmg[tlvl] / 100) * s.physical_burst_avgHit,
          formula: (tlvl, s) => ({ physical_burst_avgHit: sweepingTimeStats.burst_dmg[tlvl] / 100 }),
        }, {
          text: "TEMPLATE",
          basicVal: (tlvl) => sweepingTimeStats.skill_dmg[tlvl] + "%",
          finalVal: (tlvl, s) => (sweepingTimeStats.skill_dmg[tlvl] / 100) * s.physical_burst_avgHit,
          formula: (tlvl) => ({ physical_burst_avgHit: sweepingTimeStats.skill_dmg[tlvl] / 100 }),
        }, {
          text: "TEMPLATE",
          basicVal: (tlvl, s, constellation) => `${sweepingTimeStats.atk_bonu[tlvl]}%${constellation >= 6 ? " +50%" : ""} DEF`,
          finalVal: (tlvl, s, constellation) => ((sweepingTimeStats.atk_bonu[tlvl] + (constellation >= 6 ? 50 : 0)) / 100) * s.def,
          formula: (tlvl, s, constellation) => ({ def: ((sweepingTimeStats.atk_bonu[tlvl] + (constellation >= 6 ? 50 : 0)) / 100) }),
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
    },
    constellation6: {
      name: "TEMPLATE",
      img: c6,
      document: [{ text: <span>TEMPLATE</span> }],
    }
  },
};
export default char;
