import card from './Character_Beidou_Card.jpg'
import thumb from './Character_Beidou_Thumb.png'
import c1 from './Constellation_Sea_Beast\'s_Scourge.png'
import c2 from './Constellation_Upon_the_Turbulent_Sea,_the_Thunder_Arises.png'
import c3 from './Constellation_Summoner_of_Storm.png'
import c4 from './Constellation_Stunning_Revenge.png'
import c5 from './Constellation_Crimson_Tidewalker.png'
import c6 from './Constellation_Bane_of_the_Evil.png'
import normal from './Talent_Oceanborne.png'
import skill from './Talent_Tidecaller.png'
import burst from './Talent_Stormbreaker.png'
import passive1 from './Talent_Retribution.png'
import passive2 from './Talent_Lightning_Storm.png'
import passive3 from './Talent_Conqueror_of_Tides.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import data_gen from './data_gen.json'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'
import { IConditionals } from '../../../Types/IConditional'
import { ICharacterSheet } from '../../../Types/character'
import { Translate } from '../../../Components/Translate'
import { claymoreChargedDocSection, normalDocSection, plungeDocSection, talentTemplate } from '../SheetUtil'
import { WeaponTypeKey } from '../../../Types/consts'
import ColorText from '../../../Components/ColoredText'
const tr = (strKey: string) => <Translate ns="char_Beidou_gen" key18={strKey} />
const conditionals: IConditionals = {
  a4: { // Lightning Storm
    canShow: stats => stats.ascension >= 4,
    name: <span>Unleashing <b>Tidecaller</b> with its maximum DMG Bonus</span>,
    stats: {
      normal_dmg_: 15,
      charged_dmg_: 15,
      atkSPD_: 15,
    },
    fields: [{
      text: "Duration",
      value: "10s",
    }, {
      text: "Reduced delay before Charged Attacks",
    }]
  },
  c6: { // Bane Evil
    canShow: stats => stats.constellation >= 6,
    name: <span>During the duration of <b>Stormbreaker</b></span>,
    stats: { electro_enemyRes_: -15, }
  }
}
const char: ICharacterSheet = {
  name: tr("name"),
  cardImg: card,
  thumbImg: thumb,
  star: data_gen.star,
  elementKey: "electro",
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
            text: <ColorText color="electro">Shield DMG Absorption</ColorText>,
            formulaText: stats => <span>( {data.skill.hp[stats.tlvl.skill]}% {Stat.printStat("finalHP", stats)} + {data.skill.flat[stats.tlvl.skill]} ) * (100% + {Stat.printStat("shield_", stats)}) * (250% <ColorText color="electro">Electro Absorption</ColorText>)</span>,
            formula: formula.skill.shieldElectro,
            variant: "electro"
          }, {
            text: "Shield DMG Absorption",
            formulaText: stats => <span>( {data.skill.hp[stats.tlvl.skill]}% {Stat.printStat("finalHP", stats)} + {data.skill.flat[stats.tlvl.skill]} ) * (100% + {Stat.printStat("shield_", stats)})</span>,
            formula: formula.skill.shield,
          }, {
            text: "Base DMG",
            formulaText: stats => <span>{data.skill.dmg[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.skill.dmg,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: "1-Hit Taken",
            formulaText: stats => <span>( {data.skill.dmg[stats.tlvl.skill]}% + {data.skill.onHit[stats.tlvl.skill]}% )  {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.skill.hit1,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: "2-Hit Taken",
            formulaText: stats => <span>( {data.skill.dmg[stats.tlvl.skill]}% + 2 * {data.skill.onHit[stats.tlvl.skill]}% ) {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.skill.hit2,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: "CD",
            value: "7.5s",
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
            text: "Lightning DMG",
            formulaText: stats => <span>{data.burst.lightningDMG[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
            formula: formula.burst.lightningDMG,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            text: "DMG Reduction",
            value: stats => data.burst.dmgRed[stats.tlvl.burst] + "%",
          }, {
            text: "Duration",
            value: "15s",
          }, {
            text: "CD",
            value: "20s",
          }, {
            text: "Energy Cost",
            value: 80,
          }],
          conditional: conditionals.c6
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
          fields: [{
            canShow: stats => stats.constellation >= 1,
            text: <ColorText color="electro">Shield DMG Absorption</ColorText>,
            formulaText: stats => <span>16% {Stat.printStat("finalHP", stats)} * (100% + {Stat.printStat("shield_", stats)}) * (250% <ColorText color="electro">Electro Absorption</ColorText>)</span>,
            formula: formula.constellation1.shieldElectro,
            variant: "electro"
          }, {
            canShow: stats => stats.constellation >= 1,
            text: "Shield DMG Absorption",
            formulaText: stats => <span>16% {Stat.printStat("finalHP", stats)} * (100% + {Stat.printStat("shield_", stats)})</span>,
            formula: formula.constellation1.shield,
          },]
        }],
      },
      constellation2: talentTemplate("constellation2", tr, c2),
      constellation3: talentTemplate("constellation3", tr, c3, { skillBoost: 3 }),
      constellation4: {
        name: tr("constellation4.name"),
        img: c4,
        sections: [{
          text: tr("constellation4.description"),
          fields: [{
            text: "Electro DMG",
            formulaText: stats => <span>20% {Stat.printStat(getTalentStatKey("electro", stats), stats)}</span>,
            formula: formula.constellation4.dmg,
            variant: stats => getTalentStatKeyVariant("electro", stats),
          }]
        }],
      },
      constellation5: talentTemplate("constellation5", tr, c5, { burstBoost: 3 }),
      constellation6: talentTemplate("constellation6", tr, c6),
    },
  },
};
export default char;
