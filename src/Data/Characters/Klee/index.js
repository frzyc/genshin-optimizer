import card from './Character_Klee_Card.jpg'
import thumb from './Character_Klee_Thumb.png'
import c1 from './Constellation_Chained_Reactions.png'
import c2 from './Constellation_Explosive_Frags.png'
import c3 from './Constellation_Exquisite_Compound.png'
import c4 from './Constellation_Sparkly_Explosion.png'
import c5 from './Constellation_Nova_Burst.png'
import c6 from './Constellation_Blazing_Delight.png'
import normal from './Talent_Kaboom.png'
import skill from './Talent_Jumpy_Dumpty.png'
import burst from './Talent_Sparks_\'n\'_Splash.png'
import passive1 from './Talent_Pounding_Surprise.png'
import passive2 from './Talent_Sparkling_Burst.png'
import passive3 from './Talent_All_Of_My_Treasures.png'
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
  name: "Klee",
  cardImg: card,
  thumbImg: thumb,
  star: 5,
  elementKey: "pyro",
  weaponTypeKey: "catalyst",
  gender: "F",
  constellationName: "Trifolium",
  titles: ["Fleeing Sunlight", "Spark Knight", "Red Burny Girl"],
  baseStat: {
    characterHP: [801, 2077, 2764, 4136, 4623, 5319, 5970, 6673, 7161, 7870, 8358, 9076, 9563, 10287],
    characterATK: [24, 63, 84, 125, 140, 161, 180, 202, 216, 238, 253, 274, 289, 311],
    characterDEF: [48, 124, 165, 247, 276, 318, 357, 399, 428, 470, 500, 542, 572, 615]
  },
  specializeStat: {
    key: "pyro_dmg_",
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
          formula: (tlvl, stats) => ({ physical_plunging_avgHit: plunging_dmg[tlvl] / 100 }),
        }, {
          text: `Low Plunge DMG`,
          basicVal: (tlvl) => plunging_dmg_low[tlvl] + "%",
          finalVal: (tlvl, stats) => (plunging_dmg_low[tlvl] / 100) * stats.physical_plunging_avgHit,
          formula: (tlvl, stats) => ({ physical_plunging_avgHit: plunging_dmg_low[tlvl] / 100 }),
        }, {
          text: `High Plunge DMG`,
          basicVal: (tlvl) => plunging_dmg_high[tlvl] + "%",
          finalVal: (tlvl, stats) => (plunging_dmg_high[tlvl] / 100) * stats.physical_plunging_avgHit,
          formula: (tlvl, stats) => ({ physical_plunging_avgHit: plunging_dmg_high[tlvl] / 100 }),
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
        formula: (tlvl, _, c) => ({ def: (sweepingTimeStats.atk_bonu[tlvl] + (c >= 6 ? 50 : 0)) / 100 }),
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
