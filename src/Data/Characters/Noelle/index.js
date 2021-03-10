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
import Character from '../../../Character/Character'
import Stat from '../../../Stat'
import formula, {data} from './data'

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
          formulaText: (tlvl, stats, c) => <span>{percentArr[tlvl]}% {Stat.printStat(Character.getTalentStatKey("normal", c), stats)}</span>,
          formula: formula.normal[i],
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("normal", c),
        }))
      }, {
        text: <span><strong>Charged Attack</strong> Drains Stamina over time to perform continuous swirling attack on all nearby enemies. At the end of the sequence, performs an additional powerful slash</span>,
        fields: [{
          text: `Spinning DMG`,
          formulaText: (tlvl, stats, c) => <span>{data.charged.spinning[tlvl]}% {Stat.printStat(Character.getTalentStatKey("charged", c), stats)}</span>,
          formula: formula.charged.spinning,
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("charged", c),
        }, {
          text: `Spinning Final DMG`,
          formulaText: (tlvl, stats, c) => <span>{data.charged.final[tlvl]}% {Stat.printStat(Character.getTalentStatKey("charged", c), stats)}</span>,
          formula: formula.charged.final,
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("charged", c),
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
          formulaText: (tlvl, stats, c) => <span>{data.plunging.dmg[tlvl]}% {Stat.printStat(Character.getTalentStatKey("plunging", c), stats)}</span>,
          formula: formula.plunging.dmg,
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("plunging", c),
        }, {
          text: `Low Plunge DMG`,
          formulaText: (tlvl, stats, c) => <span>{data.plunging.low[tlvl]}% {Stat.printStat(Character.getTalentStatKey("plunging", c), stats)}</span>,
          formula: formula.plunging.low,
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("plunging", c),
        }, {
          text: `High Plunge DMG`,
          formulaText: (tlvl, stats, c) => <span>{data.plunging.high[tlvl]}% {Stat.printStat(Character.getTalentStatKey("plunging", c), stats)}</span>,
          formula: formula.plunging.high,
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("plunging", c),
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
          formulaText: (tlvl, stats, c) => <span>{data.skill.skill_dmg[tlvl]}% {Stat.printStat(Character.getTalentStatKey("skill", c) + "_multi", stats)} * {Stat.printStat("finalDEF", stats)}</span>,
          formula: formula.skill.skill_dmg,
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("skill", c),
        }, {
          text: "Shield DMG Absorption",
          formulaText: (tlvl, stats, c) => <span>{data.skill.shield_def[tlvl]}% {Stat.printStat("finalDEF", stats)} + {data.skill.shield_flat[tlvl]}</span>,
          formula: formula.skill.shield,
        }, {
          text: "Healing",
          formulaText: (tlvl, stats, c) => <span>( {data.skill.heal_def[tlvl]}% {Stat.printStat("finalDEF", stats)} + {data.skill.heal_flat[tlvl]} ) * {Stat.printStat("heal_multi", stats)}</span>,
          formula: formula.skill.heal,
          variant: "success"
        }, (c) => ({
          text: "Trigger Chance",
          value: (tlvl) => <span>{data.skill.heal_trigger[tlvl]}%{c >= 1 ? <span> (100% while <b>Sweeping Time</b> and <b>Breastplate</b> are both in effect)</span> : ""}</span>,
        }), {
          text: "Duration",
          value: "12s",
        }, (c, a) => ({
          text: "CD",
          value: "24s" + (a > 4 ? " -1s Every 4 hits" : ""),
        })],
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
          formulaText: (tlvl, stats, c) => <span>{data.burst.burst_dmg[tlvl]}% {Stat.printStat(Character.getTalentStatKey("burst", c), stats)}</span>,
          formula: formula.burst.burst_dmg,
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("burst", c),
        }, {
          text: "Skill DMG",
          formulaText: (tlvl, stats, c) => <span>{data.burst.skill_dmg[tlvl]}% {Stat.printStat(Character.getTalentStatKey("burst", c), stats)}</span>,
          formula: formula.burst.skill_dmg,
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("burst", c),
        }, {
          text: "ATK Bonus",
          formulaText: (tlvl, stats) => <span>{data.burst.bonus[tlvl]}% {stats.constellation >= 6 ? "+50% " : ""}{Stat.printStat("finalDEF", stats)}</span>,
          formula:  formula.burst.bonus,
        }, (c) => ({
          text: "Duration",
          value: "15s" + (c >= 6 ? " +1s per kill, up to 10s" : ""),
        }), {
          text: "CD",
          value: "15s",
        }, {
          text: "Energy Cost",
          value: 60,
        }],
        conditional: (tlvl, c) => ({
          type: "character",
          conditionalKey: "Sweeping",
          condition: "Sweeping Time",
          sourceKey: "noelle",
          maxStack: 1,
          stats: {
            modifiers: { finalATK: { finalDEF: (data.burst.bonus[tlvl] + (c >= 6 ? 50 : 0)) / 100 } },
          },
        })
      }],
    },
    passive1: {
      name: "Devotion",
      img: passive1,
      document: [{
        text: (tlvl, stats) => <span>
          When Noelle is in the party but not on the field, this ability triggers automatically when your active character's HP falls below 30%:
          Creates a shield for your active character that lasts for 20s and absorbs DMG equal to 400% of Noelle's DEF{DisplayPercent(400, stats, "finalDEF")}. This effect can only occur once every 60s.
        </span>
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
      document: [{ text: (tlvl, stats, c) => <span>When <b>Breastplate</b> ends or shatters, it deals 400% of ATK{DisplayPercent(400, stats, Character.getTalentStatKey("elemental", c))} as <span className="text-geo">Geo DMG</span> to surrounding enemies.</span> }]
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
      document: [{ text: (tlvl, stats) => <span><b>Sweeping Time</b> increases ATK by an additional 50% of Noelle's DEF{DisplayPercent(50, stats, "finalDEF")}. For the skill's duration, adds 1s duration time per opponent defeated, up to 10s.</span> }]
    }
  }
};
export default char;
