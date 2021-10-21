import card from './Character_Hu_Tao_Card.jpg'
import thumb from './Icon.png'
import thumbSide from './IconSide.png'
import banner from './Banner.png'
import c1 from './Constellation_Crimson_Bouquet.png'
import c2 from './Constellation_Ominous_Rainfall.png'
import c3 from './Constellation_Lingering_Carmine.png'
import c4 from './Constellation_Garden_of_Eternal_Rest.png'
import c5 from './Constellation_Floral_Incense.png'
import c6 from './Constellation_Butterfly\'s_Embrace.png'
import normal from './Talent_Secret_Spear_of_Wangsheng.png'
import skill from './Talent_Guide_to_Afterlife.png'
import burst from './Talent_Spirit_Soother.png'
import passive1 from './Talent_Flutter_By.png'
import passive2 from './Talent_Sanguine_Rouge.png'
import passive3 from './Talent_The_More_the_Merrier.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import data_gen from './data_gen.json'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'
import { IConditionals } from '../../../Types/IConditional'
import { ICharacterSheet } from '../../../Types/character'
import { Translate } from '../../../Components/Translate'
import { chargedDocSection, plungeDocSection, sgt, st, talentTemplate } from '../SheetUtil'
import { KeyPath } from '../../../Util/KeyPathUtil'
import { FormulaPathBase } from '../../formula'
import { WeaponTypeKey } from '../../../Types/consts'

const path = KeyPath<FormulaPathBase, any>().character.HuTao
const tr = (strKey: string) => <Translate ns="char_HuTao_gen" key18={strKey} />
const conditionals: IConditionals = {
  e: { // GuideToAfterlife
    name: "Guide to Afterlife Voyage",
    stats: {
      modifiers: { atk: [path.skill.atk_inc()] },
      infusionSelf: "pyro",
    },
    fields: [{
      text: st("increase.atk"),
      formulaText: stats => <span>min( {data.skill.atk_inc[stats.tlvl.skill]}% {Stat.printStat("finalHP", stats, true)}, 400% {Stat.printStat("baseATK", stats, true)} )</span>,
      formula: formula.skill.atk_inc,
    },]
  },
  a4: { // SanguineRouge
    canShow: stats => stats.ascension >= 4,
    name: "HP is equal to or less than 50%",
    stats: {
      pyro_dmg_: 33,
    },
  },
  c6: { // ButterflysEmbrace
    canShow: stats => stats.constellation >= 6,
    name: "HP drops below 25%, or suffers a lethal strike",
    stats: {
      physical_res_: 200,
      anemo_res_: 200,
      geo_res_: 200,
      electro_res_: 200,
      hydro_res_: 200,
      pyro_res_: 200,
      cryo_res_: 200,
      critRate_: 100,
    },
    fields: [{
      text: "Duration",
      value: "10s"
    }, {
      text: "CD",
      value: "60s"
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
            text: <span>{tr(`auto.fields.normal`)} <small><i>Note: the 5th attack hits twice.</i></small></span>,
            fields: data.normal.hitArr.map((percentArr, i) =>
            ({
              text: sgt(`normal.hit${i + (i < 5 ? 1 : 0)}`),
              formulaText: stats => <span>{percentArr[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
              formula: formula.normal[i],
              variant: stats => getTalentStatKeyVariant("normal", stats),
            }))
          },
          chargedDocSection(tr, formula, data),
          plungeDocSection(tr, formula, data)
        ],
      },
      skill: {
        name: tr("skill.name"),
        img: skill,
        sections: [{
          text: <span>
            {tr("skill.description")}
          </span>,
          fields: [{
            text: "Activation Cost",
            value: "30% Current HP",
          }, {
            canShow: stats => stats.constellation < 2,
            text: "Blood Blossom DMG",
            formulaText: stats => <span>{data.skill.dmg[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.skill.dmg,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            canShow: stats => stats.constellation >= 2,
            text: "Blood Blossom DMG (C2)",
            formulaText: stats => <span>( {data.skill.dmg[stats.tlvl.skill]}% {Stat.printStat("finalATK", stats)} + 10% {Stat.printStat("finalHP", stats)} ) * {Stat.printStat(getTalentStatKey("skill", stats) + "_multi", stats)}</span>,
            formula: formula.skill.dmgC2,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: "Blood Blossom Duration",
            value: "8s",
          }, {
            text: "Duration",
            value: "9s",
          }, {
            text: "CD",
            value: "16s",
          },],
          conditional: conditionals.e
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
            text: "Low HP Skill DMG",
            formulaText: stats => <span>{data.burst.low_dmg[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
            formula: formula.burst.low_dmg,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            text: "Skill HP Regeneration",
            formulaText: stats => <span>( {data.burst.regen[stats.tlvl.burst]}% {Stat.printStat("finalHP", stats)} ) * {Stat.printStat("heal_multi", stats)}</span>,
            formula: formula.burst.regen,
            variant: "success",
          }, {
            text: "Low HP Skill Regeneration",
            formulaText: stats => <span>( {data.burst.low_regen[stats.tlvl.burst]}% {Stat.printStat("finalHP", stats)} ) * {Stat.printStat("heal_multi", stats)}</span>,
            formula: formula.burst.low_regen,
            variant: "success",
          }, {
            text: "CD",
            value: "15s",
          }, {
            text: "Energy Cost",
            value: 60,
          }, {
            canShow: stats => stats.constellation >= 2,
            text: "Apply the Blood Blossom effect",
          }]
        }],
      },
      passive1: talentTemplate("passive1", tr, passive1),//TODO: party buff
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
      constellation2: talentTemplate("constellation2", tr, c2),
      constellation3: talentTemplate("constellation3", tr, c3, { skillBoost: 3 }),
      constellation4: talentTemplate("constellation4", tr, c4),//TODO: party buff
      constellation5: talentTemplate("constellation5", tr, c5, { burstBoost: 3 }),
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
