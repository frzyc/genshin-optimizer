import Character from '../../../Character/Character'
import Stat from '../../../Stat'
import card from './Character_Ganyu_Card.png'
import thumb from './Character_Ganyu_Thumb.png'

import c1 from './Constellation_Dew-Drinker.png'
import c2 from './Constellation_The_Auspicious.png'
import c3 from './Constellation_Cloud-Strider.png'
import c4 from './Constellation_Westward_Sojourn.png'
import c5 from './Constellation_The_Merciful.png'
import c6 from './Constellation_The_Clement.png'
import normal from './Talent_Liutian_Archery.png'
import skill from './Talent_Trail_of_the_Qilin.png'
import burst from './Talent_Celestial_Shower.png'
import passive1 from './Talent_Undivided_Heart.png'
import passive2 from './Talent_Harmony_between_Heaven_and_Earth.png'
import passive3 from './Talent_Preserved_for_the_Hunt.png'
import ConditionalsUtil from '../../../Util/ConditionalsUtil'
//import WeaponPercent from '../../../Components/WeaponPercent'

//AUTO

const hitPercent = [
  [31.73, 34.32, 36.9, 40.59, 43.17, 46.13, 50.18, 54.24, 58.3, 62.73, 67.8, 73.77, 79.74, 85.7, 92.21],
  [35.6, 38.5, 41.4, 45.54, 48.44, 51.75, 56.3, 60.86, 65.41, 70.38, 76.07, 82.77, 89.46, 96.16, 103.46],
  [45.49, 49.2, 52.9, 58.19, 61.89, 66.13, 71.94, 77.76, 83.58, 89.93, 97.2, 105.76, 114.31, 122.87, 132.2],
  [45.49, 49.2, 52.9, 58.19, 61.89, 66.13, 71.94, 77.76, 83.58, 89.93, 97.2, 105.76, 114.31, 122.87, 132.2],
  [48.25, 52.17, 56.1, 61.71, 65.64, 70.13, 76.3, 82.47, 88.64, 95.37, 103.08, 112.16, 121.23, 130.3, 140.19],
  [57.62, 62.31, 67, 73.7, 78.39, 83.75, 91.12, 98.49, 105.86, 113.9, 123.11, 133.95, 144.78, 155.61, 167.43],
]

const aimed = [43.86, 47.43, 51, 56.1, 59.67, 63.75, 69.36, 74.97, 80.58, 86.7, 92.82, 98.94, 105.06, 111.18, 117.3]
const aimed_charg_1 = [124, 133.3, 142.6, 155, 164.3, 173.6, 186, 198.4, 210.8, 223.2, 235.6, 248, 263.5, 279, 294.5]
const frostflake = [128, 137.6, 147.2, 160, 169.6, 179.2, 192, 204.8, 217.6, 230.4, 243.2, 256, 272, 288, 304]
const frostflake_bloom = [217.6, 233.92, 250.24, 272, 288.32, 304.64, 326.4, 348.16, 369.92, 391.68, 413.44, 435.2, 462.4, 489.6, 516.8]
const plunging_dmg = [56.83, 61.45, 66.08, 72.69, 77.31, 82.6, 89.87, 97.14, 104.41, 112.34, 120.27, 128.2, 136.12, 144.05, 151.98]
const plunging_dmg_low = [113.63, 122.88, 132.13, 145.35, 154.59, 165.17, 179.7, 194.23, 208.77, 224.62, 240.48, 256.34, 272.19, 288.05, 303.9]
const plunging_dmg_high = [141.93, 153.49, 165.04, 181.54, 193.1, 206.3, 224.45, 242.61, 260.76, 280.57, 300.37, 320.18, 339.98, 359.79, 379.59]

//SKILL
const eleSkill = {
  inher_hp: [120, 129, 138, 150, 159, 168, 180, 192, 204, 216, 228, 240, 255, 270, 285],
  skill_dmg: [132, 141.9, 151.8, 165, 174.9, 184.8, 198, 211.2, 224.4, 237.6, 250.8, 264, 280.5, 297, 313.5],
}

//BURST
const eleBurst = {
  burst_dmg: [70.27, 75.54, 80.81, 87.84, 93.11, 98.38, 105.41, 112.44, 119.46, 126.49, 133.52, 140.54, 149.33, 158.11, 166.9],
}

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
    characterHP: [763, 1978, 2632, 3939, 4403, 5066, 5686, 6355, 6820, 7495, 7960, 8643, 9108, 9797],
    characterATK: [26, 68, 90, 135, 151, 173, 194, 217, 233, 256, 272, 295, 311, 335],
    characterDEF: [49, 127, 169, 253, 283, 326, 366, 409, 439, 482, 512, 556, 586, 630]
  },
  specializeStat: {
    key: "critDMG_",
    value: [0, 0, 0, 0, 9.6, 9.6, 19.2, 19.2, 19.2, 19.2, 28.8, 28.8, 38.4, 38.4]
  },
  talent: {
    auto: {
      name: "Liutian Archery",
      img: normal,
      infusable: false,
      document: [{
        text: <span><strong>Normal Attack</strong> Perform up to 6 consecutive shots with a bow.</span>,
        fields: hitPercent.map((percentArr, i) =>
        ({
          text: `${i + 1}-Hit DMG`,
          basicVal: (tlvl, stats, c) => <span>{percentArr[tlvl]}% {Stat.printStat(Character.getTalentStatKey("normal", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (percentArr[tlvl] / 100) * stats[Character.getTalentStatKey("normal", c)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("normal", c)]: percentArr[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("normal", c),
        }))
      }, {
        text: <span>
          <p className="mb-2"><strong>Charged Attack</strong> Perform a more precise <b>Aimed Shot</b> with increased DMG. While aiming, an icy aura will accumulate on the arrowhead before the arrow is fired. Has different effects based on how long the energy has been charged:</p>
          <ul className="mb-2">
            <li><b>Charge Level 1</b>: Fires off an icy arrow that deals <span className="text-cryo">Cryo DMG.</span></li>
            <li><b>Charge Level 2</b>: Fires off a Frostflake Arrow that deals <span className="text-cryo">Cryo DMG.</span></li>
          </ul>
          <p className="mb-2">The Frostflake Arrow blooms after hitting its target, dealing <span className="text-cryo">AoE Cryo DMG</span>.</p>
        </span>,
        fields: [{
          text: `Aimed Shot`,
          basicVal: (tlvl, stats, c) => <span>{aimed[tlvl]}% {Stat.printStat(Character.getTalentStatKey("charged", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (aimed[tlvl] / 100) * stats[Character.getTalentStatKey("charged", c)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("charged", c)]: aimed[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("charged", c),
        }, {
          text: `Aimed Shot Charge Level 1`,
          basicVal: (tlvl, stats, c) => <span>{aimed_charg_1[tlvl]}% {Stat.printStat(Character.getTalentStatKey("charged", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (aimed_charg_1[tlvl] / 100) * stats[Character.getTalentStatKey("charged", c)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("charged", c)]: aimed_charg_1[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("charged", c),
        }, {
          text: `Frostflake Arrow DMG`,
          basicVal: (tlvl, stats, c) => {
            if (c.hitMode === "avgHit") {
              let { talentConditionals = [] } = c
              let conditionalNum = ConditionalsUtil.getConditionalNum(talentConditionals, { srcKey: "auto", srcKey2: "UndividedHeart" })
              if (conditionalNum)
                return <span>{frostflake[tlvl]}% {Stat.printStat(Character.getTalentStatKey("charged", c, true), stats)} + (1 + 20% * {Stat.printStat("critDMG_", stats)})</span>
            }
            return <span>{frostflake[tlvl]}% {Stat.printStat(Character.getTalentStatKey("charged", c, true), stats)}</span>
          },
          finalVal: (tlvl, stats, c) => {
            let base = (frostflake[tlvl] / 100) * stats[Character.getTalentStatKey("charged", c, true)]
            if (c.hitMode === "avgHit") {
              let { talentConditionals = [] } = c
              let conditionalNum = ConditionalsUtil.getConditionalNum(talentConditionals, { srcKey: "auto", srcKey2: "UndividedHeart" })
              if (conditionalNum)
                return base * (1 + 0.2 * stats.critDMG_ / 100)
            }
            return base
          },
          formula: (tlvl, _, c) => {
            if (c.hitMode === "avgHit") {
              let { talentConditionals = [] } = c
              let conditionalNum = ConditionalsUtil.getConditionalNum(talentConditionals, { srcKey: "auto", srcKey2: "UndividedHeart" })
              if (conditionalNum)
                return { [Character.getTalentStatKey("charged", c, true)]: { flat: frostflake[tlvl] / 100, critDMG_: frostflake[tlvl] / 100 * 0.2 / 100 } }
            }
            return { [Character.getTalentStatKey("charged", c, true)]: frostflake[tlvl] / 100 }
          },
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("charged", c, true),
        }, {
          text: `Frostflake Arrow Bloom DMG`,
          basicVal: (tlvl, stats, c) => {
            if (c.hitMode === "avgHit") {
              let { talentConditionals = [] } = c
              let conditionalNum = ConditionalsUtil.getConditionalNum(talentConditionals, { srcKey: "auto", srcKey2: "UndividedHeart" })
              if (conditionalNum)
                return <span>{frostflake_bloom[tlvl]}% {Stat.printStat(Character.getTalentStatKey("charged", c, true), stats)} + (1 + 20% * {Stat.printStat("critDMG_", stats)})</span>
            }
            return <span>{frostflake_bloom[tlvl]}% {Stat.printStat(Character.getTalentStatKey("charged", c, true), stats)}</span>
          },
          finalVal: (tlvl, stats, c) => {
            let base = (frostflake_bloom[tlvl] / 100) * stats[Character.getTalentStatKey("charged", c, true)]
            if (c.hitMode === "avgHit") {
              let { talentConditionals = [] } = c
              let conditionalNum = ConditionalsUtil.getConditionalNum(talentConditionals, { srcKey: "auto", srcKey2: "UndividedHeart" })
              if (conditionalNum)
                return base * (1 + 0.2 * stats.critDMG_ / 100)
            }
            return base
          },
          formula: (tlvl, _, c) => {
            if (c.hitMode === "avgHit") {
              let { talentConditionals = [] } = c
              let conditionalNum = ConditionalsUtil.getConditionalNum(talentConditionals, { srcKey: "auto", srcKey2: "UndividedHeart" })
              if (conditionalNum)
                return { [Character.getTalentStatKey("charged", c, true)]: { flat: frostflake_bloom[tlvl] / 100, critDMG_: frostflake_bloom[tlvl] / 100 * 0.2 / 100 } }
            }
            return { [Character.getTalentStatKey("charged", c, true)]: frostflake_bloom[tlvl] / 100 }
          },
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("charged", c, true),
        },],
        conditional: (tlvl, c, a) => a >= 1 && {
          type: "character",
          conditionalKey: "UndividedHeart",
          condition: "Undivided Heart",
          sourceKey: "ganyu",
          maxStack: 1,
          fields: [{
            text: "Frostflake CRIT Rate",
            value: "+20%",
          }, {
            text: "Duration",
            value: "5s",
          }]
        }
      }, {
        conditional: (tlvl, c, a) => c >= 1 && {
          type: "character",
          conditionalKey: "DewDrinker",
          condition: "Dew-Drinker",
          sourceKey: "ganyu",
          maxStack: 1,
          stats: {
            cryo_enemyRes_: -15,
          },
        }
      }, {
        text: <span><strong>Plunging Attack</strong> Fires off a shower of arrows in mid-air before falling and striking the ground, dealing AoE DMG upon impact.</span>,
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
      name: "Trail of the Qilin",
      img: skill,
      document: [{
        text: <span>
          <p className="mb-2">Leaving a single Ice Lotus behind, Ganyu dashes backward, shunning all impurity and dealing <span className="text-cryo">AoE Cryo DMG.</span></p>
          <h6>Ice Lotus:</h6>
          <ul className="mb-2">
            <li>Continuously taunts surrounding opponents, attracting them to attack it.</li>
            <li>Endurance scales based on Ganyu's Max HP.</li>
            <li>Blooms profusely when destroyed or once its duration ends, dealing <span className="text-cryo">AoE Cryo DMG.</span></li>
          </ul>
          <p className="mb-2">Generates 2 elemental particles when the creation hits at least 1 target, and 2 elemental particles when the explosion hits at least 1 target</p>
        </span>,
        fields: [{
          text: "Inherited HP",
          basicVal: (tlvl, stats, c) => <span>{eleSkill.inher_hp[tlvl]}% {Stat.printStat("finalHP", stats)}</span>,
          finalVal: (tlvl, stats, c) => (eleSkill.inher_hp[tlvl] / 100) * stats.finalHP,
          formula: (tlvl, _, c) => ({ finalHP: eleSkill.inher_hp[tlvl] / 100 }),
          variant: (tlvl, stats, c) => "success",
        }, {
          text: "Skill DMG",
          basicVal: (tlvl, stats, c) => <span>{eleSkill.skill_dmg[tlvl]}% {Stat.printStat(Character.getTalentStatKey("skill", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (eleSkill.skill_dmg[tlvl] / 100) * stats[Character.getTalentStatKey("skill", c)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("skill", c)]: eleSkill.skill_dmg[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("skill", c),
        }, {
          text: "Duration",
          value: "6s",
        }, {
          text: "CD",
          value: "10s",
        }, (c, a) => c >= 2 && {
          text: "Charges",
          value: 2
        }]
      }],
    },
    burst: {
      name: "Celestial Shower",
      img: burst,
      document: [{
        text: <span>
          <p className="mb-2">
            Coalesces atmospheric frost and snow to summon a Sacred Cryo Pearl that exorcises evil.
          </p>
          <p className="mb-2">
            During its ability duration, the Sacred Cryo Pearl will continuously rain down shards of ice, striking opponents within an AoE and dealing <span className="text-cryo">Cryo DMG</span>.
          </p>
        </span>,
        fields: [{
          text: "Ice Shard DMG",
          basicVal: (tlvl, stats, c) => <span>{eleBurst.burst_dmg[tlvl]}% {Stat.printStat(Character.getTalentStatKey("burst", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (eleBurst.burst_dmg[tlvl] / 100) * stats[Character.getTalentStatKey("burst", c)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("burst", c)]: eleBurst.burst_dmg[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("burst", c),
        }, {
          text: "Duration",
          value: "15s",
        }, {
          text: "CD",
          value: "15s",
        }, {
          text: "Energy Cost",
          value: 60,
        }],
        conditional: (tlvl, c, a) => a >= 4 && {
          type: "character",
          conditionalKey: "Harmony",
          condition: "Harmony between Heaven and Earth",
          sourceKey: "ganyu",
          maxStack: 1,
          stats: {
            cryo_dmg_: 20,
          },
        }
      }, {
        conditional: (tlvl, c, a) => c >= 4 && {
          type: "character",
          conditionalKey: "WestwardSojourn",
          condition: "Westward Sojourn",
          sourceKey: "ganyu",
          maxStack: 5,
          stats: {
            dmg_: 5,
          },
          fields: [{
            text: "Effect Linger Duration",
            value: "3s"
          }]
        }
      }],
    },
    passive1: {
      name: "Undivided Heart",
      img: passive1,
      document: [{ text: <span>After firing a <b>Frostflake</b> Arrow, the CRIT Rate of subsequent Frostflake Arrows and their resulting bloom effects is increased by 20% for 5s.</span> }],
    },
    passive2: {
      name: "Harmony between Heaven and Earth",
      img: passive2,
      document: [{ text: <span><b>Celestial Shower</b> grants a 20% <span className="text-cryo">Cryo DMG Bonus</span> to active members in the AoE.</span> }],
    },
    passive3: {
      name: "Preserved for the Hunt",
      img: passive3,
      document: [{ text: <span>Refunds 15% of the ores used when crafting Bow-type weapons.</span> }],
    },
    constellation1: {
      name: "Dew-Drinker",
      img: c1,
      document: [{
        text: <span>
          <p className="mb-2">Taking DMG from a Charge Level 2 Frostflake Arrow or Frostflake Arrow Bloom decreases opponents' <span className="text-cryo">Cryo RES</span> by 15% for 6s.</p>
          <p className="mb-0">A hit regenerates 2 Energy for Ganyu. This effect can only occur once per Charge Level Frostflake Arrow, regardless if Frostflake Arrow itself or its Bloom hit the target.</p>
        </span>
      }],
    },
    constellation2: {
      name: "The Auspicious",
      img: c2,
      document: [{ text: <span><b>Trail of the Qilin</b> gains 1 additional charge.</span> }],
    },
    constellation3: {
      name: "Cloud-Strider",
      img: c3,
      document: [{ text: <span>Increases the Level of <b>Celestial Shower</b> by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { burst: 3 }
    },
    constellation4: {
      name: "Westward Sojourn",
      img: c4,
      document: [{
        text: <span>
          <p className="mb-2">Opponents standing within the AoE of <b>Celestial Shower</b> take increased DMG. This effect strengthens over time. Increased DMG taken begins at 5% and increases by 5% every 3s, up to a maximum of 25%.</p>
          <p className="mb-0">The effect lingers for 3s after the opponent leaves the AoE.</p>
        </span>
      }],
    },
    constellation5: {
      name: "The Merciful",
      img: c5,
      document: [{ text: <span>Increases the Level of <b>Trail of the Qilin</b> by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { skill: 3 }
    },
    constellation6: {
      name: "The Clement",
      img: c6,
      document: [{ text: <span>Using <b>Trail of the Qilin</b> causes the next Frostflake Arrow shot within 30s to not require charging.</span> }],
    }
  },
};
export default char;
