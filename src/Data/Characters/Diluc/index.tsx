import card from './Character_Diluc_Card.jpg'
import thumb from './Icon.png'
import thumbSide from './IconSide.png'
import banner from './Banner.png'
import c1 from './Constellation_Conviction.png'
import c2 from './Constellation_Searing_Ember.png'
import c3 from './Constellation_Fire_and_Steel.png'
import c4 from './Constellation_Flowing_Flame.png'
import c5 from './Constellation_Phoenix,_Harbinger_of_Dawn.png'
import c6 from './Constellation_Flaming_Sword,_Nemesis_of_Dark.png'
import normal from './Talent_Tempered_Sword.png'
import skill from './Talent_Searing_Onslaught.png'
import burst from './Talent_Dawn.png'
import passive1 from './Talent_Relentless.png'
import passive2 from './Talent_Blessing_of_Phoenix.png'
import passive3 from './Talent_Tradition_of_the_Dawn_Knight.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import data_gen from './data_gen.json'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'
import { IConditionals } from '../../../Types/IConditional'
import { ICharacterSheet } from '../../../Types/character'
import { Translate } from '../../../Components/Translate'
import { claymoreChargedDocSection, normalDocSection, plungeDocSection, talentTemplate } from '../SheetUtil'
import { WeaponTypeKey } from '../../../Types/consts'
const tr = (strKey: string) => <Translate ns="char_Diluc_gen" key18={strKey} />
const conditionals: IConditionals = {
  b: {//Dawn
    name: <b>Dawn</b>,
    stats: stats => ({
      infusionSelf: "pyro",
      ...stats.ascension >= 4 && { pyro_dmg_: 20 } // Blessing of Phoenix
    }),
    fields: [{
      text: "Infusion Duration",
      value: stats => "8s" + (stats.ascension > 4 ? " + 4s" : ""),
    }]
  },
  c6: { // Flaming Sword Nemesis of Dark
    canShow: stats => stats.constellation >= 6,
    name: <span>After casting <b>Searing Onslaught</b></span>,
    stats: {
      normal_dmg_: 30,
      atkSPD_: 30,
    },
    fields: [{
      text: "Next 2 Normal Attack within",
      value: "6s",
    }]
  },
  c1: { // Conviction
    canShow: stats => stats.constellation >= 1,
    name: "Enemies with >50% HP",
    stats: { dmg_: 15 },
  },
  c2: { // SearingEmber
    canShow: stats => stats.constellation >= 2,
    name: "Take DMG",
    maxStack: 3,
    stats: {
      atk_: 10,
      atkSPD_: 5
    },
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
          normalDocSection(tr, formula, data),
          claymoreChargedDocSection(tr, formula, data),
          plungeDocSection(tr, formula, data)
        ],
      },
      skill: {
        name: tr("skill.name"),
        img: skill,
        sections: [{
          text: tr("skill.description"),
          fields: [
            ...[["hit1", "1-Hit DMG"], ["hit2", "2-Hit DMG"], ["hit3", "3-Hit DMG"]].map(([key, text]) => ({
              text,
              formulaText: stats => <span>{formula.skill[key][stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
              formula: formula.skill[key],
              variant: stats => getTalentStatKeyVariant("skill", stats),
            })),
            {
              canShow: stats => stats.constellation >= 4,
              text: "2-Hit DMG(Boosted)",
              formulaText: stats => <span>{data.skill.hit2[stats.tlvl.skill]}% + 40% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
              formula: formula.skill.hit2b,
              variant: stats => getTalentStatKeyVariant("skill", stats)
            }, {
              canShow: stats => stats.constellation >= 4,
              text: "3-Hit DMG(Boosted)",
              formulaText: stats => <span>{data.skill.hit3[stats.tlvl.skill]}% + 40% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
              formula: formula.skill.hit3b,
              variant: stats => getTalentStatKeyVariant("skill", stats)
            }, {
              text: "CD",
              value: "12s",
            }]
        }, {
          conditional: conditionals.c6
        }],
      },
      burst: {
        name: tr("burst.name"),
        img: burst,
        sections: [{
          text: tr("burst.description"),
          fields: [
            ...[["slashing", "Slashing DMG"], ["dot", "DoT"], ["explosion", "Explosion DMG"]].map(([key, text]) => ({
              text,
              formulaText: stats => <span>{formula.burst[key][stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
              formula: formula.burst[key],
              variant: stats => getTalentStatKeyVariant("skill", stats),
            })),
            {
              text: "CD",
              value: "12s",
            }, {
              text: "Energy Cost",
              value: 40,
            }],
          conditional: conditionals.b
        }],
      },
      passive1: talentTemplate("passive1", tr, passive1),
      passive2: talentTemplate("passive2", tr, passive2),
      passive3: talentTemplate("passive3", tr, passive3),
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
        sections: [{
          text: tr("constellation2.description"),
          conditional: conditionals.c2
        }],
      },
      constellation3: talentTemplate("constellation3", tr, c3, { skillBoost: 3 }),
      constellation4: talentTemplate("constellation4", tr, c4),
      constellation5: talentTemplate("constellation5", tr, c5, { burstBoost: 3 }),
      constellation6: talentTemplate("constellation6", tr, c6),
    },
  },
};
export default char;
