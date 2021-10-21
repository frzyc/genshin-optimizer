import card from './Character_Chongyun_Card.jpg'
import thumb from './Icon.png'
import thumbSide from './IconSide.png'
import banner from './Banner.png'
import c1 from './Constellation_Ice_Unleashed.png'
import c2 from './Constellation_Atmospheric_Revolution.png'
import c3 from './Constellation_Cloudburst.png'
import c4 from './Constellation_Frozen_Skies.png'
import c5 from './Constellation_The_True_Path.png'
import c6 from './Constellation_Rally_of_Four_Blades.png'
import normal from './Talent_Demonbane.png'
import skill from './Talent_Spirit_Blade_-_Chonghua\'s_Layered_Frost.png'
import burst from './Talent_Spirit_Blade_-_Cloud-parting_Star.png'
import passive1 from './Talent_Steady_Breathing.png'
import passive2 from './Talent_Rimechaser_Blade.png'
import passive3 from './Talent_Gallant_Journey.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import data_gen from './data_gen.json'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'
import { IConditionals } from '../../../Types/IConditional'
import { ICharacterSheet } from '../../../Types/character'
import { Translate } from '../../../Components/Translate'
import { claymoreChargedDocSection, normalDocSection, plungeDocSection, talentTemplate } from '../SheetUtil'
import { WeaponTypeKey } from '../../../Types/consts'
const tr = (strKey: string) => <Translate ns="char_Chongyun_gen" key18={strKey} />
const conditionals: IConditionals = {
  a4: { // Rimechaser Blade
    canShow: stats => stats.ascension >= 4,
    name: "Opponents hit by Rimechase Blade",
    stats: { cryo_enemyRes_: -10 },
    fields: [{
      text: "Duration",
      value: "8s",
    }]
  },
  c6: { // Rally of Four Blades
    canShow: stats => stats.constellation >= 6,
    name: "Enemy with lower MaxHP% than Chongyun",
    stats: { burst_dmg_: 15 }
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
          fields: [{
            text: "Skill DMG",
            formulaText: stats => <span>{data.skill.dmg[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.skill.dmg,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: "Infusion Duration",
            value: stats => `${data.skill.infusionDuration[stats.tlvl.skill]}s`,
          }, {
            text: "Field Duration",
            value: "10s",
          }, {
            text: "CD",
            value: "15s",
          }],
          conditional: conditionals.a4
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
            text: "CD",
            value: "12s",
          }, {
            text: "Energy Cost",
            value: 40,
          }, {
            text: "Spirit Blades Summoned",
            value: stats => stats.constellation < 6 ? 3 : 4
          }],
          conditional: conditionals.c6
        }],
      },
      passive1: talentTemplate("passive1", tr, passive1),
      passive2: {
        name: tr("passive2.name"),
        img: passive2,
        sections: [{
          text: tr("passive2.description"),
          fields: [{
            canShow: stats => stats.ascension >= 4,
            text: "Summoned Sword DMG",
            formulaText: stats => <span>{data.skill.dmg[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.passive2.dmg,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }]
        }],
      },
      passive3: talentTemplate("passive3", tr, passive3),
      constellation1: {
        name: tr("constellation1.name"),
        img: c1,
        sections: [{
          text: tr("constellation1.description"),
          fields: [{
            canShow: stats => stats.constellation >= 1,
            text: "Ice Blade DMG",
            formulaText: stats => <span>50% {Stat.printStat(getTalentStatKey("elemental", stats), stats)}</span>,
            formula: formula.constellation1.dmg,
            variant: stats => getTalentStatKeyVariant("elemental", stats),
          }]
        }]
      },
      constellation2: talentTemplate("constellation2", tr, c2),
      constellation3: talentTemplate("constellation3", tr, c3, { burstBoost: 3 }),
      constellation4: talentTemplate("constellation4", tr, c4),
      constellation5: talentTemplate("constellation5", tr, c5, { skillBoost: 3 }),
      constellation6: talentTemplate("constellation6", tr, c6),
    },
  },
};
export default char;
