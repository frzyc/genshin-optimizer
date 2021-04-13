import card from './Character_Noelle_Card.jpg'
import thumb from './Character_Noelle_Thumb.png'
import c1 from './Constellation_I_Got_Your_Back.png'
import c2 from './Constellation_Combat_Maid.png'
import c3 from './Constellation_Invulnerable_Maid.png'
import c4 from './Constellation_To_Be_Cleaned.png'
import c5 from './Constellation_Favonius_Sweeper_Master.png'
import c6 from './Constellation_Must_Be_Spotless.png'
import normal from './Talent_Favonius_Bladework_-_Maid.png'
import skill from './Talent_Breastplate.png'
import burst from './Talent_Sweeping_Time.png'
import passive1 from './Talent_Devotion.png'
import passive2 from './Talent_Nice_and_Clean.png'
import passive3 from './Talent_Maid\'s_Knighthood.png'
import DisplayPercent from '../../../Components/DisplayPercent'
import Stat from '../../../Stat'
import formula, { data } from './data'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'

const char = {
  name: "Noelle",
  cardImg: card,
  thumbImg: thumb,
  star: 4,
  elementKey: "geo",
  weaponTypeKey: "claymore",
  gender: "F",
  constellationName: "Parma Cordis",
  titles: ["Chivalric Blossom", "Maid of Favonius"],
  baseStat: data.baseStat,
  specializeStat: data.specializeStat,
  formula,
  talent: {
    auto: {
      name: "Favonius Bladework - Maid",
      img: normal,
      infusable: true,
      document: [{
        text: <span><strong>Normal Attack</strong> Performs up to 4 consecutive slashes.</span>,
        fields: data.normal.hitArr.map((percentArr, i) =>
        ({
          text: `${i + 1}-Hit DMG`,
          formulaText: stats => <span>{percentArr[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
          formula: formula.normal[i],
          variant: stats => getTalentStatKeyVariant("normal", stats),
        }))
      }, {
        text: <span><strong>Charged Attack</strong> Drains Stamina over time to perform continuous swirling attack on all nearby enemies. At the end of the sequence, performs an additional powerful slash</span>,
        fields: [{
          text: `Spinning DMG`,
          formulaText: stats => <span>{data.charged.spinning[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
          formula: formula.charged.spinning,
          variant: stats => getTalentStatKeyVariant("charged", stats),
        }, {
          text: `Spinning Final DMG`,
          formulaText: stats => <span>{data.charged.final[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
          formula: formula.charged.final,
          variant: stats => getTalentStatKeyVariant("charged", stats),
        }, {
          text: `Stamina Cost`,
          value: `40/s`,
        }, {
          text: `Max Duration`,
          value: `5s`,
        }]
      }, {
        text: <span><strong>Plunging Attack</strong> Plunges from mid-air to strike the ground below, damaging opponents along the path and dealing AoE DMG upon impact.</span>,
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
      },],
    },
    skill: {
      name: "Breastplate",
      img: skill,
      document: [{
        text: <span>
          <p className="mb-2">Summons protective stone armor, dealing <span className="text-geo">Geo DMG</span> to surrounding enemies and creating a shield. The shield's DMG Absorption scales based on Noelle's DEF.</p>
          <p className="mb-2">The shield has the following properties:</p>
          <ul className="mb-2">
            <li>When Noelle's Normal and Charged Attacks hit a target, they have a certain chance to regenerate HP for all characters.</li>
            <li>Possesses 150% DMG Absorption efficiency against all Elemental and <span className="text-physical">Physical DMG</span>.</li>
          </ul>
          <p className="mb-2">The amount of HP healed when regeneration is triggered scales based on Noelle's DEF.</p>
        </span>,
        fields: [{
          text: "Skill DMG",
          formulaText: stats => <span>{data.skill.skill_dmg[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats) + "_multi", stats)} * {Stat.printStat("finalDEF", stats)}</span>,
          formula: formula.skill.skill_dmg,
          variant: stats => getTalentStatKeyVariant("skill", stats),
        }, {
          text: "Shield DMG Absorption",
          formulaText: stats => <span>{data.skill.shield_def[stats.tlvl.skill]}% {Stat.printStat("finalDEF", stats)} + {data.skill.shield_flat[stats.tlvl.skill]}</span>,
          formula: formula.skill.shield,
        }, {
          text: "Healing",
          formulaText: stats => <span>( {data.skill.heal_def[stats.tlvl.skill]}% {Stat.printStat("finalDEF", stats)} + {data.skill.heal_flat[stats.tlvl.skill]} ) * {Stat.printStat("heal_multi", stats)}</span>,
          formula: formula.skill.heal,
          variant: "success"
        }, {
          text: "Trigger Chance",
          value: stats => <span>{data.skill.heal_trigger[stats.tlvl.skill]}%{stats.constellation >= 1 ? <span> (100% while <b>Sweeping Time</b> and <b>Breastplate</b> are both in effect)</span> : ""}</span>,
        }, {
          text: "Duration",
          value: "12s",
        }, {
          text: "CD",
          value: stats => "24s" + (stats.ascension > 4 ? " -1s Every 4 hits" : ""),
        }],
      }],
    },
    burst: {
      name: "Sweeping Time",
      img: burst,
      document: [{
        text: <span>
          <p className="mb-2">Gathering the strength of stone around her weapon, Noelle strikes the enemies surrounding her within a large AoE, dealing <span className="text-geo">Geo DMG</span>.</p>
          <p className="mb-2">Afterwards, Noelle gains the following effects:</p>
          <ul className="mb-2">
            <li>Larger attack AoE</li>
            <li>Converts attack DMG to <span className="text-geo">Geo DMG</span></li>
            <li>Increased ATK that scales based on her DEF.</li>
          </ul>
        </span>,
        fields: [{
          text: "Burst DMG",
          formulaText: stats => <span>{data.burst.burst_dmg[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
          formula: formula.burst.burst_dmg,
          variant: stats => getTalentStatKeyVariant("burst", stats),
        }, {
          text: "Skill DMG",
          formulaText: stats => <span>{data.burst.skill_dmg[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
          formula: formula.burst.skill_dmg,
          variant: stats => getTalentStatKeyVariant("burst", stats),
        }, {
          text: "ATK Bonus",
          formulaText: stats => <span>{data.burst.bonus[stats.tlvl.burst]}% {stats.constellation >= 6 ? "+50% " : ""}{Stat.printStat("finalDEF", stats)}</span>,
          formula: formula.burst.bonus,
        }, {
          text: "Duration",
          value: stats => "15s" + (stats.constellation >= 6 ? " +1s per kill, up to 10s" : ""),
        }, {
          text: "CD",
          value: "15s",
        }, {
          text: "Energy Cost",
          value: 60,
        }],
        conditional: stats => ({
          type: "character",
          conditionalKey: "Sweeping",
          condition: "Sweeping Time",
          sourceKey: "noelle",
          maxStack: 1,
          stats: {
            modifiers: { finalATK: { finalDEF: (data.burst.bonus[stats.tlvl.burst] + (stats.constellation >= 6 ? 50 : 0)) / 100 } },
          },
        })
      }],
    },
    passive1: {
      name: "Devotion",
      img: passive1,
      document: [{
        text: stats => <span>
          <p className="mb-2">When Noelle is in the party but not on the field, this ability triggers automatically when your active character's HP falls below 30%:</p>
          <p className="mb-0">Creates a shield for your active character that lasts for 20s and absorbs DMG equal to 400% of Noelle's DEF. This effect can only occur once every 60s.</p>
        </span>,
        fields: [stats => stats.ascension >= 1 && {
          text: "Shield strength",
          formulaText: stats => <span>400% {Stat.printStat("finalDEF", stats)}</span>,
          formula: formula.passive1.shield,
        }, stats => stats.ascension >= 1 && {
          text: "CD",
          value: "60s",
        }]
      }],
    },
    passive2: {
      name: "Nice and Clean",
      img: passive2,
      document: [{
        text: <span>
          Every 4 Normal or Charged Attack hits will decrease the CD of <b>Breastplate</b> by 1s.
          Hitting multiple enemies with a single attack is only counted as 1 hit.
        </span>
      }],
    },
    passive3: {
      name: "Maid's Knighthood",
      img: passive3,
      document: [{
        text: <span>When a Perfect Cooking is achieved on a DEF-boosting dish, Noelle has a 12% chance to obtain double the product.</span>
      }]
    },
    constellation1: {
      name: "I Got Your Back",
      img: c1,
      document: [{ text: <span>While <b>Sweeping Time</b> and <b>Breastplate</b> are both in effect, attacks hits have a 100% chance to trigger <b>Breastplate</b>'s healing effects.</span> }]
    },
    constellation2: {
      name: "Combat Maid",
      img: c2,
      document: [{ text: <span>Decreases Noelle's Stamina Consumption of <b>Charged Attacks</b> by 20% and increases <b>Charged Attack</b> DMG by 15%.</span> }],
      stats: {
        charged_dmg_: 15,
        staminaChargedDec_: 20,
      }
    },
    constellation3: {
      name: "Invulnerable Maid",
      img: c3,
      document: [{ text: <span>Increases <b>Breastplate</b>'s skill level by 3. Max level is 15</span> }],
      talentBoost: { skill: 3 }
    },
    constellation4: {
      name: "To Be Cleaned",
      img: c4,
      document: [{
        text: stats => <span>When <b>Breastplate</b> ends or shatters, it deals 400% of ATK as <span className="text-geo">Geo DMG</span> to surrounding enemies.</span>,
        fields: [stats => stats.constellation >= 6 && {
          text: "Breastplate shatter damage",
          formulaText: stats => <span>400% {Stat.printStat(getTalentStatKey("elemental", stats), stats)}</span>,
          formula: formula.constellation4.dmg,
          variant: stats => getTalentStatKeyVariant("elemental", stats),
        }]
      }]
    },
    constellation5: {
      name: "Favonius Sweeper Master",
      img: c5,
      document: [{ text: <span>Increases <b>Sweeping Time</b>'s skill level by 3. Max level is 15.</span> }],
      talentBoost: { burst: 3 }
    },
    constellation6: {
      name: "Must Be Spotless",
      img: c6,
      document: [{ text: stats => <span><b>Sweeping Time</b> increases ATK by an additional 50% of Noelle's DEF{DisplayPercent(50, stats, "finalDEF")}. For the skill's duration, adds 1s duration time per opponent defeated, up to 10s.</span> }]
    }
  }
};
export default char;
