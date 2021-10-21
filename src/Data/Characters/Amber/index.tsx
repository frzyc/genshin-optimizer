import card from './Character_Amber_Card.jpg'
import thumb from './Icon.png'
import thumbSide from './IconSide.png'
import banner from './Banner.png'
import c1 from './Constellation_One_Arrow_to_Rule_Them_All.png'
import c2 from './Constellation_Bunny_Triggered.png'
import c3 from './Constellation_It_Burns.png'
import c4 from './Constellation_It\'s_Not_Just_Any_Doll....png'
import c5 from './Constellation_It\'s_Baron_Bunny.png'
import c6 from './Constellation_Wildfire.png'
import normal from './Talent_Sharpshooter.png'
import skill from './Talent_Explosive_Puppet.png'
import burst from './Talent_Fiery_Rain.png'
import passive1 from './Talent_Every_Arrow_Finds_Its_Target.png'
import passive2 from './Talent_Precise_Shot.png'
import passive3 from './Talent_Gliding_Champion.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import data_gen from './data_gen.json'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'
import { ICharacterSheet } from '../../../Types/character'
import { IConditionals } from '../../../Types/IConditional'
import { Translate } from '../../../Components/Translate'
import { bowChargedDocSection, plungeDocSection, talentTemplate } from '../SheetUtil'
import { WeaponTypeKey } from '../../../Types/consts'
const tr = (strKey: string) => <Translate ns="char_Amber_gen" key18={strKey} />
const conditionals: IConditionals = {
  c6: { // Wildfire
    canShow: stats => stats.constellation >= 6,
    name: "Fiery Rain",
    stats: {//TODO: party buff
      atk_: 15,
      moveSPD_: 15
    },
    fields: [{
      text: "Duration",
      value: "10s",
    }]
  },
  a4: { // Precise Shot
    canShow: stats => stats.ascension >= 4,
    name: "Aim shot hit on weak spots",
    stats: {
      atk_: 15,
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
          text: <span><strong>Normal Attack</strong> Perform up to 5 consecutive shots with a bow.</span>,
          fields: data.normal.hitArr.map((percentArr, i) =>
          ({
            text: `${i + 1}-Hit DMG`,
            formulaText: stats => <span>{percentArr[stats.tlvl.auto]} % {Stat.printStat(getTalentStatKey("normal", stats), stats)} </span>,
            formula: formula.normal[i],
            variant: stats => getTalentStatKeyVariant("normal", stats),
          }))
        }, bowChargedDocSection(tr, formula, data, "pyro"),
        plungeDocSection(tr, formula, data)],
      },
      skill: {
        name: tr("skill.name"),
        img: skill,
        sections: [{
          text: tr("skill.description"),
          fields: [{
            text: "Inherited HP",
            formulaText: stats => <span>{data.skill.hp[stats.tlvl.skill]} % {Stat.printStat("finalHP", stats)} </span>,
            formula: formula.skill.hp,
          }, {
            text: "Explosion DMG",
            formulaText: stats => <span>{data.skill.dmg[stats.tlvl.skill]} % {Stat.printStat(getTalentStatKey("skill", stats), stats)} </span>,
            formula: formula.skill.dmg,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            canShow: stats => stats.constellation >= 2,
            text: "Manual Detonation DMG",
            formulaText: stats => <span>{data.skill.dmg[stats.tlvl.skill]} % + 200 % {Stat.printStat(getTalentStatKey("skill", stats), stats)} </span>,
            formula: formula.skill.detonationDMG,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            canShow: stats => stats.constellation >= 4,
            text: "Charges",
            value: 2,
          }, {
            text: "CD",
            value: stats => "15s" + (stats.constellation >= 4 ? " -20%" : ""),
          }]
        }],
      },
      burst: {
        name: tr("burst.name"),
        img: burst,
        sections: [{
          text: tr("burst.description"),
          fields: [{
            text: "DMG Per Wave",
            formulaText: stats => <span>{data.burst.dmgPerWave[stats.tlvl.burst]} % {Stat.printStat(getTalentStatKey("burst", stats), stats)} </span>,
            formula: formula.burst.dmgPerWave,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            text: "Rain DMG",
            formulaText: stats => <span>{data.burst.totDMG[stats.tlvl.burst]} % {Stat.printStat(getTalentStatKey("burst", stats), stats)} </span>,
            formula: formula.burst.totDMG,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            canShow: stats => stats.ascension >= 1,
            text: "CRIT Rate Bonus",
            value: "10%"
          }, {
            canShow: stats => stats.ascension >= 1,
            text: "AoE Range Bonus",
            value: "30%"
          }, {
            text: "Duration",
            value: "2s",
          }, {
            text: "CD",
            value: "12s",
          }, {
            text: "Energy Cost",
            value: 40,
          },],
          conditional: conditionals.c6
        }],
        stats: stats => stats.ascension >= 1 ? ({
          burst_critRate_: 10
        }) : null,
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
      passive3: {
        name: tr("passive3.name"),
        img: passive3,
        sections: [{
          text: tr("passive3.description"),
        }],
        stats: {
          staminaGlidingDec_: 20,
        }
      },
      constellation1: talentTemplate("constellation1", tr, c1),
      constellation2: talentTemplate("constellation2", tr, c2),
      constellation3: talentTemplate("constellation3", tr, c3, { burstBoost: 3 }),
      constellation4: talentTemplate("constellation4", tr, c4),
      constellation5: talentTemplate("constellation5", tr, c5, { skillBoost: 3 }),
      constellation6: talentTemplate("constellation6", tr, c6),
    },
  },
};
export default char;
