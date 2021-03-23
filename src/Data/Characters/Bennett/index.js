import card from './Character_Bennett_Card.jpg'
import thumb from './Character_Bennett_Thumb.png'
import c1 from './Constellation_Grand_Expectation.png'
import c2 from './Constellation_Impasse_Conqueror.png'
import c3 from './Constellation_Unstoppable_Fervor.png'
import c4 from './Constellation_Unexpected_Odyssey.png'
import c5 from './Constellation_True_Explorer.png'
import c6 from './Constellation_Fire_Ventures_with_Me.png'
import normal from './Talent_Strike_of_Fortune.png'
import skill from './Talent_Passion_Overload.png'
import burst from './Talent_Fantastic_Voyage.png'
import passive1 from './Talent_Rekindle.png'
import passive2 from './Talent_Fearnaught.png'
import passive3 from './Talent_It_Should_Be_Safe....png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'

const char = {
  name: "Bennett",
  cardImg: card,
  thumbImg: thumb,
  star: 4,
  elementKey: "pyro",
  weaponTypeKey: "sword",
  gender: "M",
  constellationName: "Rota Calamitas",
  titles: ["Trial by Fire", "Leader of Benny's Adventure Team"],
  baseStat: data.baseStat,
  specializeStat: data.specializeStat,
  formula,
  talent: {
    auto: {
      name: "Strike of Fortune",
      img: normal,
      infusable: true,
      document: [{
        text: <span><strong>Normal Attack</strong> Performs up to 5 rapid strikes.</span>,
        fields: data.normal.hitArr.map((percentArr, i) =>
        ({
          text: `${i + 1}-Hit DMG`,
          formulaText: stats => <span>{percentArr[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
          formula: formula.normal[i],
          variant: stats => getTalentStatKeyVariant("normal", stats),
        }))
      }, {
        text: <span><strong>Charged Attack</strong> Consumes a certain amount of Stamina to unleash 2 rapid sword swings.</span>,
        fields: [{
          text: `Charged 1-Hit DMG`,
          formulaText: stats => <span>{data.charged.atk1[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
          formula: formula.charged.atk1,
          variant: stats => getTalentStatKeyVariant("charged", stats),
        }, {
          text: `Charged 2-Hit DMG`,
          formulaText: stats => <span>{data.charged.atk2[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
          formula: formula.charged.atk2,
          variant: stats => getTalentStatKeyVariant("charged", stats),
        }, {
          text: `Stamina Cost`,
          value: 20,
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
      }],
    },
    skill: {
      name: "Passion Overload",
      img: skill,
      document: [{
        text: <span>
          <p className="mb-2">Bennett concentrates the spirit of Adventure and <span className="text-pyro">Pyro</span> into his blade. Depending on how long he charges for, different effects occur.</p>
          <p className="mb-2"><b>Tap:</b> A single, swift flame strike that deals <span className="text-pyro">Pyro DMG</span>.</p>
          <p className="mb-2"><b>Hold (Short):</b> Charges up, resulting in different effects when unleashed based on the Charge Level</p>
          <ul className="mb-2">
            <li>Level 1: Strikes twice, dealing Pyro DMG and launching opponents.</li>
            <li>Level 2: Unleashes 3 consecutive attacks that deal impressive <span className="text-pyro">Pyro DMG</span>, but the last attack triggers an explosion that launches both Bennett and the enemy. Bennett takes no damage from being launched, but can take fall damage if he falls down a cliff.</li>
          </ul>
        </span>,
        fields: [
          ...[["press", "Press DMG"], ["lvl1hit1", "Lvl 1 1st Hit DMG"], ["lvl1hit2", "Lvl 1 2nd Hit DMG"], ["lvl2hit1", "Lvl 2 1st Hit DMG"], ["lvl2hit2", "Lvl 2 2nd Hit DMG"], ["explosion", "Explosion DMG"]].map(([key, text]) => ({
            text,
            formulaText: stats => <span>{data.skill[key][stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.skill[key],
            variant: stats => getTalentStatKeyVariant("skill", stats),
          })), {
            text: "CD",
            value: stats => stats.ascension >= 1 ? "4s / 6s/ 8s" : "5s / 7.5s/ 10s",
          }, {
            text: <span>CD in <b>Fantastic Voyage</b>'s circle</span>,
            value: "2s / 3s/ 4s",
          }]
      }],
    },
    burst: {
      name: "Fantastic Voyage",
      img: burst,
      document: [{
        text: <span>
          <p className="mb-2">Bennett performs a jumping attack that deals <span className="text-pyro">Pyro DMG</span>, creating an Inspiration Field for 12 seconds.</p>
          <p className="mb-2"><b>Inspiration Field:</b></p>
          <ul className="mb-2">
            <li>If the health of a character within the AoE is equal to or falls below 70%, their health will regenerate each second. The amount of HP restores scales off Bennett's Max HP.</li>
            <li>If the health of a character within the AoE is higher than 70%, they gain an ATK Bonus that scales based on Bennett's Base ATK.</li>
            <li>Imbues characters within the AoE with <span className="text-pyro">Pyro</span>.</li>
          </ul>
        </span>,
        fields: [{
          text: "Skill DMG",
          formulaText: stats => <span>{data.burst.dmg[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
          formula: formula.burst.dmg,
          variant: stats => getTalentStatKeyVariant("burst", stats),
        }, {
          text: "Continuous Regeneration Per Sec",
          formulaText: stats => <span>( {data.burst.healHP[stats.tlvl.burst]}% Max HP + {data.burst.healHPFlat[stats.tlvl.burst]} ) * {Stat.printStat("heal_multi", stats)}</span>,
          formula: formula.burst.regen,
          variant: "success",
        }, {
          text: "ATK Bonus Ratio",
          formulaText: stats => <span>{stats.constellation < 1 ? data.burst.atkRatio[stats.tlvl.burst] : `(${data.burst.atkRatio[stats.tlvl.burst]} + 20)`}% {Stat.printStat("baseATK", stats)}</span>,
          formula: formula.burst.atkBonus
        }, {
          text: "Duration",
          value: "12s",
        }, {
          text: "CD",
          value: "15s",
        }, {
          text: "Energy Cost",
          value: 60,
        }],
        conditional: stats => ({
          type: "character",
          conditionalKey: "FantasticVoyage",
          condition: "Fantastic Voyage",
          sourceKey: "bennett",
          maxStack: 1,
          stats: {
            modifiers: { finalATK: { baseATK: (data.burst.atkRatio[stats.tlvl.burst] + (stats.constellation < 1 ? 0 : 20)) / 100, } },
          },
        })
      }],
    },
    passive1: {
      name: "Rekindle",
      img: passive1,
      document: [{ text: <span>Decreases <b>Passion Overload</b>'s CD by 20%.</span> }],
    },
    passive2: {
      name: "Fearnaught",
      img: passive2,
      document: [{ text: <span>When inside <b>Fantastic Voyage</b>'s circle, Passion Overload's CD is decreased by 50% and Bennett cannot be launched by this skill's explosion.</span> }],
    },
    passive3: {
      name: "It Should Be Safe...",
      img: passive3,
      document: [{ text: <span>When dispatched on an expedition in <b>Mondstadt</b>, time consumed is reduced by 25%.</span> }],
    },
    constellation1: {
      name: "Grand Expectation",
      img: c1,
      document: [{ text: <span><b>Fantastic Voyage</b>'s ATK increase no longer has an HP restriction, and gains an additional 20% of Bennett's Base ATK. (Additive increase)</span> }],
    },
    constellation2: {
      name: "Impasse Conqueror",
      img: c2,
      document: [{
        text: <span>When HP falls below 70%, increases Energy Recharge by 30%.</span>,
        conditional: stats => stats.constellation >= 2 && {
          type: "character",
          conditionalKey: "ImpasseConqueror",
          condition: "Impasse Conqueror",
          sourceKey: "bennett",
          maxStack: 1,
          stats: {
            enerRech_: 30,
          }
        }
      }],
    },
    constellation3: {
      name: "Unstoppable Fervor",
      img: c3,
      document: [{ text: <span>Increases <b>Passion Overload</b>'s skill level by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { skill: 3 }
    },
    constellation4: {
      name: "Unexpected Odyssey",
      img: c4,
      document: [{ text: <span>Short hold to release <b>Passion Overload</b> as a two-stage attack. Press the attack button to perform an additional falling attack.</span> }],
    },
    constellation5: {
      name: "True Explorer",
      img: c5,
      document: [{ text: <span>Increases <b>Fantastic Voyage</b>'s skill level by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { burst: 3 }
    },
    constellation6: {
      name: "Fire Ventures with Me",
      img: c6,
      document: [{
        text: <span>Sword, Claymore, or Polearm-wielding characters inside Fantastic Voyage's radius gain a 15% Pyro DMG Bonus and their weapons are infused with <span className="text-pyro">Pyro</span>.</span>,
        conditional: stats => stats.constellation >= 6 && {
          type: "character",
          conditionalKey: "Fire Ventures with Me",
          condition: "Sword, Claymore, or Polearm-wielding characters inside Fantastic Voyage's radius",
          sourceKey: "bennett",
          maxStack: 1,
          stats: {
            pyro_dmg_: 15,
          },
          fields: [{
            text: <span className="text-pyro">Pyro infusion</span>,
          }]
        }
      }],
    }
  },
};
export default char;
