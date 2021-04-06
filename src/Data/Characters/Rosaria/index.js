import card from './Character_Rosaria_Card.png'
import thumb from './Character_Rosaria_Thumb.png'
import c1 from './Constellation_Unholy_Revelation.png'
import c2 from './Constellation_Land_Without_Promise.png'
import c3 from './Constellation_The_Wages_of_Sin.png'
import c4 from './Constellation_Painful_Grace.png'
import c5 from './Constellation_Last_Rites.png'
import c6 from './Constellation_Divine_Retribution.png'
import normal from './Talent_Spear_of_the_Church.png'
import skill from './Talent_Ravaging_Confession.png'
import burst from './Talent_Rites_of_Termination.png'
import passive1 from './Talent_Regina_Probationum.png'
import passive2 from './Talent_Shadow_Samaritan.png'
import passive3 from './Talent_Night_Walk.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'

const char = {
  name: "Rosaria",
  cardImg: card,
  thumbImg: thumb,
  star: 4,
  elementKey: "cryo",
  weaponTypeKey: "polearm",
  gender: "F",
  constellationName: "Spinea Corona",
  titles: ["Thorny Benevolence", "Sister", "A Nonconforming Sister"],
  baseStat: data.baseStat,
  specializeStat: data.specializeStat,
  formula,
  talent: {
    auto: {
      name: "Spear of the Church",
      img: normal,
      infusable: false,
      document: [{
        text: <span><strong>Normal Attack</strong> Performs up to five consecutive spear strikes.</span>,
        fields: data.normal.hitArr.map((percentArr, i) =>
        ({
          text: `${i + (i < 5 ? 1 : 0)}${i === 4 ? ".1" : i === 5 ? ".2" : ""}-Hit DMG ${i === 2 ? " (x2)" : ""}`,
          formulaText: stats => <span>{percentArr[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
          formula: formula.normal[i],
          variant: stats => getTalentStatKeyVariant("normal", stats),
        }))
      }, {
        text: <span><strong>Charged Attack</strong> Consumes a certain amount of Stamina to lunge forward, dealing damage to opponents along the way.</span>,
        fields: [{
          text: `Charged Attack`,
          formulaText: stats => <span>{data.charged.dmg[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
          formula: formula.charged.dmg,
          variant: stats => getTalentStatKeyVariant("charged", stats),
        }, {
          text: `Stamina Cost`,
          value: 25,
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
      name: "Ravaging Confession",
      img: skill,
      document: [{
        text: <span>
          <p className="mb-2">Rosaria swiftly shifts her position to appear behind the enemy, and then pierces and slashes them with her polearm, dealing <span className="text-cryo">Cryo DMG</span>.</p>
          <p className="mb-0">Rosaria cannot use this skill to appear behind larger enemies.</p>
        </span>,
        fields: [{
          text: "Skill DMG 1",
          formulaText: stats => <span>{data.skill.hit1[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.hit1,
          variant: stats => getTalentStatKeyVariant("skill", stats),
        }, {
          text: "Skill DMG 2",
          formulaText: stats => <span>{data.skill.hit2[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.hit2,
          variant: stats => getTalentStatKeyVariant("skill", stats),
        }, {
          text: "CD",
          value: "6s",
        }],
      }],
    },
    burst: {
      name: "Rites of Termination",
      img: burst,
      document: [{
        text: <span>
          <p className="mb-2">Rosaria's signature act of prayer.</p>
          <p className="mb-2">Rosaria swings her weapon to slash nearby enemies and summons a frigid Ice Lance that strikes the ground, dealing <span className="text-cryo">Cryo DMG</span>.</p>
          <p className="mb-0">The Ice Lance will periodically release blasts of cold air, dealing more <span className="text-cryo">Cryo DMG</span>.</p>
        </span>,
        fields: [{
          text: "Skill DMG 1",
          formulaText: stats => <span>{data.burst.hit1[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
          formula: formula.burst.hit1,
          variant: stats => getTalentStatKeyVariant("burst", stats),
        }, {
          text: "Skill DMG 2",
          formulaText: stats => <span>{data.burst.hit2[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
          formula: formula.burst.hit2,
          variant: stats => getTalentStatKeyVariant("burst", stats),
        }, {
          text: "Ice Lance DoT",
          formulaText: stats => <span>{data.burst.dot[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
          formula: formula.burst.dot,
          variant: stats => getTalentStatKeyVariant("burst", stats),
        }, {
          text: "Duration",
          value: "8s",
        }, {
          text: "CD",
          value: "15s",
        }, {
          text: "Energy Cost",
          value: 60,
        }],
      }],
    },
    passive1: {
      name: "Regina Probationum",
      img: passive1,
      document: [{ text: <span>When Rosaria strikes an opponent from behind using <b>Ravaging Confession</b>, Rosaria's CRIT Rate increases by 12% for 5s.</span> }],//TODO: conditional for crit
    },
    passive2: {
      name: "Shadow Samaritan",
      img: passive2,
      document: [{
        text: <span>
          <p className="mb-2">Casting <b>Rites of Termination</b> increases CRIT Rate of all nearby party members (except Rosaria herself) by 15% of Rosaria's CRIT Rate for 10s.</p>
          <p className="mb-0">CRIT Rate Bonus gained this way cannot exceed 15%.</p>
        </span>,
        conditional: stats => stats.ascension >= 4 && {
          type: "character",
          conditionalKey: "ShadowSamaritan",
          condition: <span>After using <b>Rites of Termination</b></span>,
          sourceKey: "rosaria",
          maxStack: 1,
          //stats: { critRate_: 15 },//TODO: party buff
          fields: [{
            text: "Party CRIT Rate increase",
            value: "15%",
          }, {
            text: "Duration",
            value: "10s",
          }]
        }
      }],
    },
    passive3: {
      name: "Night Walk",
      img: passive3,
      document: [{
        text: <span>
          <p className="mb-2">At night (18:00–6:00), increases the Movement SPD of your own party members by 10%.</p>
          <p className="mb-0">Does not take effect in Domains, Trounce Domains, or Spiral Abyss. Not stackable with Passive Talents that provide the exact same effects.</p>
        </span>
      }],
    },
    constellation1: {
      name: "Unholy Revelation",
      img: c1,
      document: [{
        text: <span>When Rosaria deals a CRIT Hit, her ATK SPD increases by 10% and her Normal Attack DMG increases by 10% for 4s.</span>,
        conditional: stats => stats.constellation >= 1 && {
          type: "character",
          conditionalKey: "UnholyRevelation",
          condition: <span>After CRIT Hit</span>,
          sourceKey: "rosaria",
          maxStack: 1,
          stats: { normal_dmg_: 10, atkSPD_: 10 },
          fields: [{
            text: "Duration",
            value: "4s"
          }]
        }
      }],
    },
    constellation2: {
      name: "Land Without Promise",
      img: c2,
      document: [{
        text: <span>The duration of the Ice Lance created by Rites of Termination is increased by 4s.</span>,
      }],
    },
    constellation3: {
      name: "The Wages of Sin",
      img: c3,
      document: [{ text: <span>	Increases the level of <b>Ravaging Confession</b> by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { skill: 3 }
    },
    constellation4: {
      name: "Painful Grace",
      img: c4,
      document: [{
        text: <span>
          <p className="mb-2">Ravaging Confession's CRIT Hits regenerate 5 Energy for Rosaria.</p>
          <p className="mb-0">Can only be triggered once each time Ravaging Confession is cast.</p>
        </span>
      }],
    },
    constellation5: {
      name: "Last Rites",
      img: c5,
      document: [{ text: <span>Increases the level of <b>Rites of Termination</b> by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { burst: 3 }
    },
    constellation6: {
      name: "Divine Retribution",
      img: c6,
      document: [{
        text: <span>Rites of Termination's attack decreases opponents' Physical RES by 20% for 10s.</span>,
        conditional: stats => stats.ascension >= 4 && {
          type: "character",
          conditionalKey: "ShadowSamaritan",
          condition: <span><b>Rites of Termination</b> Attack on enemy</span>,
          sourceKey: "rosaria",
          maxStack: 1,
          stats: { enemyDEFRed_: 20 },
          fields: [{
            text: "Duration",
            value: "10s",
          }]
        }
      }],
    }
  },
};
export default char;