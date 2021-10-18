import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'
import { Translate } from '../../../Components/Translate'
import Stat from '../../../Stat'
import { ICharacterSheet } from '../../../Types/character'
import { WeaponTypeKey } from '../../../Types/consts'
import { IConditionals } from '../../../Types/IConditional'
import { chargedDocSection, normalDocSection, plungeDocSection, talentTemplate } from '../SheetUtil'
import card from './Character_Klee_Card.jpg'
import thumb from './Character_Klee_Thumb.png'
import c6 from './Constellation_Blazing_Delight.png'
import c1 from './Constellation_Chained_Reactions.png'
import c2 from './Constellation_Explosive_Frags.png'
import c3 from './Constellation_Exquisite_Compound.png'
import c5 from './Constellation_Nova_Burst.png'
import c4 from './Constellation_Sparkly_Explosion.png'
import formula, { data } from './data'
import data_gen from './data_gen.json'
import passive3 from './Talent_All_Of_My_Treasures.png'
import skill from './Talent_Jumpy_Dumpty.png'
import normal from './Talent_Kaboom.png'
import passive1 from './Talent_Pounding_Surprise.png'
import passive2 from './Talent_Sparkling_Burst.png'
import burst from './Talent_Sparks_\'n\'_Splash.png'
const tr = (strKey: string) => <Translate ns="char_Klee_gen" key18={strKey} />
const conditionals: IConditionals = {
  a1: { // PoundingSurprise
    canShow: stats => stats.ascension >= 1,
    name: "has Explosive Spark",
    stats: { charged_dmg_: 50 },
    fields: [{ text: "Next Charged attack cost no stamina" }]
  },
  c2: { // ExplosiveFrags
    canShow: stats => stats.constellation >= 2,
    name: "Hit by Jumpy Dumpty's mines",
    stats: { enemyDEFRed_: 23 },
    fields: [{
      text: "Duration",
      value: "10s",
    }]
  },
  c6: { // BlazingDelight
    canShow: stats => stats.constellation >= 6,
    name: "Sparks 'n' Splash is used",
    stats: { pyro_dmg_: 10 }//TODO: party buff
  }
}
const char: ICharacterSheet = {
  name: tr("name"),
  cardImg: card,
  thumbImg: thumb,
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
          normalDocSection(tr, formula, data),
          chargedDocSection(tr, formula, data, 50),
          plungeDocSection(tr, formula, data),
        ],
      },
      skill: {
        name: tr("skill.name"),
        img: skill,
        sections: [{
          text: tr("skill.description"),
          fields: [{
            text: "Jumpy Dumpty DMG",
            formulaText: stats => <span>{data.skill.jumpyDmg[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.skill.jumpyDmg,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: "Mine DMG",
            formulaText: stats => <span>{data.skill.mineDmg[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.skill.mineDmg,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: "Mine Duration",
            value: "15s",
          }, {
            text: "CD",
            value: "20s",
          }]
        }],
      },
      burst: {
        name: tr("burst.name"),
        img: burst,
        sections: [{
          text: tr("burst.description"),
          fields: [{
            text: "Sparks 'n' Splash DMG",
            formulaText: stats => <span>{data.burst.dmg[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
            formula: formula.burst.dmg,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            text: "Duration",
            value: "10s",
          }, {
            text: "CD",
            value: "15s",
          }, {
            text: "Energy Cost",
            value: 60,
          }]
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
      passive2: talentTemplate("passive2", tr, passive2),
      passive3: talentTemplate("passive3", tr, passive3),
      constellation1: {
        name: tr("constellation1.name"),
        img: c1,
        sections: [{
          text: tr("constellation1.description"),
          fields: [{
            canShow: stats => stats.constellation >= 1,
            text: "Chained Reactions DMG",
            formulaText: stats => <span>120% x {data.burst.dmg[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
            formula: formula.constellation1.dmg,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          },]
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
      constellation4: {
        name: tr("constellation4.name"),
        img: c4,
        sections: [{
          text: tr("constellation4.description"),
          fields: [{
            text: "Sparkly Explosion DMG",
            formulaText: stats => <span>555% {Stat.printStat(getTalentStatKey("elemental", stats), stats)}</span>,
            formula: formula.constellation4.dmg,
            variant: stats => getTalentStatKeyVariant("elemental", stats),
          }]
        }],
      },
      constellation5: talentTemplate("constellation5", tr, c5, { burstBoost: 3 }),
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
