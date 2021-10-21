import card from './Character_Jean_Card.jpg'
import thumb from './Icon.png'
import thumbSide from './IconSide.png'
import banner from './Banner.png'
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
import data_gen from './data_gen.json'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'
import { IConditionals } from '../../../Types/IConditional'
import { ICharacterSheet } from '../../../Types/character'
import { Translate } from '../../../Components/Translate'
import { chargedDocSection, normalDocSection, plungeDocSection, talentTemplate } from '../SheetUtil'
import { WeaponTypeKey } from '../../../Types/consts'
const tr = (strKey: string) => <Translate ns="char_Jean_gen" key18={strKey} />
const conditionals: IConditionals = {
  c2: { // People's Aegis
    canShow: stats => stats.constellation >= 2,
    name: "Jean pick up Elemental Orb/Particle",
    stats: {//TODO: PARTY buff
      moveSPD_: 15,
      atkSPD_: 15
    },
    fields: [{
      text: "Duration",
      value: "15s"
    }]
  },
  c4: { // Lands of Dandelion
    canShow: stats => stats.constellation >= 4,
    name: "Opponents within the field created by Dandelion Breeze",
    stats: { anemo_enemyRes_: -40 },
  },
  c6: { // Lion's Fang, Fair Protector of Mondstandt
    canShow: stats => stats.constellation >= 6,
    name: "WIthin field created by Dandelion Breeze",
    fields: [{
      text: "Incoming DMG Decrease",
      value: "35%" //TODO: incoming dmg stat,
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
  elementKey: "anemo",
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
          normalDocSection(tr, formula, data),
          chargedDocSection(tr, formula, data, 20),
          plungeDocSection(tr, formula, data)
        ]
      },
      skill: {
        name: tr("skill.name"),
        img: skill,
        sections: [{
          text: tr("skill.description"),
          fields: [{
            text: "Gale Blade DMG",
            formulaText: stats => <span>{data.skill.dmg[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.skill.dmg,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            canShow: stats => stats.constellation >= 1,
            text: "Gale Blade DMG (Holding)",
            formulaText: stats => <span>{data.skill.dmg[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)} * 140%</span>,
            formula: formula.skill.dmg_hold,
            variant: stats => getTalentStatKeyVariant("skill", stats),
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
        name: tr("burst.name"),
        img: burst,
        sections: [{
          text: tr("burst.description"),
          fields: [{
            text: "Skill DMG",
            formulaText: stats => <span>{data.burst.skill[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
            formula: formula.burst.skill,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            text: "Entering/Exiting DMG",
            formulaText: stats => <span>{data.burst.field_dmg[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
            formula: formula.burst.field_dmg,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            text: "Regeneration",
            formulaText: stats => <span>( {data.burst.heal_atk[stats.tlvl.burst]}% {Stat.printStat("finalATK", stats)} + {data.burst.heal_flat[stats.tlvl.burst]} ) * {Stat.printStat("heal_multi", stats)}</span>,
            formula: formula.burst.heal,
            variant: "success",
          }, {
            text: "Continuous Regeneration",
            formulaText: stats => <span>( {data.burst.regen_atk[stats.tlvl.burst]}% {Stat.printStat("finalATK", stats)} + {data.burst.regen_flat[stats.tlvl.burst]} ) * {Stat.printStat("heal_multi", stats)}</span>,
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
        name: tr("passive1.name"),
        img: passive1,
        sections: [{
          text: tr("passive1.description"),
          fields: [{
            canShow: stats => stats.ascension >= 4,
            text: "Heal per Auto",
            formulaText: stats => <span>15% {Stat.printStat("finalATK", stats)} * {Stat.printStat("heal_multi", stats)}</span>,
            formula: formula.passive1.dmg,
            variant: "success",
          }]
        }],
      },
      passive2: talentTemplate("passive2", tr, passive2),
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
          conditional: conditionals.c6
        }],
      },
    },
  },
};
export default char;
