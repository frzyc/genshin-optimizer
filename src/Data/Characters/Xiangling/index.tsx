import card from './Character_Xiangling_Card.jpg'
import thumb from './Icon.png'
import thumbSide from './IconSide.png'
import banner from './Banner.png'
import c1 from './Constellation_Crispy_Outside,_Tender_Inside.png'
import c2 from './Constellation_Oil_Meets_Fire.png'
import c3 from './Constellation_Deepfry.png'
import c4 from './Constellation_Slowbake.png'
import c5 from './Constellation_Guoba_Mad.png'
import c6 from './Constellation_Condensed_Pyronado.png'
import normal from './Talent_Dough-Fu.png'
import skill from './Talent_Guoba_Attack.png'
import burst from './Talent_Pyronado.png'
import passive1 from './Talent_Crossfire.png'
import passive2 from './Talent_Beware,_It\'s_Super_Hot.png'
import passive3 from './Talent_Chef_de_Cuisine.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import data_gen from './data_gen.json'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'
import { ICharacterSheet } from '../../../Types/character'
import { IConditionals } from '../../../Types/IConditional'
import { Translate } from '../../../Components/Translate'
import { chargedDocSection, plungeDocSection, talentTemplate } from '../SheetUtil'
import { WeaponTypeKey } from '../../../Types/consts'
const tr = (strKey: string) => <Translate ns="char_Xiangling_gen" key18={strKey} />
const conditionals: IConditionals = {
  c1: { // CrispyOutsideTenderInside
    canShow: stats => stats.constellation >= 1,
    name: "Opponents hit by Gouba",
    stats: { pyro_enemyRes_: -15 },
    fields: [{
      text: "Duration",
      value: "6s",
    }]
  },
  //TODO: disabled because it only snapshots to the 3rd hit dmg, and not 1-2 or pyronado
  // c6: { // CondensedPyronado
  //   canShow: stats => stats.constellation >= 6,
  //   name: <span>During <b>Pyronado</b></span>,
  //   stats: { pyro_dmg_: 15 },//TODO: party buff
  // },
  a4: { // BewareItsSuperHot
    canShow: stats => stats.ascension >= 4,
    name: "Pick up chili pepper",
    stats: { atk_: 10 },//TODO: party buff
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
        sections: [
          {
            text: <span>{tr(`auto.fields.normal`)} <small><i>Note: the 3th attack hits twice, the 4th hits four times.</i></small></span>,
            fields: data.normal.hitArr.map((percentArr, i) =>
            ({
              text: `${i + 1}-Hit DMG ${i === 2 ? " (2 Hits)" : i === 3 ? " (4 Hits)" : ""}`,
              formulaText: stats => <span>{percentArr[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
              formula: formula.normal[i],
              variant: stats => getTalentStatKeyVariant("normal", stats),
            }))
          },
          chargedDocSection(tr, formula, data, 25),
          plungeDocSection(tr, formula, data),
        ],
      },
      skill: {
        name: tr("skill.name"),
        img: skill,
        sections: [{
          text: tr("skill.description"),
          fields: [{
            text: "Flame DMG",
            formulaText: stats => <span>{data.skill.dmg[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.skill.dmg,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: "CD",
            value: "12s",
          }],
          conditional: conditionals.c1
        }],
      },
      burst: {
        name: tr("burst.name"),
        img: burst,
        sections: [{
          text: tr("burst.description"),
          fields: [{
            text: "1-Hit Swing DMG",
            formulaText: stats => <span>{data.burst.hit1[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
            formula: formula.burst.hit1,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            text: "2-Hit Swing DMG",
            formulaText: stats => <span>{data.burst.hit2[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
            formula: formula.burst.hit2,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            text: "3-Hit Swing DMG",
            formulaText: stats => <span>{data.burst.hit3[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
            formula: formula.burst.hit3,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            text: "Pyronado DMG",
            formulaText: stats => <span>{data.burst.dmg[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
            formula: formula.burst.dmg,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            text: "Duration",
            value: stats => stats.constellation >= 4 ? "14s" : "10s",
          }, {
            text: "CD",
            value: "20s",
          }, {
            text: "Energy Cost",
            value: 80,
          }],
          // conditional: conditionals.c6 
        }],
      },
      passive1: talentTemplate("passive1", tr, passive1),
      passive2: {
        name: tr("passive2.name"),
        img: passive2,
        sections: [{
          text: tr("passive2.description"),
          conditional: conditionals.a4
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
            text: "Explosion DMG",
            formulaText: stats => <span>75% {Stat.printStat(getTalentStatKey("elemental", stats), stats)}</span>,
            formula: formula.constellation2.dmg,
            variant: stats => getTalentStatKeyVariant("elemental", stats),
          }]
        }],
      },
      constellation3: talentTemplate("constellation3", tr, c3, { burstBoost: 3 }),
      constellation4: talentTemplate("constellation4", tr, c4),
      constellation5: talentTemplate("constellation5", tr, c5, { skillBoost: 3 }),
      constellation6: talentTemplate("constellation6", tr, c6),
    },
  },
};
export default char;