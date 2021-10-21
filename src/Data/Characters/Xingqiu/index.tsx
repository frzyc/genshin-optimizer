import card from './Character_Xingqiu_Card.jpg'
import thumb from './Icon.png'
import thumbSide from './IconSide.png'
import banner from './Banner.png'
import c1 from './Constellation_The_Scent_Remained.png'
import c2 from './Constellation_Rainbow_Upon_the_Azure_Sky.png'
import c3 from './Constellation_Weaver_of_Verses.png'
import c4 from './Constellation_Evilsoother.png'
import c5 from './Constellation_Embrace_of_Rain.png'
import c6 from './Constellation_Hence,_Call_Them_My_Own_Verses.png'
import normal from './Talent_Guhua_Style.png'
import skill from './Talent_Guhua_Sword_-_Fatal_Rainscreen.png'
import burst from './Talent_Guhua_Sword_-_Raincutter.png'
import passive1 from './Talent_Hydropathic.png'
import passive2 from './Talent_Blades_Amidst_Raindrops.png'
import passive3 from './Talent_Flash_of_Genius.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import data_gen from './data_gen.json'
import { getTalentStatKey, getTalentStatKeyVariant } from "../../../Build/Build"
import { ICharacterSheet } from '../../../Types/character'
import { IConditionals } from '../../../Types/IConditional'
import { Translate } from '../../../Components/Translate'
import { talentTemplate } from '../SheetUtil'
import { WeaponTypeKey } from '../../../Types/consts'
const tr = (strKey: string) => <Translate ns="char_Xingqiu_gen" key18={strKey} />
const conditionals: IConditionals = {
  c2: { // RainbowUponTheAzureSky
    canShow: stats => stats.constellation >= 2,
    name: "Opponent hit by sword rain",
    stats: { hydro_enemyRes_: -15 },
  },
}
const char: ICharacterSheet = {
  name: tr("name"),
  cardImg: card,
  thumbImg: thumb,
  thumbImgSide: thumbSide,
  bannerImg: banner,
  star: data_gen.star,
  elementKey: "hydro",
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
        sections: [{
          text: <span><strong>Normal Attack</strong> Perform up to 5 rapid strikes. <small><i>Note: the 3rd attack hits twice.</i></small></span>,
          fields: data.normal.hitArr.map((percentArr, i) =>
          ({
            text: `${i + 1}-Hit DMG ${i === 2 || i === 4 ? " (2 Hits)" : ""}`,
            formulaText: stats => <span>{percentArr[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
            formula: formula.normal[i],
            variant: stats => getTalentStatKeyVariant("normal", stats),
          }))
        }, {
          text: <span><strong>Charged Attack</strong> Consumes a certain amount of Stamina to unleash 2 rapid sword strikes.</span>,
          fields: [{
            text: `Charged 1-Hit DMG`,
            formulaText: stats => <span>{data.charged.hit1[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
            formula: formula.charged.hit1,
            variant: stats => getTalentStatKeyVariant("charged", stats),
          }, {
            text: `Charged 2-Hit DMG`,
            formulaText: stats => <span>{data.charged.hit2[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
            formula: formula.charged.hit2,
            variant: stats => getTalentStatKeyVariant("charged", stats),
          }, {
            text: `Stamina Cost`,
            value: data.charged.stam,
          }]
        }, {
          text: <span><strong>Plunging Attack</strong> Plunges from mid-air to strike the ground below, damaging opponents along the path and dealing AoE DMG upon impact.</span>,
          fields: [{
            text: `Plunge DMG`,
            formulaText: stats => <span>{data.plunging.dmg[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
            formula: formula.plunging.dmg,
            variant: stats => getTalentStatKeyVariant("plunge", stats),
          }, {
            text: `Low Plunge DMG`,
            formulaText: stats => <span>{data.plunging.low[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
            formula: formula.plunging.low,
            variant: stats => getTalentStatKeyVariant("plunge", stats),
          }, {
            text: `High Plunge DMG`,
            formulaText: stats => <span>{data.plunging.high[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
            formula: formula.plunging.high,
            variant: stats => getTalentStatKeyVariant("plunge", stats),
          }]
        }],
      },
      skill: {
        name: tr("skill.name"),
        img: skill,
        sections: [{
          text: tr("skill.description"),
          fields: [{
            text: "Skill 1-Hit DMG",
            formulaText: stats => <span>{data.skill.hit1[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.skill.hit1,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: "Skill 2-Hit DMG",
            formulaText: stats => <span>{data.skill.hit2[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.skill.hit2,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            canShow: stats => stats.constellation >= 4,
            text: "Skill 1-Hit DMG during RainCutter",
            formulaText: stats => <span> ( {data.skill.hit1[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)} ) * 150%</span>,
            formula: formula.skill.hit1RainCutter,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            canShow: stats => stats.constellation >= 4,
            text: "Skill 2-Hit DMG during RainCutter",
            formulaText: stats => <span> ( {data.skill.hit2[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)} ) * 150%</span>,
            formula: formula.skill.hit2RainCutter,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: "Damage Reduction Ratio",
            formulaText: stats => <span>{data.skill.dmgRed[stats.tlvl.skill]}%  + min(24%, 20% * {Stat.printStat("hydro_dmg_", stats)} )</span>,
            formula: formula.skill.dmgRed,
            fixed: 2,
            unit: "%"
          }, {
            text: "Sword Number",
            value: stats => stats.constellation >= 1 ? 4 : 3,
          }, {
            text: "Duration",
            value: data.skill.duration,
            unit: ""
          }, {
            text: "CD",
            value: data.skill.cd,
            unit: ""
          }]
        }],
      },
      burst: {
        name: tr("burst.name"),
        img: burst,
        sections: [{
          text: tr("burst.description"),
          fields: [{
            text: "Sword Rain DMG",
            formulaText: stats => <span>{data.burst.dmg[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
            formula: formula.burst.dmg,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            text: "Duration",
            value: stats => data.burst.duration + (stats.constellation >= 2 ? 3 : 0),
            unit: "s"
          }, {
            text: "CD",
            value: data.burst.cd,
            unit: "s"
          }, {
            text: "Energy Cost",
            value: data.burst.cost,
          }]
        }],
      },
      passive1: talentTemplate("passive1", tr, passive1),
      passive2: {
        name: tr("passive2.name"),
        img: passive2,
        sections: [{ text: tr("passive2.description"), }],
        stats: stats => stats.ascension >= 4 && {
          hydro_dmg_: 20,
        }
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
      constellation3: talentTemplate("constellation3", tr, c3, { burstBoost: 3 }),
      constellation4: talentTemplate("constellation4", tr, c4),
      constellation5: talentTemplate("constellation5", tr, c5, { skillBoost: 3 }),
      constellation6: talentTemplate("constellation6", tr, c6),
    },
  },
};
export default char;
