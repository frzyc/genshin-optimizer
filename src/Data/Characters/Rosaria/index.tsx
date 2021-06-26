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
import { IConditionals } from '../../../Types/IConditional'
import { ICharacterSheet } from '../../../Types/character'
import { Translate } from '../../../Components/Translate'
const tr = (strKey: string) => <Translate ns="char_rosaria_gen" key18={strKey} />
const conditionals: IConditionals = {
  a1: { // ReginaProbationum
    canShow: stats => stats.ascension >= 1,
    name: <span>After back hit</span>,
    stats: { critRate_: 12 },
    fields: [{
      text: "Duration",
      value: "5s"
    }]
  },
  a4: { // ShadowSamaritan
    canShow: stats => stats.ascension >= 4,
    name: <span>After using <b>Rites of Termination</b></span>,
    //stats: { critRate_: 15 },//TODO: party buff modifier
    fields: [{
      text: "Party CRIT Rate increase",
      value: "15% of Rosaria's CRIT Rate",
    }, {
      text: "Duration",
      value: "10s",
    }]
  },
  c1: { // UnholyRevelation
    canShow: stats => stats.constellation >= 1,
    name: <span>After CRIT Hit</span>,
    stats: { normal_dmg_: 10, atkSPD_: 10 },
    fields: [{
      text: "Duration",
      value: "4s"
    }]
  },
  c6: { // DivineRetribution
    canShow: stats => stats.constellation >= 6,
    name: <span><b>Rites of Termination</b> Attack on enemy</span>,
    stats: { physical_enemyRes_: -20 },
    fields: [{
      text: "Duration",
      value: "10s",
    }]
  }
}
const char: ICharacterSheet = {
  name: tr("name"),
  cardImg: card,
  thumbImg: thumb,
  star: 4,
  elementKey: "cryo",
  weaponTypeKey: "polearm",
  gender: "F",
  constellationName: tr("constellationName"),
  titles: ["Thorny Benevolence", "Sister", "A Nonconforming Sister"],
  baseStat: data.baseStat,
  specializeStat: data.specializeStat,
  talent: {
    formula,
    conditionals,
    sheets: {
      auto: {
        name: tr("auto.name"),
        img: normal,
        sections: [{
          text: tr("auto.fields.normal"),
          fields: data.normal.hitArr.map((percentArr, i) =>
          ({
            text: `${i + (i < 5 ? 1 : 0)}${i === 4 ? ".1" : i === 5 ? ".2" : ""}-Hit DMG${i === 2 ? " (x2)" : ""}`,
            formulaText: stats => <span>{percentArr[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
            formula: formula.normal[i],
            variant: stats => getTalentStatKeyVariant("normal", stats),
          }))
        }, {
          text: tr("auto.fields.charged"),
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
          text: tr("auto.fields.plunging"),
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
        name: tr("skill.name"),
        img: skill,
        sections: [{
          text: tr("skill.description"),
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
        name: tr("burst.name"),
        img: burst,
        sections: [{
          text: tr("burst.description"),
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
        name: tr("passive1.name"),
        img: passive1,
        sections: [{
          text: tr("passive1.description"),
          conditional: conditionals.a1
        }],
      },
      passive2: {
        name: tr("passive2.name"),
        img: passive2,
        sections: [{
          text: tr("passive2.description"),
          conditional: conditionals.a4
        }],
      },
      passive3: {
        name: tr("passive3.name"),
        img: passive3,
        sections: [{ text: tr("passive3.description"), }]
      },
      constellation1: {
        name: tr("constellation1.name"),
        img: c1,
        sections: [{
          text: tr("constellation1.description"),
          conditional: conditionals.c1
        }],
      },
      constellation2: {
        name: tr("constellation2.name"),
        img: c2,
        sections: [{ text: tr("constellation2.description"), }]
      },
      constellation3: {
        name: tr("constellation3.name"),
        img: c3,
        sections: [{ text: tr("constellation3.description"), }],
        stats: { skillBoost: 3 }
      },
      constellation4: {
        name: tr("constellation4.name"),
        img: c4,
        sections: [{ text: tr("constellation4.description") }]
      },
      constellation5: {
        name: tr("constellation5.name"),
        img: c5,
        sections: [{ text: tr("constellation5.description"), }],
        stats: { burstBoost: 3 }
      },
      constellation6: {
        name: tr("constellation6.name"),
        img: c6,
        sections: [{
          text: tr("constellation6.description"),
          conditional: conditionals.c6
        }],
      }
    },
  },
};
export default char;