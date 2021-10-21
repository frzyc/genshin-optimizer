import card from "./Character_Qiqi_Card.jpg";
import thumb from './Icon.png'
import thumbSide from './IconSide.png'
import banner from './Banner.png'
import c1 from "./Constellation_Ascetics_of_Frost.png";
import c2 from "./Constellation_Frozen_to_the_Bone.png";
import c3 from "./Constellation_Ascendant_Praise.png";
import c4 from "./Constellation_Divine_Suppression.png";
import c5 from "./Constellation_Crimson_Lotus_Bloom.png";
import c6 from "./Constellation_Rite_of_Resurrection.png";
import normal from "./Talent_Ancient_Sword_Art.png";
import skill from "./Talent_Adeptus_Art_-_Herald_of_Frost.png";
import burst from "./Talent_Adeptus_Art_-_Preserver_of_Fortune.png";
import passive1 from "./Talent_Life-Prolonging_Methods.png";
import passive2 from "./Talent_A_Glimpse_into_Arcanum.png";
import passive3 from "./Talent_Former_Life_Memories.png";
import Stat from "../../../Stat";
import formula, { data } from "./data";
import data_gen from './data_gen.json'
import { getTalentStatKey, getTalentStatKeyVariant } from "../../../Build/Build";
import { IConditionals } from "../../../Types/IConditional";
import { ICharacterSheet } from "../../../Types/character";
import { Translate } from '../../../Components/Translate'
import { chargedDocSection, plungeDocSection, talentTemplate } from "../SheetUtil";
import { WeaponTypeKey } from "../../../Types/consts";
const tr = (strKey: string) => <Translate ns="char_Qiqi_gen" key18={strKey} />
const conditionals: IConditionals = {
  a1: { // LifeProlongingMethods
    canShow: stats => stats.ascension >= 1,
    name: <span>Character under the effects of <b>Adeptus Art: Herald of Frost</b> triggers an Elemental Reaction</span>,
    stats: { incHeal_: 20, },
    fields: [{
      text: "Duration",
      value: "8s",
    }],
  },
  c2: { // FrozenToTheBone
    canShow: stats => stats.constellation >= 2,
    name: "Enemy Affected by Cryo",
    stats: {
      normal_dmg_: 15,
      charged_dmg_: 15,
    },
  },
  c4: { // DivineSuppression
    canShow: stats => stats.constellation >= 4,
    name: "Enemy marked by Talisman",
    fields: [{//TODO: enemy atk decrease
      text: "Enemy ATK Decrease",
      value: "20%"
    }],
  },
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
        sections: [
          {
            text: <span>{tr(`auto.fields.normal`)} <small><i>Note: the 3rd and 4th attacks hit twice.</i></small></span>,
            fields: data.normal.hitArr.map((percentArr, i) => ({
              text: `${i + 1}-Hit DMG`,
              formulaText: (i === 2 || i === 3) ?
                stats => <span>( {percentArr[stats.tlvl.auto]}% + {percentArr[stats.tlvl.auto]}% ) {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span> :
                stats => <span>{percentArr[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
              formula: formula.normal[i],
              variant: stats => getTalentStatKeyVariant("normal", stats),
            })),
          },
          chargedDocSection(tr, formula, data, 20),
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
            formulaText: stats => <span>{data.skill.hit[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.skill.hit,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: "Regeneration on Hit",
            formulaText: stats => <span>( {data.skill.hitregen.atk[stats.tlvl.skill]}% {Stat.printStat("finalATK", stats)} + {data.skill.hitregen.base[stats.tlvl.skill]} ) * {Stat.printStat("heal_multi", stats)}</span>,
            formula: formula.skill.hitregen,
            variant: "success",
          }, {
            text: "Continuous Regeneration",
            formulaText: stats => <span>( {data.skill.continuousregen.atk[stats.tlvl.skill]}% {Stat.printStat("finalATK", stats)} + {data.skill.continuousregen.base[stats.tlvl.skill]} ) * {Stat.printStat("heal_multi", stats)}            </span>,
            formula: formula.skill.continuousregen,
            variant: "success",
          }, {
            text: "Herald of Frost DMG",
            formulaText: stats => <span>{data.skill.herald[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.skill.herald,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: "Duration",
            value: "15s",
          }, {
            text: "CD",
            value: "30s",
          }],
        }],
      },
      burst: {
        name: tr("burst.name"),
        img: burst,
        sections: [{
          text: tr("burst.description"),
          fields: [{
            text: "Burst DMG",
            formulaText: stats => <span>{data.burst.dmg[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
            formula: formula.burst.dmg,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            text: "Talisman Healing",
            formulaText: stats => <span> ( {data.burst.healing.atk[stats.tlvl.burst]}% {Stat.printStat("finalATK", stats)} + {data.burst.healing.base[stats.tlvl.burst]} ) * {Stat.printStat("heal_multi", stats)}</span>,
            formula: formula.burst.healing,
            variant: "success",
          }, {
            text: "Talisman Duration",
            value: "15s",
          }, {
            text: "CD",
            value: "20s",
          }, {
            text: "Energy Cost",
            value: 80,
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
          fields: [{
            canShow: stats => stats.ascension >= 4,
            text: "Talisman Application Chance",
            value: "50%",
          }, {
            canShow: stats => stats.ascension >= 4,
            text: "CD",
            value: "30s",
          }],
        },
        ],
      },
      passive3: talentTemplate("passive3", tr, passive3),
      constellation1: {
        name: tr("constellation1.name"),
        img: c1,
        sections: [{
          text: tr("constellation1.description"),
          fields: [{
            canShow: stats => stats.constellation >= 1,
            text: "Energy on Hit",
            value: 2,
          }],
        }],
      },
      constellation2: {
        name: tr("constellation2.name"),
        img: c2,
        sections: [{
          text: tr("constellation2.description"),
          conditional: conditionals.c2
        }],
      },
      constellation3: talentTemplate("constellation3", tr, c3, { burstBoost: 3 }),
      constellation4: {
        name: tr("constellation4.name"),
        img: c4,
        sections: [{
          text: tr("constellation4.description"),
          conditional: conditionals.c4
        }],
      },
      constellation5: talentTemplate("constellation5", tr, c5, { skillBoost: 3 }),
      constellation6: {
        name: tr("constellation6.name"),
        img: c6,
        sections: [{
          text: tr("constellation6.description"),
          fields: [{
            canShow: stats => stats.constellation >= 6,
            text: "Revival HP Regeneration",
            value: `50% of Max HP`,
          }, {
            canShow: stats => stats.constellation >= 6,
            text: "Cooldown",
            value: `15m`,
          }],
        }],
      },
    },
  },
};
export default char;
