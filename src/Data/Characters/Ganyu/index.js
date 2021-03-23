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
import Stat from '../../../Stat'
import formula, { data } from './data'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'

const char = {
  name: "Ganyu",
  cardImg: card,
  thumbImg: thumb,
  star: 5,
  elementKey: "cryo",
  weaponTypeKey: "bow",
  gender: "F",
  constellationName: "Sinae Unicornis",
  titles: ["Plenilune Gaze"],
  baseStat: data.baseStat,
  specializeStat: data.specializeStat,
  formula,
  talent: {
    auto: {
      name: "Liutian Archery",
      img: normal,
      infusable: false,
      document: [{
        text: <span><strong>Normal Attack</strong> Perform up to 6 consecutive shots with a bow.</span>,
        fields: data.normal.hitArr.map((percentArr, i) =>
        ({
          text: `${i + 1}-Hit DMG`,
          formulaText: stats => <span>{percentArr[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
          formula: formula.normal[i],
          variant: stats => getTalentStatKeyVariant("normal", stats),
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
          formulaText: stats => <span>{data.charged.aimedShot[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
          formula: formula.charged.aimShot,
          variant: stats => getTalentStatKeyVariant("charged", stats),
        }, {
          text: `Aimed Shot Charge Level 1`,
          formulaText: stats => <span>{data.charged.aimShot1[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats, true), stats)}</span>,
          formula: formula.charged.aimShot1,
          variant: stats => getTalentStatKeyVariant("charged", stats, true),
        }, {
          text: `Frostflake Arrow DMG`,
          formulaText: stats => {
            if (stats.hitMode === "avgHit") {
              let { talentConditionals = [] } = stats
              let conditionalNum = ConditionalsUtil.getConditionalNum(talentConditionals, { srcKey: "auto", srcKey2: "UndividedHeart" })
              if (conditionalNum) {
                const statKey = `cryo${stats.reactionMode === "cryo_melt" ? "_melt" : ""}_charged_hit`
                return <span>{data.charged.frostflake[stats.tlvl.auto]}% {Stat.printStat(statKey, stats)} * (1 + Min( 100% , 20% + {Stat.printStat("critRate_", stats)} + {Stat.printStat("charged_critRate_", stats)} ) * {Stat.printStat("critDMG_", stats)} )</span>
              }
            }
            return <span>{data.charged.frostflake[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats, true), stats)}</span>
          },
          formula: formula.charged.frostflake,
          variant: stats => getTalentStatKeyVariant("charged", stats, true),
        }, {
          text: `Frostflake Arrow Bloom DMG`,
          formulaText: stats => {
            if (stats.hitMode === "avgHit") {
              let { talentConditionals = [] } = stats
              let conditionalNum = ConditionalsUtil.getConditionalNum(talentConditionals, { srcKey: "auto", srcKey2: "UndividedHeart" })
              if (conditionalNum) {
                const statKey = `cryo${stats.reactionMode === "cryo_melt" ? "_melt" : ""}_charged_hit`
                return <span>{data.charged.frostflakeBloom[stats.tlvl.auto]}% {Stat.printStat(statKey, stats)} * (1 + Min( 100% , 20% + {Stat.printStat("critRate_", stats)} + {Stat.printStat("charged_critRate_", stats)} ) * {Stat.printStat("critDMG_", stats)} )</span>
              }
            }
            return <span>{data.charged.frostflakeBloom[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats, true), stats)}</span>
          },
          formula: formula.charged.frostflakeBloom,
          variant: stats => getTalentStatKeyVariant("charged", stats, true),
        },],
        conditional: stats => stats.ascension >= 1 && {
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
        conditional: stats => stats.constellation >= 1 && {
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
          formulaText: stats => <span>{data.plunging.dmg[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
          formula: formula.plunging.dmg,
          variant: stats => getTalentStatKeyVariant("plunging", stats),
        }, {
          text: `Low Plunge DMG`,
          formulaText: stats => <span>{data.plunging.low[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
          formula: formula.plunging.low,
          variant: stats => getTalentStatKeyVariant("plunging", stats),
        }, {
          text: `High Plunge DMG`,
          formulaText: stats => <span>{data.plunging.high[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
          formula: formula.plunging.high,
          variant: stats => getTalentStatKeyVariant("plunging", stats),
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
          formulaText: stats => <span>{data.skill.hp[stats.tlvl.skill]}% {Stat.printStat("finalHP", stats)}</span>,
          formula: formula.skill.hp,
          variant: stats => "success",
        }, {
          text: "Skill DMG",
          formulaText: stats => <span>{data.skill.dmg[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.dmg,
          variant: stats => getTalentStatKeyVariant("skill", stats),
        }, {
          text: "Duration",
          value: "6s",
        }, {
          text: "CD",
          value: "10s",
        }, stats => stats.constellation >= 2 && {
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
          formulaText: stats => <span>{data.burst.dmg[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
          formula: formula.burst.dmg,
          variant: stats => getTalentStatKeyVariant("burst", stats),
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
        conditional: stats => stats.ascension >= 4 && {
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
        conditional: stats => stats.constellation >= 4 && {
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
