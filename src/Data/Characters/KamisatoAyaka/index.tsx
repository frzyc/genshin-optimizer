import card from './Character_Kamisato_Ayaka_Card.png'
import thumb from './Icon.png'
import thumbSide from './IconSide.png'
import banner from './Banner.png'
import c1 from './Constellation_Snowswept_Sakura.png'
import c2 from './Constellation_Blizzard_Blade_Seki_no_To.png'
import c3 from './Constellation_Frostbloom_Kamifubuki.png'
import c4 from './Constellation_Ebb_and_Flow.png'
import c5 from './Constellation_Blossom_Cloud_Irutsuki.png'
import c6 from './Constellation_Dance_of_Suigetsu.png'
import normal from './Talent_Kamisato_Art_Kabuki.png'
import skill from './Talent_Kamisato_Art_Hyouka.png'
import burst from './Talent_Kamisato_Art_Soumetsu.png'
import sprint from './Talent_Kamisato_Art_Senho.png'
import passive1 from './Talent_Kanten_Senmyou_Blessing.png'
import passive2 from './Talent_Amatsumi_Kunitsumi_Sanctification.png'
import passive3 from './Talent_Fruits_of_Shinsa.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import data_gen from './data_gen.json'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'
import { IConditionals } from '../../../Types/IConditional'
import { ICharacterSheet } from '../../../Types/character'
import { Translate, TransWrapper } from '../../../Components/Translate'
import { plungeDocSection, sgt, talentTemplate } from '../SheetUtil'
import { WeaponTypeKey } from '../../../Types/consts'
const tr = (strKey: string) => <Translate ns="char_KamisatoAyaka_gen" key18={strKey} />
const charTr = (strKey: string) => <Translate ns="char_KamisatoAyaka" key18={strKey} />
const conditionals: IConditionals = {
  s: { //sprint
    name: charTr("afterSprint"),
    stats: { infusionSelf: "cryo" },
    fields: [{
      text: sgt("duration"),
      value: "5s"
    }]
  },
  p1: {//After using Kamisato Art: Hyouka
    canShow: stats => stats.ascension >= 1,
    name: charTr("afterSkill"),
    stats: {
      normal_dmg_: 30,
      charged_dmg_: 30,
    },
    fields: [{
      text: sgt("duration"),
      value: "6s"
    }]
  },
  p2: { //sprint
    canShow: stats => stats.ascension >= 4,
    name: charTr("afterSprintCryo"),
    stats: { cryo_dmg_: 18 },
    fields: [{ text: charTr("staminaRestore") }]
  },
  c4: {
    canShow: stats => stats.constellation >= 4,
    name: charTr("afterBurst"),
    stats: { enemyDEFRed_: 30 },
    fields: [{
      text: sgt("duration"),
      value: "6s"
    }]
  },
  c6: {
    canShow: stats => stats.constellation >= 6,
    name: charTr("afterSkill"),
    stats: { charged_dmg_: 298 },
    fields: [{
      text: sgt("duration"),
      value: "6s"
    }]
  }
}
const char: ICharacterSheet = {
  name: tr("name"),
  cardImg: card,
  thumbImg: thumb,
  thumbImgSide: thumbSide,
  bannerImg: banner,
  star: data_gen.star,
  elementKey: "cryo",
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
          text: tr("auto.fields.normal"),
          fields: data.normal.hitArr.map((percentArr, i) =>
          ({
            text: <span>{sgt(`normal.hit${i + 1}`)} {i === 3 ? <span>(<TransWrapper ns="sheet" key18="hits" values={{ count: 3 }} />)</span> : ""}</span>,
            formulaText: stats => <span>{percentArr[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
            formula: formula.normal[i],
            variant: stats => getTalentStatKeyVariant("normal", stats),
          }))
        }, {
          text: tr("auto.fields.charged"),
          fields: [{
            text: <span>{sgt("charged.dmg")} <span>(<TransWrapper ns="sheet" key18="hits" values={{ count: 3 }} />)</span></span>,
            formulaText: stats => <span>{data.charged.hit[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
            formula: formula.charged.hit,
            variant: stats => getTalentStatKeyVariant("charged", stats),
          }, {
            text: sgt("charged.stamina"),
            value: 20,
          }]
        },
        plungeDocSection(tr, formula, data)
        ],
      },
      skill: {
        name: tr("skill.name"),
        img: skill,
        sections: [{
          text: tr("skill.description"),
          fields: [{
            text: sgt("skillDMG"),
            formulaText: stats => <span>{data.skill.dmg[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats) + "_multi", stats)} * {Stat.printStat("finalDEF", stats)}</span>,
            formula: formula.skill.dmg,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: sgt("cd"),
            value: "10s",
          }],
        }],
      },
      burst: {
        name: tr("burst.name"),
        img: burst,
        sections: [{
          text: tr("burst.description"),
          fields: [{
            text: tr("burst.cutting"),
            formulaText: stats => <span>{data.burst.cutting[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
            formula: formula.burst.cutting,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            text: tr("burst.bloom"),
            formulaText: stats => <span>{data.burst.bloom[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
            formula: formula.burst.bloom,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            text: sgt("duration"),
            value: "5s",
          }, {
            text: sgt("cd"),
            value: "20s",
          }, {
            text: sgt("energyCost"),
            value: 80,
          }]
        }]
      },
      sprint: {
        name: tr("sprint.name"),
        img: sprint,
        sections: [{
          text: tr("sprint.description"),
          fields: [{
            text: "Activation Stamina Consumption",
            value: 10,
          }, {
            text: "Stamina Drain",
            value: "15/s",
          }],
          conditional: conditionals.s
        }],
      },
      passive1: {
        name: tr("passive1.name"),
        img: passive1,
        sections: [{
          text: tr("passive1.description"),
          conditional: conditionals.p1,
        }],
      },
      passive2: {
        name: tr("passive2.name"),
        img: passive2,
        sections: [{
          text: tr("passive2.description"),
          conditional: conditionals.p2,
        }],
      },
      passive3: talentTemplate("passive3", tr, passive3),
      constellation1: talentTemplate("constellation1", tr, c1),
      constellation2: {
        name: tr("constellation2.name"),
        img: c2,
        sections: [{
          text: tr("constellation2.description"),
          fields: [{
            canShow: stats => stats.constellation >= 2,
            text: charTr("snowflakeDMG"),
            formulaText: stats => <span>{data.burst.cutting[stats.tlvl.burst] / 5}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
            formula: formula.constellation2.dmg,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          },]
        }],

      },
      constellation3: talentTemplate("constellation3", tr, c3, { burstBoost: 3 }),
      constellation4: {
        name: tr("constellation4.name"),
        img: c4,
        sections: [{
          text: tr("constellation4.description"),
          conditional: conditionals.c4,
        }],
      },
      constellation5: talentTemplate("constellation5", tr, c5, { skillBoost: 3 }),
      constellation6: {
        name: tr("constellation6.name"),
        img: c6,
        sections: [{
          text: tr("constellation6.description"),
          conditional: conditionals.c6,
        }],
      },
    },
  },
};
export default char;
