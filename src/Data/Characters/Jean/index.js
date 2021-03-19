import card from './Character_Jean_Card.jpg'
import thumb from './Character_Jean_Thumb.png'
import c1 from './Constellation_Spiraling_Tempest.png'
import c2 from './Constellation_People\'s_Aegis.png'
import c3 from './Constellation_When_the_West_Wind_Arises.png'
import c4 from './Constellation_Lands_of_Dandelion.png'
import c5 from './Constellation_Outbursting_Gust.png'
import c6 from './Constellation_Lion\'s_Fang,_Fair_Protector_of_Mondstadt.png'
import normal from './Talent_Favonius_Bladework.png'
import skill from './Talent_Gale_Blade.png'
import burst from './Talent_Dandelion_Breeze.png'
import passive1 from './Talent_Wind_Companion.png'
import passive2 from './Talent_Let_the_Wind_Lead.png'
import passive3 from './Talent_Guiding_Breeze.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'

const char = {
  name: "Jean",
  cardImg: card,
  thumbImg: thumb,
  star: 5,
  elementKey: "anemo",
  weaponTypeKey: "sword",
  gender: "F",
  constellationName: "Leo Minor",
  titles: ["Acting Grand Master", "Dandelion Knight", "Lionfang Knight"],
  baseStat: data.baseStat,
  specializeStat: data.specializeStat,
  formula,
  talent: {
    auto: {
      name: "Favonius Bladework",
      img: normal,
      infusable: false,
      document: [{
        text: <span><strong>Normal Attack</strong> Performs up to 5 consecutive strikes.</span>,
        fields: data.normal.hitArr.map((percentArr, i) =>
        ({
          text: `${i + 1}-Hit DMG`,
          formulaText: (tlvl, stats) => <span>{percentArr[tlvl]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
          formula: formula.normal[i],
          variant: (tlvl, stats) => getTalentStatKeyVariant("normal", stats),
        }))
      }, {
        text: <span><strong>Charged Attack</strong> Consumes a certain amount of stamina to launch an opponent using the power of wind. Launched opponents will slowly fall to the ground.</span>,
        fields: [{
          text: `Charged Attack DMG`,
          formulaText: (tlvl, stats) => <span>{data.charged.dmg[tlvl]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
          formula: formula.charged.dmg,
          variant: (tlvl, stats) => getTalentStatKeyVariant("charged", stats),
        }, {
          text: `Stamina Cost`,
          value: 20,
        }]
      }, {
        text: <span><strong>Plunging Attack</strong> Plunges from mid-air to strike the ground below, damaging opponents along the path and dealing AoE DMG upon impact.</span>,
        fields: [{
          text: `Plunge DMG`,
          formulaText: (tlvl, stats) => <span>{data.plunging.dmg[tlvl]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
          formula: formula.plunging.dmg,
          variant: (tlvl, stats) => getTalentStatKeyVariant("plunging", stats),
        }, {
          text: `Low Plunge DMG`,
          formulaText: (tlvl, stats) => <span>{data.plunging.low[tlvl]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
          formula: formula.plunging.low,
          variant: (tlvl, stats) => getTalentStatKeyVariant("plunging", stats),
        }, {
          text: `High Plunge DMG`,
          formulaText: (tlvl, stats) => <span>{data.plunging.high[tlvl]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
          formula: formula.plunging.high,
          variant: (tlvl, stats) => getTalentStatKeyVariant("plunging", stats),
        }]
      }]
    },
    skill: {
      name: "Gale Blade",
      img: skill,
      document: [{
        text: <span>
          <p className="mb-2">Focusing the might of the formless wind around her blade, Jean releases a miniature storm, launching opponents in the direction she aims at, dealing massive <span className="text-anemo">Anemo DMG</span>.</p>
          <p className="mb-2"><b>Hold:</b> At the cost of continued stamina consumption, Jean can command the whirlwind to pull surrounding opponents and objects towards her front.</p>
          <ul className="mb-2">
            <li>Direction can be adjusted.</li>
            <li>Character is immobile during skill duration.</li>
          </ul>
        </span>,
        fields: [{
          text: "Gale Blade DMG",
          formulaText: (tlvl, stats) => <span>{data.skill.dmg[tlvl]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.dmg,
          variant: (tlvl, stats) => getTalentStatKeyVariant("skill", stats),
        }, (con) => con >= 1 && {
          text: "Gale Blade DMG (Holding)",
          formulaText: (tlvl, stats) => <span>{data.skill.dmg[tlvl]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)} * 140%</span>,
          formula: formula.skill.dmg_hold,
          variant: (tlvl, stats) => getTalentStatKeyVariant("skill", stats),
        }, {
          text: "Stamina Consumption (Hold)",
          value: "20/s",
        }, {
          text: "Max Hold Duration",
          value: "5s",
        }, {
          text: "CD",
          value: "6s",
        }]
      }],
    },
    burst: {
      name: "Dandelion Breeze",
      img: burst,
      document: [{
        text: <span>
          <p className="mb-2">Calling upon the wind's protection, Jean creates a swirling Dandelion Field, launching surrounding opponents and dealing <span className="text-anemo">Anemo DMG</span>. At the same time, she instantly regenerates a large amount of HP for all party members. The amount of HP restored scales off Jean's ATK.</p>
          <p className="mb-2"><b>Dandelion Field:</b></p>
          <ul className="mb-2">
            <li>Continuously regenerates HP of characters within the AoE and continuously imbues them with <span className="text-ameno">Ameno</span>.</li>
            <li>Deals <span className="text-anemo">Anemo DMG</span> to opponents entering or exiting the Dandelion Field.</li>
          </ul>
        </span>,
        fields: [{
          text: "Skill DMG",
          formulaText: (tlvl, stats) => <span>{data.burst.skill[tlvl]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
          formula: formula.burst.skill,
          variant: (tlvl, stats) => getTalentStatKeyVariant("burst", stats),
        }, {
          text: "Entering/Exiting DMG",
          formulaText: (tlvl, stats) => <span>{data.burst.field_dmg[tlvl]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
          formula: formula.burst.field_dmg,
          variant: (tlvl, stats) => getTalentStatKeyVariant("burst", stats),
        }, {
          text: "Regeneration",
          formulaText: (tlvl, stats) => <span>( {data.burst.heal_atk[tlvl]}% {Stat.printStat("finalATK", stats)} + {data.burst.heal_flat[tlvl]} ) * {Stat.printStat("heal_multi", stats)}</span>,
          formula: formula.burst.heal,
          variant: "success",
        }, {
          text: "Continuous Regeneration",
          formulaText: (tlvl, stats) => <span>( {data.burst.regen_atk[tlvl]}% {Stat.printStat("finalATK", stats)} + {data.burst.regen_flat[tlvl]} ) * {Stat.printStat("heal_multi", stats)}</span>,
          formula: formula.burst.regen,
          variant: "success",
        }, {
          text: "Duration",
          value: "11s",
        }, {
          text: "CD",
          value: "20s",
        }, {
          text: "Energy Cost",
          value: 80,
        }]
      }],
    },
    passive1: {
      name: "Wind Companion",
      img: passive1,
      document: [{
        text: <span>On hit, Jean's Normal Attacks have a 50% change to regenerate HP equal to 15% of Jean's ATK for all party members.</span>,
        fields: [(con, a) => a >= 4 && {
          text: "Heal per Auto",
          formulaText: (tlvl, stats) => <span>15% {Stat.printStat("finalATK", stats)} * {Stat.printStat("heal_multi", stats)}</span>,
          formula: formula.passive1.heal,
          variant: "success",
        }]
      }],
    },
    passive2: {
      name: "Let the Wind Lead",
      img: passive2,
      document: [{ text: <span>Using <b>Dandelion Breeze</b> will regenerate 20% of its Energy.</span> }],
    },
    passive3: {
      name: "Guiding Breeze",
      img: passive3,
      document: [{ text: <span>When a Perfect Cooking is achieved on a dish with restorative effects, Barbara has a 12% chance to obtain double the product.</span> }],
    },
    constellation1: {
      name: "Spiraling Tempest",
      img: c1,
      document: [{ text: <span>Increases the pulling speed of <b>Gale Blade</b> after holding for more than 1s, and increases the DMG dealt by 40%.</span> }],
    },
    constellation2: {
      name: "People's Aegis",
      img: c2,
      document: [{
        text: <span>When Jean picks up an Elemental Orb/Particle, all party members have their Movement SPD and ATK SPD increased by 15% for 15s.</span>,
        conditional: (tlvl, c) => c >= 2 && {
          type: "character",
          conditionalKey: "PeoplesAegis",
          condition: "People's Aegis",
          sourceKey: "jean",
          maxStack: 1,
          stats: {
            moveSPD_: 15,
            atkSPD_: 15
          },
          fields: [{
            text: "Duration",
            value: "15s"
          }]
        }
      }],
    },
    constellation3: {
      name: "When the West Wind Arises",
      img: c3,
      document: [{ text: <span>Increases the level of <b>Dandelion Breeze</b> by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { burst: 3 }
    },
    constellation4: {
      name: "Lands of Dandelion",
      img: c4,
      document: [{
        text: <span>Within the Field created by <b>Dandelion Breeze</b>, all opponents have their Anemo RES decreased by 40%</span>,
        conditional: (tlvl, c) => c >= 4 && {
          type: "character",
          conditionalKey: "LandsOfDandelion",
          condition: "Lands of Dandelion",
          sourceKey: "jean",
          maxStack: 1,
          stats: {
            anemo_enemyRes_: -40,
          },
        }
      }],
    },
    constellation5: {
      name: "Outbursting Gust",
      img: c5,
      document: [{ text: <span>Increases the level of <b>Gale Blade</b> by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { skill: 3 }
    },
    constellation6: {
      name: "Lion's Fang, Fair Protector of Mondstandt",
      img: c6,
      document: [{
        text: <span>Incoming DMG is decreased by 35% within the Field created by <b>Dandelion Breeze</b>. Upon leaving the Dandelion Field, this effect lasts for 3 attacks or 10s.</span>,
        fields: [(con) => con >= 6 && {
          text: "Incoming DMG Decrease",
          value: "35%" //TODO: incoming dmg stat,
        }]
      }],
    },
  },
};
export default char;
