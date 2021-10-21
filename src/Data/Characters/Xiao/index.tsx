import card from './Character_Xiao_Card.jpg'
import thumb from './Icon.png'
import thumbSide from './IconSide.png'
import banner from './Banner.png'
import c1 from './Constellation_Dissolution_Eon_-_Destroyer_of_Worlds.png'
import c2 from './Constellation_Annihilation_Eon_-_Blossom_of_Kaleidos.png'
import c3 from './Constellation_Conqueror_of_Evil_-_Wrath_Deity.png'
import c4 from './Constellation_Transcension_-_Extinction_of_Suffering.png'
import c5 from './Constellation_Evolution_Eon_-_Origin_of_Ignorance.png'
import c6 from './Constellation_Conqueror_of_Evil_-_Guardian_Yaksha.png'
import normal from './Talent_Whirlwind_Thrust.png'
import skill from './Talent_Lemniscatic_Wind_Cycling.png'
import burst from './Talent_Bane_of_All_Evil.png'
import passive1 from './Talent_Evil_Conqueror_-_Tamer_of_Demons.png'
import passive2 from './Talent_Dissolution_Eon_-_Heaven_Fall.png'
import passive3 from './Talent_Transcension_-_Gravity_Defier.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import data_gen from './data_gen.json'
import { getTalentStatKey, getTalentStatKeyVariant } from "../../../Build/Build"
import { ICharacterSheet } from '../../../Types/character'
import { IConditionals } from '../../../Types/IConditional'
import { Translate } from '../../../Components/Translate'
import { chargedDocSection, plungeDocSection, talentTemplate } from '../SheetUtil'
import { WeaponTypeKey } from '../../../Types/consts'
const tr = (strKey: string) => <Translate ns="char_Xiao_gen" key18={strKey} />
const conditionals: IConditionals = {
  q: { // BaneOfAllEvil
    name: "Bane of All Evil",
    stats: stats => ({
      infusionSelf: "anemo",
      normal_dmg_: data.burst.atk_bonus[stats.tlvl.burst],
      charged_dmg_: data.burst.atk_bonus[stats.tlvl.burst],
      plunging_dmg_: data.burst.atk_bonus[stats.tlvl.burst],
    })
  },
  a1q: { // TamerofDemons
    canShow: stats => stats.ascension >= 1,
    name: <span>While under the effects of <b>Bane of All Evil</b></span>,
    maxStack: 5,
    stats: { dmg_: 5 }
  },
  a1: { // HeavenFall
    canShow: stats => stats.ascension >= 1,
    name: <span>Using <b>Lemniscatic Wind Cycling</b></span>,
    maxStack: 3,
    stats: { skill_dmg_: 15 }
  },
  c2: { // BlossomofKaleidos
    canShow: stats => stats.constellation >= 2,
    name: "When in party but not on the field",
    stats: { enerRech_: 25 }
  },
  c4: { // ExtinctionofSuffering
    canShow: stats => stats.constellation >= 4,
    name: "HP falls below 50%",
    stats: { def_: 100 }
  }
}
const char: ICharacterSheet = {
  name: tr("name"),
  cardImg: card,
  thumbImg: thumb,
  thumbImgSide: thumbSide,
  bannerImg: banner,
  star: data_gen.star,
  elementKey: "anemo",
  weaponTypeKey: data_gen.weaponTypeKey as WeaponTypeKey,
  gender: "M",
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
            text: tr("auto.fields.normal"),
            fields: data.normal.hitArr.map((percentArr, i) =>
            ({
              text: `${i + 1}-Hit DMG`,
              formulaText: stats => <span>{percentArr[stats.tlvl.auto]}%{(i === 0 || i === 3) ? " × 2" : ""} {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
              formula: formula.normal[i],
              variant: stats => getTalentStatKeyVariant("normal", stats),
            }))
          },
          chargedDocSection(tr, formula, data, 25),
          plungeDocSection(tr, formula, data)
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
            text: "CD",
            value: "10s",
          }, {
            text: "Charges",
            value: stats => stats.constellation >= 1 ? "2 + 1" : `2`,
          }]
        }],
      },
      burst: {
        name: tr("burst.name"),
        img: burst,
        sections: [{
          text: tr("burst.description"),
          fields: [{
            text: "Normal/Charged/Plunging Attack DMG Bonus",
            value: stats => <span>{data.burst.atk_bonus[stats.tlvl.burst]}%</span>,
          }, {
            text: "Duration",
            value: "15s",
          }, {
            text: "CD",
            value: "18s",
          }, {
            text: "Energy Cost",
            value: 70,
          }],
          conditional: conditionals.q
        }],
      },
      passive1: {
        name: tr("passive1.name"),
        img: passive1,
        sections: [{
          text: tr("passive1.description"),
          conditional: conditionals.a1q
        }],
      },
      passive2: {
        name: tr("passive2.name"),
        img: passive2,
        sections: [{
          text: tr("passive2.description"),
          conditional: conditionals.a1
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
          conditional: conditionals.c4
        }],
      },
      constellation5: talentTemplate("constellation5", tr, c5, { burstBoost: 3 }),
      constellation6: talentTemplate("constellation6", tr, c6),
    },
  },
};
export default char;
