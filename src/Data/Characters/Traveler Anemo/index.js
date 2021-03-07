import card from './Traveler_Female_Card.jpg'
import thumb from './Character_Traveler_Thumb.png'
import c1 from './Constellation_Raging_Vortex.png'
import c2 from './Constellation_Uprising_Whirlwind.png'
import c3 from './Constellation_Sweeping_Gust.png'
import c4 from './Constellation_Cherishing_Breezes.png'
import c5 from './Constellation_Vortex_Stellaris.png'
import c6 from './Constellation_Interwinded_Winds.png'
import normal from './Talent_Foreign_Ironwind.png'
import skill from './Talent_Palm_Vortex.png'
import burst from './Talent_Gust_Surge.png'
import passive1 from './Talent_Slitting_Wind.png'
import passive2 from './Talent_Second_Wind.png'
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
  name: "Traveler (Anemo)",
  cardImg: card,
  thumbImg: thumb,
  star: 5,
  elementKey: "anemo",
  weaponTypeKey: "sword",
  gender: "F/M",
  constellationName: "Viatrix",//female const
  titles: ["Outlander", "Honorary Knight"],
  baseStat: {
    characterHP: [912, 2342, 3024, 4529, 5013, 5766, 6411, 7164, 7648, 8401, 8885, 9638, 10122, 10875],
    characterATK: [18, 46, 60, 88, 98, 112, 126, 140, 149, 164, 174, 188, 198, 213],
    characterDEF: [57, 147, 190, 284, 315, 362, 405, 450, 480, 527, 558, 605, 635, 682]
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
          formula: (tlvl, stats) => ({ physical_plunging_avgHit: plunging_dmg[tlvl] / 100 }),
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
        formula: (tlvl) => ({ def: breastplateStats.heal_def[tlvl] / 100, flat: breastplateStats.heal_flat[tlvl] }),
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
        formula: (tlvl, _, constellation) => ({ def: (sweepingTimeStats.atk_bonu[tlvl] + (constellation >= 6 ? 50 : 0)) / 100 }),
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
    //TODO TRAVELER DONT HAVE A 3RD PASSIVE
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
