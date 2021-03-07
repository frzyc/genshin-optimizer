import card from './Character_Xiao_Card.jpg'
import thumb from './Character_Xiao_Thumb.png'
import c1 from './Constellation_Dissolution_Eon_-_Destroyer_of_Worlds.png'
import c2 from './Constellation_Annihilation_Eon_-_Blossom_of_Kaleidos.png'
import c3 from './Constellation_Conqueror_of_Evil_-_Wrath_Deity.png'
import c4 from './Constellation_Transcension_-_Extinction_of_Suffering.png'
import c5 from './Constellation_Evolution_Eon_-_Origin_of_Ignorance.png'
import c6 from './Constellation_Conqueror_of_Evil_-_Guardian_Yaksha.png'
import normal from './Talent_Whirlwind_Thrust.png'
import skill from './Talent_Lemniscatic_Wind_Cycling.png'
import burst from './Talent_Bane_of_All_Evil.png'
import passive1 from './Talent_Evil_Conqueror_-_Tamer_of_Demons.png'
import passive2 from './Talent_Dissolution_Eon_-_Heaven_Fall.png'
import passive3 from './Talent_Transcension_-_Gravity_Defier.png'
import Stat from '../../../Stat'
import Character from '../../../Character/Character'
import DisplayPercent from '../../../Components/DisplayPercent'

//AUTO

const hitPercent = [
  [27.54, 29.42, 31.3, 33.8, 35.68, 37.87, 40.69, 43.51, 46.32, 49.14, 51.96, 54.78, 57.59, 60.41, 63.23],//1 hits twice
  [56.94, 60.82, 64.7, 69.88, 73.76, 78.29, 84.11, 89.93, 95.76, 101.58, 107.4, 113.23, 119.05, 124.87, 130.69],//2
  [68.55, 73.23, 77.9, 84.13, 88.81, 94.26, 101.27, 108.28, 115.29, 122.3, 129.31, 136.33, 143.34, 150.35, 157.36],//3
  [37.66, 40.23, 42.8, 46.22, 48.79, 51.79, 55.64, 59.49, 63.34, 67.2, 71.05, 74.9, 78.75, 82.6, 86.46],//4 hits twice
  [71.54, 76.42, 81.3, 87.8, 92.68, 98.37, 105.69, 113.01, 120.32, 127.64, 134.96, 142.28, 149.59, 156.91, 164.23],
  [95.83, 102.37, 108.9, 117.61, 124.15, 131.77, 141.57, 151.37, 161.17, 170.97, 180.77, 190.58, 200.38, 210.18, 219.98],
]

const charged_atk_dmg = [121.09, 129.34, 137.6, 148.61, 156.86, 166.5, 178.88, 191.26, 203.65, 216.03, 228.42, 240.8, 253.18, 265.57, 277.95]
const plunging_dmg = [81.83, 88.49, 95.16, 104.67, 111.33, 118.94, 129.41, 139.88, 150.35, 161.76, 173.18, 184.6, 196.02, 207.44, 218.86]
const plunging_dmg_low = [163.63, 176.95, 190.27, 209.3, 222.62, 237.84, 258.77, 279.7, 300.63, 323.46, 346.29, 369.12, 391.96, 414.79, 437.62]
const plunging_dmg_high = [204.39, 221.02, 237.66, 261.42, 278.06, 297.07, 323.21, 349.36, 375.5, 404.02, 432.54, 461.06, 489.57, 518.09, 546.61]

//SKILL
const eleSkill = {
  skill_dmg: [252.8, 271.76, 290.72, 316, 334.96, 353.92, 379.2, 404.48, 429.76, 455.04, 480.32, 505.6, 537.2, 568.8, 600.4],
}

//BURST
const eleBurst = {
  atk_bonus: [58.45, 61.95, 65.45, 70, 73.5, 77, 81.55, 86.1, 90.65, 95.2, 99.75, 104.3, 108.85, 113.4, 117.95],
  drain: [3, 3, 3, 2.5, 2.5, 2.5, 2, 2, 2, 2, 2, 2, 2, 2, 2]
}

let char = {
  name: "Xiao",
  cardImg: card,
  thumbImg: thumb,
  star: 5,
  elementKey: "anemo",
  weaponTypeKey: "polearm",
  gender: "M",
  constellationName: "Alatus Nemeseos",
  titles: ["Vigilant Yaksha", "Guardian Yaksha", "Nuo Dance of Evil Conquering", "Alatus, the Golden-Winged King", "Conqueror of Demons"],
  baseStat: {
    characterHP: [991, 2572, 3422, 5120, 5724, 6586, 7391, 8262, 8866, 9744, 10348, 11236, 11840, 12736],
    characterATK: [27, 71, 94, 140, 157, 181, 203, 227, 243, 267, 284, 308, 325, 349],
    characterDEF: [62, 161, 215, 321, 359, 413, 464, 519, 556, 612, 649, 705, 743, 799]
  },
  specializeStat: {
    key: "critRate_",
    value: [0, 0, 0, 0, 4.8, 4.8, 9.6, 9.6, 9.6, 9.6, 14.4, 14.4, 19.2, 19.2]
  },

  talent: {
    auto: {
      name: "Whirlwind Thrust",
      img: normal,
      infusable: true,
      document: [{
        text: <span><strong>Normal Attack</strong> Performs up to 6 consecutive spear strikes.</span>,
        fields: hitPercent.map((percentArr, i) =>
        ({
          text: `${i + 1}-Hit DMG`,
          basicVal: (tlvl, stats, c) => <span>{percentArr[tlvl]}%{(i === 0 || i === 3) ? " × 2" : ""} {Stat.printStat(Character.getTalentStatKey("normal", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (percentArr[tlvl] / 100) * ((i === 0 || i === 3) ? 2 : 1) * stats[Character.getTalentStatKey("normal", c)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("normal", c)]: (percentArr[tlvl] / 100) * ((i === 0 || i === 3) ? 2 : 1) }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("normal", c),
        }))
      }, {
        text: <span><strong>Charged Attack</strong> Consumes a certain amount of Stamina to perform an upward thrust.</span>,
        fields: [{
          text: `Charged Attack DMG`,
          basicVal: (tlvl, stats, c) => <span>{charged_atk_dmg[tlvl]}% {Stat.printStat(Character.getTalentStatKey("charged", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (charged_atk_dmg[tlvl] / 100) * stats[Character.getTalentStatKey("charged", c)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("charged", c)]: charged_atk_dmg[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("charged", c),
        }, {
          text: `Stamina Cost`,
          value: 25,
        }]
      }, {
        text: <span><strong>Plunging Attack</strong> Plunges from mid-air to strike the ground from below, damaging opponents along the path and dealing AoE DMG upon impact. Xiao does not take DMG from performing Plunging Attacks.</span>,
        fields: [{
          text: `Plunge DMG`,
          basicVal: (tlvl, stats, c) => <span>{plunging_dmg[tlvl]}% {Stat.printStat(Character.getTalentStatKey("plunging", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (plunging_dmg[tlvl] / 100) * stats[Character.getTalentStatKey("plunging", c)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("plunging", c)]: plunging_dmg[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("plunging", c),
        }, {
          text: `Low Plunge DMG`,
          basicVal: (tlvl, stats, c) => <span>{plunging_dmg_low[tlvl]}% {Stat.printStat(Character.getTalentStatKey("plunging", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (plunging_dmg_low[tlvl] / 100) * stats[Character.getTalentStatKey("plunging", c)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("plunging", c)]: plunging_dmg_low[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("plunging", c),
        }, {
          text: `High Plunge DMG`,
          basicVal: (tlvl, stats, c) => <span>{plunging_dmg_high[tlvl]}% {Stat.printStat(Character.getTalentStatKey("plunging", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (plunging_dmg_high[tlvl] / 100) * stats[Character.getTalentStatKey("plunging", c)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("plunging", c)]: plunging_dmg_high[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("plunging", c),
        }]
      }],
    },
    skill: {
      name: "Lemniscatic Wind Cycling",
      img: skill,
      document: [{
        text: <span>
          <p className="mb-2">Xiao lunges forward, dealing <span className="text-anemo">Anemo DMG</span> to opponents in his path.</p>
          <p className="mb-2">Can be used in mid-air.<br />Starts with 2 charges.</p>
        </span>,
        fields: [{
          text: "Skill DMG",
          basicVal: (tlvl, stats, c) => <span>{eleSkill.skill_dmg[tlvl]}% {Stat.printStat(Character.getTalentStatKey("skill", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (eleSkill.skill_dmg[tlvl] / 100) * stats[Character.getTalentStatKey("skill", c)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("skill", c)]: eleSkill.skill_dmg[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("skill", c),
        }, {
          text: "CD",
          value: "10s",
        }, (c, a) => ({
          text: "Charges",
          value: c >= 1 ? "2 + 1" : `2`,
        }),]
      }],
    },
    burst: {
      name: "Bane of All Evil",
      img: burst,
      document: [{
        text: <span>
          <p className="mb-2">Xiao dons the Yaksha Mask that set gods and demons trembling millennia ago.</p>
          <p className="mb-2"><b>Yaksha's Mask:</b></p>
          <ul className="mb-2">
            <li>Greatly increases Xiao's jumping ability.</li>
            <li>Increases his attack AoE and attack DMG.</li>
            <li>Converts attack DMG into <span className="text-anemo">Anemo DMG</span>, which cannot be overriden by any other elemental infusion.</li>
          </ul>
          <p className="mb-2">In this state, Xiao will continuously lose HP.<br />The effects of this skill end when Xiao leaves the field.</p>
        </span>,
        fields: [{
          text: "Normal/Charged/Plunging Attack DMG Bonus",
          value: (tlvl, stats, c) => <span>{eleBurst.atk_bonus[tlvl]}%</span>,
        }, {
          text: "Duration",
          value: "15s",
        }, {
          text: "CD",
          value: "18s",
        }, {
          text: "Energy Cost",
          value: 70,
        }],
        conditional: (tlvl, c, a) => ({
          type: "character",
          conditionalKey: "BaneOfAllEvil",
          condition: "Bane of All Evil",
          sourceKey: "xiao",
          maxStack: 1,
          stats: {
            normal_dmg_: eleBurst.atk_bonus[tlvl],
            charged_dmg_: eleBurst.atk_bonus[tlvl],
            plunging_dmg_: eleBurst.atk_bonus[tlvl],
          }
        })
      }],
    },
    passive1: {
      name: "Evil Conqueror - Tamer of Demons",
      img: passive1,
      document: [{
        text: <span>While under the effects of <b>Bane of All Evil</b>, all DMG dealt by Xiao increases by 5%. DMG increases by a further 5% for every 3s the ability persists. The maximum DMG Bonus is 25%.</span>,
        conditional: (tlvl, c, a) => a >= 1 && {
          type: "character",
          conditionalKey: "TamerofDemons",
          condition: "Tamer of Demons",
          sourceKey: "xiao",
          maxStack: 5,
          stats: {
            dmg_: 5,
          }
        }
      }],
    },
    passive2: {
      name: "Dissolution Eon - Heaven Fall",
      img: passive2,
      document: [{
        text: <span>Using <b>Lemniscatic Wind Cycling</b> increases the DMG of subsequent uses of Lemniscatic Wind Cycling by 15%. This effect lasts for 7s, and has a maximum of 3 stacks. Gaining a new stack refreshes the effect's duration.</span>,
        conditional: (tlvl, c, a) => a >= 1 && {
          type: "character",
          conditionalKey: "HeavenFall",
          condition: "Heaven Fall",
          sourceKey: "xiao",
          maxStack: 3,
          stats: {
            skill_dmg_: 15,
          }
        }
      }],
    },
    passive3: {
      name: "Transcension - Gravity Defier",
      img: passive3,
      document: [{
        text: <span>Decreases climbing Stamina consumption for your own party members by 20%.<br />Not stackable with Passive Talents that provide the exact same effects.</span>
      }],
    },
    constellation1: {
      name: "Dissolution Eon: Destroyer of Worlds",
      img: c1,
      document: [{ text: <span>Increases <b>Lemniscatic Wind Cycling</b>'s charges by 1.</span> }],
    },
    constellation2: {
      name: "Annihilation Eon: Blossom of Kaleidos",
      img: c2,
      document: [{
        text: <span>When in party but not on the field, Xiao's Energy Recharge is increased by 25%.</span>,
        conditional: (tlvl, c, a) => c >= 2 && {
          type: "character",
          conditionalKey: "BlossomofKaleidos",
          condition: "Blossom of Kaleidos",
          sourceKey: "xiao",
          maxStack: 1,
          stats: {
            enerRech_: 25,
          }
        }
      }],
    },
    constellation3: {
      name: "Conqueror of Evil: Wrath Deity",
      img: c3,
      document: [{ text: <span>Increases the Level of <b>Lemniscatic Wind Cycling</b> by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { skill: 3 }
    },
    constellation4: {
      name: "Transcension: Extinction of Suffering",
      img: c4,
      document: [{
        text: (tlvl, stats, c) => <span>When Xiao's HP falls below 50%{DisplayPercent(50, stats, "finalHP")}, he gains a 100% DEF Bonus.</span>,
        conditional: (tlvl, c, a) => c >= 4 && {
          type: "character",
          conditionalKey: "ExtinctionofSuffering",
          condition: "Extinction of Suffering",
          sourceKey: "xiao",
          maxStack: 1,
          stats: {
            def_: 100,
          }
        }
      }],
    },
    constellation5: {
      name: "Evolution Eon: Origin of Ignorance",
      img: c5,
      document: [{ text: <span>Increases the Level of <b>Bane of All Evil</b> by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { burst: 3 }
    },
    constellation6: {
      name: "Conqueror of Evil: Guardian Yaksha",
      img: c6,
      document: [{ text: <span>While under the effects of <b>Bane of All Evil</b>, hitting at least 2 opponents with Xiao's Plunging Attack will immediately grant him 1 charge of <b>Lemniscatic Wind Cycling</b> and for the next 1s, he may use Lemniscatic Wind Cycling while ignoring its CD.</span> }],
    }
  },
};
export default char;
