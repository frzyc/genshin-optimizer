import card from './Character_Zhongli_Card.png'
import thumb from './Icon.png'
import thumbSide from './IconSide.png'
import banner from './Banner.png'
import c1 from './Constellation_Rock,_the_Backbone_of_Earth.png'
import c2 from './Constellation_Stone,_the_Cradle_of_Jade.png'
import c3 from './Constellation_Jade,_Shimmering_through_Darkness.png'
import c4 from './Constellation_Topaz,_Unbreakable_and_Fearless.png'
import c5 from './Constellation_Lazuli,_Herald_of_the_Order.png'
import c6 from './Constellation_Chrysos,_Bounty_of_Dominator.png'
import normal from './Talent_Rain_of_Stone.png'
import skill from './Talent_Dominus_Lapidis.png'
import burst from './Talent_Planet_Befall.png'
import passive1 from './Talent_Resonant_Waves.png'
import passive2 from './Talent_Dominance_of_Earth.png'
import passive3 from './Talent_Arcanum_of_Crystal.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import data_gen from './data_gen.json'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'
import ElementalData from '../../ElementalData'
import { IConditionals } from '../../../Types/IConditional'
import { ICharacterSheet } from '../../../Types/character'
import { Translate } from '../../../Components/Translate'
import { talentTemplate } from '../SheetUtil'
import { WeaponTypeKey } from '../../../Types/consts'
const tr = (strKey: string) => <Translate ns="char_Zhongli_gen" key18={strKey} />
const conditionals: IConditionals = {
  sk: { // JadeShield (near)
    name: <span>Enemies near <b>Jade Shield</b></span>,
    stats: Object.fromEntries(Object.keys(ElementalData).map(k => [`${k}_enemyRes_`, -20])),//TODO: party buff
  },
  p1: { // ResonantWaves (on dmg)
    canShow: stats => stats.ascension >= 1,
    name: <span>When the <b>Jade Shield</b> takes DMG</span>,
    maxStack: 5,
    stats: { shield_: 5 },
  }
}
const char: ICharacterSheet = {
  name: tr("name"),
  cardImg: card,
  thumbImg: thumb,
  thumbImgSide: thumbSide,
  bannerImg: banner,
  star: data_gen.star,
  elementKey: "geo",
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
          text: tr(`auto.fields.normal`),
          fields: [
            ...data.normal.hitArr.map((percentArr, i) => ({
              canShow: stats => stats.ascension < 4,
              text: `${i + 1}-Hit DMG ${i === 4 ? " (4 Hits)" : ""}`,
              formulaText: stats => <span>{percentArr[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
              formula: formula.normal[i],
              variant: stats => getTalentStatKeyVariant("normal", stats),
            })),
            ...data.normal.hitArr.map((percentArr, i) => ({
              canShow: stats => stats.ascension >= 4,
              text: `${i + 1}-Hit DMG ${i === 4 ? " (4 Hits)" : ""}`,
              formulaText: stats => <span>( {percentArr[stats.tlvl.auto]}% {Stat.printStat("finalATK", stats)} + 1.39% {Stat.printStat("finalHP", stats)} ) * {Stat.printStat(getTalentStatKey("normal", stats) + "_multi", stats)}</span>,
              formula: formula.normal[`${i}HP`],
              variant: stats => getTalentStatKeyVariant("normal", stats),
            }))]
        }, {
          text: tr(`auto.fields.charged`),
          fields: [{
            canShow: stats => stats.ascension < 4,
            text: `Charged Attack DMG`,
            formulaText: stats => <span>{data.charged.dmg[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
            formula: formula.charged.dmg,
            variant: stats => getTalentStatKeyVariant("charged", stats),
          }, {
            canShow: stats => stats.ascension >= 4,
            text: `Charged Attack DMG`,
            formulaText: stats => <span>( {data.charged.dmg[stats.tlvl.auto]}% {Stat.printStat("finalATK", stats)} + 1.39% {Stat.printStat("finalHP", stats)} ) * {Stat.printStat(getTalentStatKey("charged", stats) + "_multi", stats)}</span>,
            formula: formula.charged.dmgHP,
            variant: stats => getTalentStatKeyVariant("charged", stats),
          }, {
            text: `Stamina Cost`,
            value: 25,
          }]
        }, {
          text: tr(`auto.fields.plunging`),
          fields: [{
            canShow: stats => stats.ascension < 4,
            text: `Plunge DMG`,
            formulaText: stats => <span>{data.plunging.dmg[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
            formula: formula.plunging.dmg,
            variant: stats => getTalentStatKeyVariant("plunging", stats),
          }, {
            canShow: stats => stats.ascension >= 4,
            text: `Plunge DMG`,
            formulaText: stats => <span>( {data.plunging.dmg[stats.tlvl.auto]}% {Stat.printStat("finalATK", stats)} + 1.39% {Stat.printStat("finalHP", stats)} ) * {Stat.printStat(getTalentStatKey("plunging", stats) + "_multi", stats)}</span>,
            formula: formula.plunging.dmgHP,
            variant: stats => getTalentStatKeyVariant("charged", stats),
          }, {
            canShow: stats => stats.ascension < 4,
            text: `Low Plunge DMG`,
            formulaText: stats => <span>{data.plunging.low[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
            formula: formula.plunging.low,
            variant: stats => getTalentStatKeyVariant("plunging", stats),
          }, {
            canShow: stats => stats.ascension >= 4,
            text: `Low Plunge DMG`,
            formulaText: stats => <span>( {data.plunging.low[stats.tlvl.auto]}% {Stat.printStat("finalATK", stats)} + 1.39% {Stat.printStat("finalHP", stats)} ) * {Stat.printStat(getTalentStatKey("plunging", stats) + "_multi", stats)}</span>,
            formula: formula.plunging.lowHP,
            variant: stats => getTalentStatKeyVariant("plunging", stats),
          }, {
            canShow: stats => stats.ascension < 4,
            text: `High Plunge DMG`,
            formulaText: stats => <span>{data.plunging.high[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
            formula: formula.plunging.high,
            variant: stats => getTalentStatKeyVariant("plunging", stats),
          }, {
            canShow: stats => stats.ascension >= 4,
            text: `High Plunge DMG`,
            formulaText: stats => <span>( {data.plunging.high[stats.tlvl.auto]}% {Stat.printStat("finalATK", stats)} + 1.39% {Stat.printStat("finalHP", stats)} ) * {Stat.printStat(getTalentStatKey("plunging", stats) + "_multi", stats)}</span>,
            formula: formula.plunging.highHP,
            variant: stats => getTalentStatKeyVariant("plunging", stats),
          }]
        }],
      },
      skill: {
        name: tr("skill.name"),
        img: skill,
        sections: [{
          text: tr("skill.description"),
          fields: [{
            canShow: stats => stats.ascension < 4,
            text: "Stone Stele DMG",
            formulaText: stats => <span>{data.skill.steeleDMG[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.skill.steeleDMG,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            canShow: stats => stats.ascension >= 4,
            text: "Stone Stele DMG",
            formulaText: stats => <span>( {data.skill.steeleDMG[stats.tlvl.skill]}% {Stat.printStat("finalATK", stats)} + 1.9% {Stat.printStat("finalHP", stats)} ) * {Stat.printStat(getTalentStatKey("skill", stats) + "_multi", stats)}</span>,
            formula: formula.skill.steeleDMGHP,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            canShow: stats => stats.ascension < 4,
            text: "Resonance DMG",
            formulaText: stats => <span>{data.skill.resonanceDMG[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.skill.resonanceDMG,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            canShow: stats => stats.ascension >= 4,
            text: "Resonance DMG",
            formulaText: stats => <span>( {data.skill.resonanceDMG[stats.tlvl.skill]}% {Stat.printStat("finalATK", stats)} + 1.9% {Stat.printStat("finalHP", stats)} ) * {Stat.printStat(getTalentStatKey("skill", stats) + "_multi", stats)}</span>,
            formula: formula.skill.resonanceDMGHP,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: "Maximum Stele number",
            value: stats => stats.constellation >= 1 ? 2 : 1,
          }, {
            text: "Press CD",
            value: "4s",
          }, {
            canShow: stats => stats.ascension < 4,
            text: "Hold DMG",
            formulaText: stats => <span>{data.skill.holdDMG[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.skill.holdDMG,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            canShow: stats => stats.ascension >= 4,
            text: "Hold DMG",
            formulaText: stats => <span>( {data.skill.holdDMG[stats.tlvl.skill]}% {Stat.printStat("finalATK", stats)} + 1.9% {Stat.printStat("finalHP", stats)} ) * {Stat.printStat(getTalentStatKey("skill", stats) + "_multi", stats)}</span>,
            formula: formula.skill.holdDMGHP,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: "Shield Absorption",
            formulaText: stats => <span>( {data.skill.shieldBase[stats.tlvl.skill]} + {data.skill.shieldMaxHP[stats.tlvl.skill]}% {Stat.printStat("finalHP", stats)} ) * (100% + {Stat.printStat("shield_", stats)}) * 150% All DMG Absorption</span>,
            formula: formula.skill.shield,
          }, {
            text: "Shield Duration",
            value: "20s",
          }, {
            text: "Hold CD",
            value: "12s",
          }],
          conditional: conditionals.sk
        }],
      },
      burst: {
        name: tr("burst.name"),
        img: burst,
        sections: [{
          text: tr("burst.description"),
          fields: [{
            canShow: stats => stats.ascension < 4,
            text: "Skill DMG",
            formulaText: stats => <span>{data.burst.dmg[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
            formula: formula.burst.dmg,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            canShow: stats => stats.ascension >= 4,
            text: "Skill DMG",
            formulaText: stats => <span>( {data.burst.dmg[stats.tlvl.burst]}% {Stat.printStat("finalATK", stats)} + 33% {Stat.printStat("finalHP", stats)} ) * {Stat.printStat(getTalentStatKey("burst", stats) + "_multi", stats)}</span>,
            formula: formula.burst.dmgHP,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            canShow: stats => stats.constellation >= 4,
            text: "AoE Increase",
            value: "20%",
          }, {
            text: "Petrification Duration",
            value: stats => data.burst.petriDur[stats.tlvl.burst] + "s" + (stats.constellation >= 4 ? " +2s" : ""),
          }, {
            text: "CD",
            value: "12s",
          }, {
            text: "Energy Cost",
            value: 40,
          }]
        }],
      },
      passive1: {
        name: tr("passive1.name"),
        img: passive1,
        sections: [{
          text: tr("passive1.description"),
          conditional: conditionals.p1
        }],
      },
      passive2: talentTemplate("passive2", tr, passive2),
      passive3: talentTemplate("passive3", tr, passive3),
      constellation1: talentTemplate("constellation1", tr, c1),
      constellation2: talentTemplate("constellation2", tr, c2),
      constellation3: talentTemplate("constellation3", tr, c3, { skillBoost: 3 }),
      constellation4: talentTemplate("constellation4", tr, c4),
      constellation5: talentTemplate("constellation5", tr, c5, { burstBoost: 3 }),
      constellation6: {
        name: tr("constellation6.name"),
        img: c6,
        sections: [{
          text: tr("constellation6.description"),
          fields: [{
            canShow: stats => stats.constellation >= 6,
            text: "Maximum Health Regen",
            value: stats => stats.finalHP * 0.08,
            variant: "success"
          },]
        }],
      }
    },
  },
};
export default char;
