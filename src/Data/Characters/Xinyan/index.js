import card from './Character_Xinyan_Card.jpg'
import thumb from './Character_Xinyan_Thumb.png'
import c1 from './Constellation_Fatal_Acceleration.png'
import c2 from './Constellation_Impromptu_Opening.png'
import c3 from './Constellation_Double-Stop.png'
import c4 from './Constellation_Wildfire_Rhythm.png'
import c5 from './Constellation_Screamin\'_for_an_Encore.png'
import c6 from './Constellation_Rockin\'_in_a_Flaming_World.png'
import normal from './Talent_Dance_on_Fire.png'
import skill from './Talent_Sweeping_Fervor.png'
import burst from './Talent_Riff_Revolution.png'
import passive1 from './Talent__The_Show_Goes_On,_Even_Without_an_Audience..._.png'
import passive2 from './Talent__...Now_That\'s_Rock_\'N\'_Roll_.png'
import passive3 from './Talent_A_Rad_Recipe.png'
import Stat from '../../../Stat';
import formula, { data } from './data';
import { getTalentStatKey, getTalentStatKeyVariant } from "../../../Build/Build";

const char = {
  name: "Xinyan",
  cardImg: card,
  thumbImg: thumb,
  star: 4,
  elementKey: "pyro",
  weaponTypeKey: "claymore",
  gender: "F",
  constellationName: "Fila Ignium",
  titles: ["Blazing Riff", "Rock 'n' Roll Musician"],
  baseStat: data.baseStat,
  specializeStat: data.specializeStat,
  formula,
  talent: {
    auto: {
      name: "Dance on Fire",
      img: normal,
      document: [{
        text: <span><strong>Normal Attack</strong> Performs up to 4 consecutive strikes.</span>,
        fields: data.normal.hitArr.map((percentArr, i) =>
        ({
          text: `${i + 1}-Hit DMG`,
          formulaText: stats =>
            <span>{percentArr[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
          formula: formula.normal[i],
          variant: stats => getTalentStatKeyVariant("normal", stats)
        }))
      }, {
        text: <span><strong>Charged Attack</strong> Drains Stamina over time to perform continuous spinning attacks against all nearby opponents.</span>,
        fields: [
          stats => stats.constellation <= 5 ?
            {
              text: `Spinning DMG`,
              formulaText: stats => <span>{data.charged.spinning[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
              formula: formula.charged.spinning,
              variant: stats => getTalentStatKeyVariant("charged", stats)
            } : {
              text: `Spinning DMG`,
              formulaText: stats => <span>{data.charged.spinning[stats.tlvl.auto]}% ( {Stat.printStat("finalATK", stats)} + 50% {Stat.printStat("finalDEF", stats)} ) * {Stat.printStat(getTalentStatKey("charged", stats) + "_multi", stats)}</span>,
              formula: formula.charged.spinningDEF,
              variant: stats => getTalentStatKeyVariant("charged", stats)
            },
          stats => stats.constellation <= 5 ?
            {
              text: `Spinning Final DMG`,
              formulaText: stats => <span>{data.charged.final[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
              formula: formula.charged.final,
              variant: stats => getTalentStatKeyVariant("charged", stats)
            } : {
              text: `Spinning Final DMG`,
              formulaText: stats => <span>{data.charged.final[stats.tlvl.auto]}% ( {Stat.printStat("finalATK", stats)} + 50% {Stat.printStat("finalDEF", stats)} ) * {Stat.printStat(getTalentStatKey("charged", stats) + "_multi", stats)}</span>,
              formula: formula.charged.finalDEF,
              variant: stats => getTalentStatKeyVariant("charged", stats)
            },
          stats => stats.constellation <= 5 ?
            {
              text: `Stamina Cost`,
              value: "40/s",
            } : {
              text: `Stamina Cost`,
              value: "40/s - 30%",
            }, {
            text: `Max Duration`,
            value: "5s",
          }],
      }, {
        text: <span><strong>Plunging Attack</strong> Plunges from mid-air to strike the ground, damaging enemies along the path and dealing AoE DMG upon impact.</span>,
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
        }],
      }],
    },
    skill: {
      name: "Sweeping Fervor",
      img: skill,
      document: [{
        text: stats => <span>
          <p className="mb-0">Xinyan brandishes her instrument, dealing <span
            className="text-pyro">Pyro DMG</span> on nearby opponents, forming a shield made out of her audience's passion.</p>
          <p className="mb-2">The shield's DMG Absorption scales based on Xinyan's DEF and on the number of opponents hit.</p>
          <ul className="mb-1">
            <li>Hitting 0-1 opponents grants Shield Level 1: Ad Lib.</li>
            <li>Hitting 2{stats.ascension >= 1 && <span className="text-success"> (-1)</span>} opponents grants Shield Level 2: Lead-In.</li>
            <li>Hitting 3{stats.ascension >= 1 && <span className="text-success"> (-1)</span>} or more opponents grants Shield Level 3: Rave, which will also deal intermittent <span
              className="text-pyro">Pyro DMG</span> to nearby opponents.</li>
          </ul>
          <p className="mb-2">The shield has the following special properties:</p>
          <ul className="mb-1">
            <li>When unleashed, it infuses Xinyan with <span className="text-pyro">Pyro</span>.</li>
            <li>It has 250% DMG Absorption effectiveness against <span
              className="text-pyro">Pyro DMG</span>.</li>
          </ul>
        </span>,
        fields: [{
          text: "Swing DMG",
          formulaText: stats =>
            <span>{data.skill.dmg[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.dmg,
          variant: stats => getTalentStatKeyVariant("skill", stats),
        }, {
          text: "Shield Level 1 DMG Absorption",
          formulaText: stats =>
            <span>{data.skill.def1[stats.tlvl.skill]}% {Stat.printStat("finalDEF", stats)} + {data.skill.flat1[stats.tlvl.skill]}</span>,
          formula: formula.skill.shield1,
        }, {
          text: "Shield Level 2 DMG Absorption",
          formulaText: stats =>
            <span>{data.skill.def2[stats.tlvl.skill]}% {Stat.printStat("finalDEF", stats)} + {data.skill.flat2[stats.tlvl.skill]}</span>,
          formula: formula.skill.shield2,
        }, {
          text: "Shield Level 3 DMG Absorption",
          formulaText: stats =>
            <span>{data.skill.def3[stats.tlvl.skill]}% {Stat.printStat("finalDEF", stats)} + {data.skill.flat3[stats.tlvl.skill]}</span>,
          formula: formula.skill.shield3,
        }, {
          text: "Pyro DoT",
          formulaText: stats =>
            <span>{data.skill.dot[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.dot,
          variant: stats => getTalentStatKeyVariant("skill", stats),
        }, {
          text: "Shield Duration",
          value: "12s",
        }, {
          text: "CD",
          value: "18s",
        }]
      }],
    },
    burst: {
      name: "Riff Revolution",
      img: burst,
      document: [{
        text: stats => <span>
          <p className="mb-2">Strumming rapidly, Xinyan launches nearby opponents and deals Physical DMG to them, hyping up the crowd.</p>
          <p className="mb-0">The sheer intensity of the atmosphere will cause explosions that deal <span className="text-pyro">Pyro DMG</span> to nearby opponents.</p>
          {stats.constellation >= 2 && <small>The <b>Burst DMG</b> will always CRIT.</small>}
        </span>,
        fields: [{
          text: "Burst DMG",
          formulaText: stats =>
            <span>{data.burst.dmg[stats.tlvl.burst]}% {Stat.printStat(stats.constellation >= 2 ? `physical_burst_critHit` : `physical_burst_${stats.hitMode}`, stats)}</span>,
          formula: formula.burst.dmg,
          variant: "physical"
        }, {
          text: "Pyro DoT",
          formulaText: stats =>
            <span>{data.burst.dot[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
          formula: formula.burst.dot,
          variant: stats => getTalentStatKeyVariant("burst", stats),
        }, {
          text: "Duration",
          value: "2s",
        }, {
          text: "CD",
          value: "15s",
        }, {
          text: "Energy Cost",
          value: 60,
        }, stats => stats.constellation >= 2 && {
          text: "Form a shield at Level 3: Rave when cast"
        }],
      }]
    },
    passive1: {
      name: "\"The Show Goes On, Even Without an Audience...\"",
      img: passive1,
      document: [{
        text: <span>
          <p className="mb-2">Decreases the number of opponents <b>Sweeping Fervor</b> must hit to trigger each level of shielding.</p>
          <ul className="mb-0">
            <li>Shield Level 2: Lead-In requirement reduced to 1 opponent hit.</li>
            <li>Shield Level 3: Rave requirement reduced to 2 opponents hit or more.</li>
          </ul>
        </span>,
      }],
    },
    passive2: {
      name: "\"...Now That's Rock 'N' Roll!\"",
      img: passive2,
      document: [{
        text: <span>Characters shielded by <b>Sweeping Fervor</b> deal 15% increased Physical DMG.</span>,
        conditional: stats => stats.ascension >= 4 && {
          type: "character",
          conditionalKey: "NowThatsRockNRoll",
          condition: "Sweeping Fervor Shield",
          sourceKey: "xinyan",
          maxStack: 1,
          stats: { physical_dmg_: 15 },//TODO: party buff
        }
      }],
    },
    passive3: {
      name: "A Rad Recipe",
      img: passive3,
      document: [{ text: <span>When a Perfect Cooking is achieved on a DEF-boosting dish, Xinyan has a 12% chance to obtain double the product.</span>, }],
    },
    constellation1: {
      name: "Fatal Acceleration",
      img: c1,
      document: [{
        text: <span>Upon scoring a CRIT hit, increases ATK SPD of Xinyan's <b>Normal and Charged Attacks</b> by 12% for 5s. Can only occur once every 5s.</span>,
        conditional: stats => stats.ascension >= 1 && {
          type: "character",
          conditionalKey: "FatalAcceleration",
          condition: "Scoring a CRIT hit",
          sourceKey: "xinyan",
          maxStack: 1,
          stats: { atkSPD_: 12 },
          fields: [{
            text: "Duration",
            value: "5s"
          }]
        }
      }],
    },
    constellation2: {
      name: "Impromptu Opening",
      img: c2,
      document: [{ text: <span><b>Riff Revolution</b> Physical DMG has its Crit rate increased by 100%, and will form a shield at Shield Level 3: Rave when cast.</span>, }],
    },
    constellation3: {
      name: "Double-Stop",
      img: c3,
      document: [{
        text: <span>Increases the Level of <b>Sweeping Fervor</b> by 3. Maximum upgrade level is 15.</span>,
      }],
      talentBoost: { skill: 3 }
    },
    constellation4: {
      name: "Wildfire Rhythm",
      img: c4,
      document: [{
        text: <span><b>Sweeping Fervor</b>'s swing DMG decreases opponent's Physical RES by 15% for 12s.</span>,
        conditional: stats => stats.ascension >= 4 && {
          type: "character",
          conditionalKey: "WildfireRhythm",
          condition: "Sweeping Fervor Swing",
          sourceKey: "xinyan",
          maxStack: 1,
          stats: { physical_enemyRes_: -15, }//TODO: party buff
        }
      }],
    },
    constellation5: {
      name: "Screamin' for an Encore",
      img: c5,
      document: [{
        text: <span>Increases the Level of <b>Riff Revolution</b> by 3. Maximum upgrade level is 15.</span>,
      }],
      talentBoost: { burst: 3 }
    },
    constellation6: {
      name: "Rockin' in a Flaming World",
      img: c6,
      document: [{ text: <span>Decrease the Stamina Consumption of Xinyan <b>Charged Attacks</b> by 30%. Additionally, Xinyan's <b>Charged Attacks</b> gain an ATK bonus equal to 50% of her DEF.</span>, }],
      stats: stats => stats.constellation >= 6 && {
        staminaChargedDec_: 30
      }
    },
  }
};
export default char;
