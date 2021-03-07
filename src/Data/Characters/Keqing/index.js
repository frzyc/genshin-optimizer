import card from './Character_Keqing_Card.jpg'
import thumb from './Character_Keqing_Thumb.png'
import c1 from './Constellation_Thundering_Might.png'
import c2 from './Constellation_Keen_Extraction.png'
import c3 from './Constellation_Foreseen_Reformation.png'
import c4 from './Constellation_Attunement.png'
import c5 from './Constellation_Beckoning_Stars.png'
import c6 from './Constellation_Tenacious_Star.png'
import normal from './Talent_Yunlai_Swordsmanship.png'
import skill from './Talent_Stellar_Restoration.png'
import burst from './Talent_Starward_Sword.png'
import passive1 from './Talent_Thundering_Penance.png'
import passive2 from './Talent_Aristocratic_Dignity.png'
import passive3 from './Talent_Land\'s_Overseer.png'
import DisplayPercent from '../../../Components/DisplayPercent'
import Character from '../../../Character/Character'
import Stat from '../../../Stat'

//AUTO
const hitPercent = [
  [41.02, 44.36, 47.7, 52.47, 55.81, 59.62, 64.87, 70.12, 75.37, 81.09, 86.81, 92.54, 98.26, 103.99, 109.71],
  [41.02, 44.36, 47.7, 52.47, 55.81, 59.62, 64.87, 70.12, 75.37, 81.09, 86.81, 92.54, 98.26, 103.99, 109.71],
  [54.44, 58.87, 63.3, 69.63, 74.06, 79.13, 86.09, 93.05, 100.01, 107.61, 115.21, 122.8, 130.4, 137.99, 145.59],
  [31.48, 34.04, 36.6, 40.26, 42.82, 45.75, 49.78, 53.8, 57.83, 62.22, 66.61, 71, 75.4, 79.79, 84.18],
  [34.4, 37.2, 40, 44, 46.8, 50, 54.4, 58.8, 63.2, 68, 72.8, 77.6, 82.4, 87.2, 92],
  [66.99, 72.45, 77.9, 85.69, 91.14, 97.38, 105.94, 114.51, 123.08, 132.43, 141.78, 151.13, 160.47, 169.82, 179.17],
]

const charged_1 = [76.8, 83.05, 89.3, 98.23, 104.48, 111.63, 121.45, 131.27, 141.09, 151.81, 162.53, 173.24, 183.96, 194.67, 205.39]
const charged_2 = [86, 93, 100, 110, 117, 125, 136, 147, 158, 170, 182, 194, 206, 218, 230]
const plunging_dmg = [63.93, 69.14, 74.34, 81.77, 86.98, 92.93, 101.1, 109.28, 117.46, 126.38, 135.3, 144.22, 153.14, 162.06, 170.98]
const plunging_dmg_low = [127.84, 138.24, 148.65, 163.51, 173.92, 185.81, 202.16, 218.51, 234.86, 252.7, 270.54, 288.38, 306.22, 324.05, 341.89]
const plunging_dmg_high = [159.68, 172.67, 185.67, 204.24, 217.23, 232.09, 252.51, 272.93, 293.36, 315.64, 337.92, 360.2, 382.48, 404.76, 427.04]

//SKILL
const stellar = {
  stilleto_dmg: [50.4, 54.18, 57.96, 63, 66.78, 70.56, 75.6, 80.64, 85.68, 90.72, 95.76, 100.8, 107.1, 113.4, 119.7],
  slashing_dmg: [168, 180.6, 193.2, 210, 222.6, 235.2, 252, 268.8, 285.6, 302.4, 319.2, 336, 357, 378, 399],
  thunderclasp_slash_dmg: [84, 90.3, 96.6, 105, 111.3, 117.6, 126, 134.4, 142.8, 151.2, 159.6, 168, 178.5, 189, 199.5],
}

//BURST
const starwardSword = {
  skill_dmg: [88, 94.6, 101.2, 110, 116.6, 123.2, 132, 140.8, 149.6, 158.4, 167.2, 176, 187, 198, 209],
  consec_slash_dmg: [24, 25.8, 27.6, 30, 31.8, 33.6, 36, 38.4, 40.8, 43.2, 45.6, 48, 51, 54, 57],
  last_dmg: [188.8, 202.96, 217.12, 236, 250.16, 264.32, 283.2, 302.08, 320.96, 339.84, 358.72, 377.6, 401.2, 424.8, 448.4],
}

let char = {
  name: "Keqing",
  cardImg: card,
  thumbImg: thumb,
  star: 5,
  elementKey: "electro",
  weaponTypeKey: "sword",
  gender: "F",
  constellationName: "Trulla Cementarii",
  titles: ["Driving Thunder", "Yuheng of the Liyue Qixing"],
  baseStat: {
    characterHP: [1020, 2646, 3521, 5268, 5889, 6776, 7604, 8500, 9121, 10025, 10647, 11561, 12182, 13103],
    characterATK: [25, 65, 87, 130, 145, 167, 187, 209, 225, 247, 262, 285, 300, 323],
    characterDEF: [62, 161, 215, 321, 359, 413, 464, 519, 556, 612, 649, 705, 743, 799]
  },
  specializeStat: {
    key: "critDMG_",
    value: [0, 0, 0, 0, 9.6, 9.6, 19.2, 19.2, 19.2, 19.2, 28.8, 28.8, 38.4, 38.4]
  },
  talent: {
    auto: {
      name: "Yunlai Swordsmanship",
      img: normal,
      infusable: true,
      document: [{
        text: <span><strong>Normal Attack</strong> Perform up to 5 rapid strikes. <small><i>Note: the 4th attack hits twice.</i></small></span>,
        fields: hitPercent.map((percentArr, i) =>
        ({
          text: `${i + (i < 4 ? 1 : 0)}-Hit DMG`,
          basicVal: (tlvl, stats, c) => <span>{percentArr[tlvl]}% {Stat.printStat(Character.getTalentStatKey("normal", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (percentArr[tlvl] / 100) * stats[Character.getTalentStatKey("normal", c)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("normal", c)]: percentArr[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("normal", c),
        }))
      }, {
        text: <span><strong>Charged Attack</strong> Consumes a certain amount of Stamina to unleash 2 rapid sword strikes.</span>,
        fields: [{
          text: `1-Hit DMG`,
          basicVal: (tlvl, stats, c) => <span>{charged_1[tlvl]}% {Stat.printStat(Character.getTalentStatKey("charged", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (charged_1[tlvl] / 100) * stats[Character.getTalentStatKey("charged", c)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("charged", c)]: charged_1[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("charged", c),
        }, {
          text: `2-Hit DMG`,
          basicVal: (tlvl, stats, c) => <span>{charged_2[tlvl]}% {Stat.printStat(Character.getTalentStatKey("charged", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (charged_2[tlvl] / 100) * stats[Character.getTalentStatKey("charged", c)],
          formula: (tlvl, stats, c) => ({ [Character.getTalentStatKey("charged", c)]: charged_2[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("charged", c),
        }, {
          text: `Stamina Cost`,
          value: `25`,
        }]
      }, {
        text: <span><strong>Plunging Attack</strong> Plunges from mid-air to strike the ground below, damaging enemies along the path and dealing AoE DMG upon impact.</span>,
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
          formula: (tlvl, stats, c) => ({ [Character.getTalentStatKey("plunging", c)]: plunging_dmg_high[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("plunging", c),
        }]
      }],
    },
    skill: {
      name: "Stellar Restoration",
      img: skill,
      document: [{
        text: <span>
          <p className="mb-2">
            Hurls a Lightning Stiletto that annihilates her enemies like the swift thunder. When the Stiletto hits its target, it deals <span className="text-electro">Electro DMG</span> to enemies in a small AoE, and places a Stiletto Mark on the spot hit.
        </p>
          <p className="mb-2">
            <strong>Hold:</strong> Hold to adjust the direction in which the Stiletto shall be thrown. Stilettos thrown by the Hold attack mode can be suspended in mid-air, allowing Keqing to jump to them when using Stellar Restoration a second time.
        </p>
          <p className="mb-2">
            <strong>Lightning Stiletto:</strong> If Keqing uses Stellar Restoration again or uses a Charged Attack while its duration lasts, it will clear the Stiletto Mark and produce different effects:
        </p>
          <ul>
            <li>If she uses Stellar Restoration again, she will blink to the location of the Mark and unleash one slashing attack that deals <span className="text-electro">AoE Electro DMG</span>. When blinking to a Stiletto that was thrown from a Holding attack, Keqing can leap across obstructing terrain.</li>
            <li>If Keqing uses a Charged Attack, she will ignite a series of thundering cuts at the Mark's location, dealing <span className="text-electro">AoE Electro DMG</span>.</li>
          </ul>
        </span>,
        fields: [{
          text: "Lightning Stiletto DMG",
          basicVal: (tlvl, stats, c) => <span>{stellar.stilleto_dmg[tlvl]}% {Stat.printStat(Character.getTalentStatKey("skill", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (stellar.stilleto_dmg[tlvl] / 100) * stats[Character.getTalentStatKey("skill", c)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("skill", c)]: stellar.stilleto_dmg[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("skill", c),
        }, {
          text: "Slashing DMG",
          basicVal: (tlvl, stats, c) => <span>{stellar.slashing_dmg[tlvl]}% {Stat.printStat(Character.getTalentStatKey("skill", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (stellar.slashing_dmg[tlvl] / 100) * stats[Character.getTalentStatKey("skill", c)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("skill", c)]: stellar.slashing_dmg[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("skill", c),
        }, {
          text: "Thunderclap Slash DMG",
          basicVal: (tlvl, stats, c) => <span>{stellar.slashing_dmg[tlvl]}% × 2 {Stat.printStat(Character.getTalentStatKey("skill", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => ((stellar.slashing_dmg[tlvl] * 2) / 100) * stats[Character.getTalentStatKey("skill", c)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("skill", c)]: (stellar.slashing_dmg[tlvl] * 2) / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("skill", c),
        }, {
          text: "CD",
          value: "7.5s",
        }]
      }],
    },
    burst: {
      name: "Starward Sword",
      img: burst,
      document: [{
        text: <span>
          <p className="mb-2">
            Keqing unleashes the power of lightning, dealing <span className="text-electro">Electro DMG</span> in an AoE.
        </p>
          <p className="mb-2">
            She then blends into the shadow of her blade, striking a series of thunderclap-blows to nearby enemies simultaneously that deal multiple instances of <span className="text-electro">Electro DMG</span>. The final attack deals massive <span className="text-electro">AoE Electro DMG</span>.
        </p>
        </span>,
        fields: [{
          text: "Skill DMG",
          basicVal: (tlvl, stats, c) => <span>{starwardSword.skill_dmg[tlvl]}% {Stat.printStat(Character.getTalentStatKey("burst", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (starwardSword.skill_dmg[tlvl] / 100) * stats[Character.getTalentStatKey("burst", c)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("burst", c)]: starwardSword.skill_dmg[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("burst", c),
        }, {
          text: "Consecutive Slash DMG",
          basicVal: (tlvl, stats, c) => <span>{starwardSword.consec_slash_dmg[tlvl]}% × 8 {Stat.printStat(Character.getTalentStatKey("burst", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => ((starwardSword.consec_slash_dmg[tlvl] * 8) / 100) * stats[Character.getTalentStatKey("burst", c)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("burst", c)]: (starwardSword.consec_slash_dmg[tlvl] * 8) / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("burst", c),
        }, {
          text: "Last Attack DMG",
          basicVal: (tlvl, stats, c) => <span>{starwardSword.last_dmg[tlvl]}% {Stat.printStat(Character.getTalentStatKey("burst", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (starwardSword.last_dmg[tlvl] / 100) * stats[Character.getTalentStatKey("burst", c)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("burst", c)]: starwardSword.last_dmg[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("burst", c),
        }, {
          text: "CD",
          value: "15s",
        }, {
          text: "Energy Cost",
          value: 60,
        }]
      }, {
        conditional: (tlvl, c, a) => a >= 4 && {
          type: "character",
          conditionalKey: "AristocraticDignity",
          condition: "Aristocratic Dignity",
          sourceKey: "keqing",
          maxStack: 1,
          stats: {
            critRate_: 15,
            enerRech_: 15,
          },
          fields: [{
            text: "Duration",
            value: "8s",
          }]
        }
      }],
    },
    passive1: {
      name: "Thundering Penance",
      img: passive1,
      document: [{ text: <span>After recasting <b>Stellar Restoration</b> while a Lightning Stiletto is present, Keqing's weapon gains an <span className="text-electro">Electro Infusion</span> for 5s.</span> }],
    },
    passive2: {
      name: "Aristocratic Dignity",
      img: passive2,
      document: [{ text: <span>When casting <b>Starward Sword</b>, Keqing's CRIT Rate is increased by 15%, and her Energy Recharge is increased by 15%. This effect lasts for 8s.</span> }],
    },
    passive3: {
      name: "Land's Overseer",
      img: passive3,
      document: [{ text: <span>When dispatched on an expedition in <b>Liyue</b>, time consumed is reduced by 25%.</span> }],
    },
    constellation1: {
      name: "Thundering Might",
      img: c1,
      document: [{ text: (tlvl, s, c) => <span>Recasting <b>Stellar Restoration</b> while a Lightning Stiletto is present causes Keqing to deal 50% of her ATK{DisplayPercent(50, s, Character.getTalentStatKey("ele", c))} as <span className="text-electro">AoE Electro DMG</span> at the start point and terminus of her Blink.</span> }],
    },
    constellation2: {
      name: "Keen Extraction",
      img: c2,
      document: [{ text: <span>When Keqing's Normal and Charged Attacks hit enemies affected by <span className="text-electro">Electro</span>, they have a 50% chance of producing an Elemental Particle. This effect can only occur once every 5s.</span> }],
    },
    constellation3: {
      name: "Foreseen Reformation",
      img: c3,
      document: [{ text: <span>Increases the level of <b>Starward Sword</b> by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { burst: 3 }
    },
    constellation4: {
      name: "Attunement",
      img: c4,
      document: [{ text: <span>For 10s after Keqing triggers an <span className="text-electro">Electro-related Elemental Reaction</span>, her ATK is increased by 25%.</span> }, {
        conditional: (tlvl, c, a) => c >= 4 && {
          type: "character",
          conditionalKey: "Trigger",
          condition: "Trigger an Electro-related Elemental Reaction",
          sourceKey: "keqing",
          maxStack: 1,
          stats: {
            atk_: 25,
          },
          fields: [{
            text: "Duration",
            value: "10s",
          }]
        }
      }],
    },
    constellation5: {
      name: "Beckoning Stars",
      img: c5,
      document: [{ text: <span>Increases the level of <b>Stellar Restoration</b> by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { skill: 3 }
    },
    constellation6: {
      name: "Tenacious Star",
      img: c6,
      document: [{ text: <span>When initiating a Normal Attack, a Charged Attack, Elemental Skill or Elemental Burst, Keqing gains a 6% <span className="text-electro">Electro DMG Bonus</span> for 8s. Effects triggered by Normal Attacks, Charged Attacks, Elemental Skills, and Elemental Bursts are considered independent entities.</span> }, {
        conditional: (tlvl, c, a) => c >= 6 && {
          type: "character",
          conditionalKey: "Initating",
          condition: "Initiating Normal/Charged Attack, Skill or Burst",
          sourceKey: "keqing",
          maxStack: 1,
          stats: {
            electro_dmg_: 6,
          },
          fields: [{
            text: "Duration",
            value: "8s",
          }]
        }
      }],
    },
  },
};
export default char;
