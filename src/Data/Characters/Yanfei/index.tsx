import card from './Character_Yanfei_Card.png'
import thumb from './Icon.png'
import thumbSide from './IconSide.png'
import banner from './Banner.png'
import c1 from './Constellation_The_Law_Knows_No_Kindness.png'
import c2 from './Constellation_Right_of_Final_Interpretation.png'
import c3 from './Constellation_Samadhi_Fire-Forged.png'
import c4 from './Constellation_Supreme_Amnesty.png'
import c5 from './Constellation_Abiding_Affidavit.png'
import c6 from './Constellation_Extra_Clause.png'
import normal from './Talent_Seal_of_Approval.png'
import skill from './Talent_Signed_Edict.png'
import burst from './Talent_Done_Deal.png'
import passive1 from './Talent_Proviso.png'
import passive2 from './Talent_Blazing_Eye.png'
import passive3 from './Talent_Encyclopedic_Expertise.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import data_gen from './data_gen.json'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'
import { IConditionals } from '../../../Types/IConditional'
import { ICharacterSheet } from '../../../Types/character'
import { Translate } from '../../../Components/Translate'
import { plungeDocSection, talentTemplate } from '../SheetUtil'
import { WeaponTypeKey } from '../../../Types/consts'
import ColorText from '../../../Components/ColoredText'
const tr = (strKey: string) => <Translate ns="char_Yanfei_gen" key18={strKey} />
const conditionals: IConditionals = {
  q: {
    name: <span>Brilliance</span>,
    stats: stats => ({ charged_dmg_: data.burst.dmg_[stats.tlvl.burst] }),
    fields: [{
      text: "Duration",
      value: "15s",
    }, {
      text: "Scarlet Seal Grant Interval",
      value: "1s"
    }]
  },
  p1: {
    canShow: stats => stats.ascension >= 1,
    name: <span>Consumes <b>Scarlet Seals</b> by using a Charged Attack</span>,
    stats: { pyro_dmg_: 5 },
    maxStack: stats => stats.constellation >= 6 ? 4 : 3,
    fields: [{
      text: "Duration",
      value: "6s",
    }]
  },
  c2: {
    canShow: stats => stats.constellation >= 2,
    name: "Against enemies below 50% HP",
    stats: { charged_critRate_: 20 }
  }
}
const char: ICharacterSheet = {
  name: tr("name"),
  cardImg: card,
  thumbImg: thumb,
  thumbImgSide: thumbSide,
  bannerImg: banner,
  star: data_gen.star,
  elementKey: "pyro",
  weaponTypeKey: data_gen.weaponTypeKey as WeaponTypeKey,
  gender: "F",
  constellationName: tr("constellationName"),
  title: tr("title"),
  baseStat: data_gen.base,
  baseStatCurve: data_gen.curves,
  ascensions: data_gen.ascensions,
  talent: {
    formula,
    conditionals,
    sheets: {
      auto: {
        name: tr("auto.name"),
        img: normal,
        sections: [{
          text: tr(`auto.fields.normal`),
          fields: [...data.normal.hitArr.map((percentArr, i) =>
          ({
            text: `${i + 1}-Hit DMG`,
            formulaText: stats => <span>{percentArr[stats.tlvl.auto]} % {Stat.printStat(getTalentStatKey("normal", stats), stats)} </span>,
            formula: formula.normal[i],
            variant: stats => getTalentStatKeyVariant("normal", stats),
          })), {
            text: "Scarlet Seal Duration",
            value: "10s"
          }, {
            text: <span>Max number of <b>Scarlet Seals</b></span>,
            value: stats => stats.constellation >= 6 ? 4 : 3
          }]
        }, {
          text: tr(`auto.fields.charged`),
          fields: [...data.charged.hitArr.map((percentArr, i) => ({
            canShow: stats => i < 4 || stats.constellation >= 6,
            text: `${i}-Seal DMG`,
            formulaText: stats => <span>{percentArr[stats.tlvl.auto]} % {Stat.printStat(getTalentStatKey("normal", stats), stats)} </span>,
            formula: formula.charged[i],
            variant: stats => getTalentStatKeyVariant("normal", stats),
          })), {
            text: `Stamina Cost`,
            value: 50,
          }, {
            text: "Scarlet Seal Stamina Consumption Decrease",
            value: stats => stats.constellation >= 1 ? "15% + 10% per Seal" : "15% per Seal"
          }, {
            canShow: stats => stats.constellation >= 1,
            text: "Increases resistance against interruption during release."
          }]
        },
        plungeDocSection(tr, formula, data),
        ],
      },
      skill: {
        name: tr("skill.name"),
        img: skill,
        sections: [{
          text: tr("skill.description"),
          fields: [{
            text: "Skill DMG",
            formulaText: stats => <span>{data.skill.dmg[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.skill.dmg,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: "CD",
            value: "9s",
          },]
        }],
      },
      burst: {
        name: tr("burst.name"),
        img: burst,
        sections: [{
          text: tr("burst.description"),
          fields: [{
            text: "Skill DMG",
            formulaText: stats => <span>{data.burst.dmg[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
            formula: formula.burst.dmg,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            canShow: stats => stats.constellation >= 4,
            text: "Shield on Cast",
            formulaText: stats => <span>45% {Stat.printStat("finalHP", stats)}</span>,
            formula: formula.constellation4.dmg,
          }, {
            text: "CD",
            value: "20s",
          }, {
            text: "Energy Cost",
            value: 80,
          }]
          , conditional: conditionals.q
        }],
      },
      passive1: {
        name: tr("passive1.name"),
        img: passive1,
        sections: [{
          text: tr("passive1.description"),
          conditional: conditionals.p1
        }],
      },
      passive2: {
        name: tr("passive2.name"),
        img: passive2,
        sections: [{
          text: tr("passive2.description"),
          fields: [{
            text: "Crit Hit on Opponent",
            formulaText: stats => <span>80% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
            formula: formula.passive2.dmg,
            variant: stats => getTalentStatKeyVariant("charged", stats),
          }]
        }],
      },
      passive3: talentTemplate("passive3", tr, passive3),
      constellation1: talentTemplate("constellation1", tr, c1),
      constellation2: {
        name: tr("constellation2.name"),
        img: c2,
        sections: [{
          text: tr("constellation2.description"),
          conditional: conditionals.c2
        }],
      },
      constellation3: talentTemplate("constellation3", tr, c3, { skillBoost: 3 }),
      constellation4: {
        name: tr("constellation4.name"),
        img: c4,
        sections: [{
          text: tr("constellation4.description"),
          fields: [{
            canShow: stats => stats.constellation >= 4,
            text: <ColorText color="pyro">Shield DMG Absorption</ColorText>,
            formulaText: stats => <span>45% {Stat.printStat("finalHP", stats)} * (100% + {Stat.printStat("shield_", stats)}) * (250% <ColorText color="pyro">Pyro Absorption</ColorText>)</span>,
            formula: formula.constellation4.shieldCryo,
            variant: "pyro"
          }, {
            canShow: stats => stats.constellation >= 4,
            text: "Shield DMG Absorption",
            formulaText: stats => <span>45% {Stat.printStat("finalHP", stats)} * (100% + {Stat.printStat("shield_", stats)})</span>,
            formula: formula.constellation4.shield,
          }, {
            canShow: stats => stats.constellation >= 4,
            text: "Duration",
            value: "20s",
          },]
        }],
      },
      constellation5: talentTemplate("constellation5", tr, c5, { burstBoost: 3 }),
      constellation6: talentTemplate("constellation6", tr, c6),
    },
  },
};
export default char;
