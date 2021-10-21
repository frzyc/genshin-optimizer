import card from './Character_Xinyan_Card.jpg'
import thumb from './Icon.png'
import thumbSide from './IconSide.png'
import banner from './Banner.png'
import c1 from './Constellation_Fatal_Acceleration.png'
import c2 from './Constellation_Impromptu_Opening.png'
import c3 from './Constellation_Double-Stop.png'
import c4 from './Constellation_Wildfire_Rhythm.png'
import c5 from './Constellation_Screamin\'_for_an_Encore.png'
import c6 from './Constellation_Rockin\'_in_a_Flaming_World.png'
import normal from './Talent_Dance_on_Fire.png'
import skill from './Talent_Sweeping_Fervor.png'
import burst from './Talent_Riff_Revolution.png'
import passive1 from './Talent__The_Show_Goes_On,_Even_Without_an_Audience..._.png'
import passive2 from './Talent__...Now_That\'s_Rock_\'N\'_Roll_.png'
import passive3 from './Talent_A_Rad_Recipe.png'
import Stat from '../../../Stat';
import formula, { data } from './data'
import data_gen from './data_gen.json';
import { getTalentStatKey, getTalentStatKeyVariant } from "../../../Build/Build";
import { ICharacterSheet } from '../../../Types/character'
import { IConditionals } from '../../../Types/IConditional'
import { Translate } from '../../../Components/Translate'
import { normalDocSection, plungeDocSection, talentTemplate } from '../SheetUtil'
import { WeaponTypeKey } from '../../../Types/consts'
import ColorText from '../../../Components/ColoredText'
const tr = (strKey: string) => <Translate ns="char_Xinyan_gen" key18={strKey} />
const conditionals: IConditionals = {
  a4s: { // NowThatsRockNRoll
    canShow: stats => stats.ascension >= 4,
    name: <span>Shielded by <b>Sweeping Fervor</b></span>,
    stats: { physical_dmg_: 15 },//TODO: party buff
  },
  a1: { // FatalAcceleration
    canShow: stats => stats.ascension >= 1,
    name: "Scoring a CRIT hit",
    stats: { atkSPD_: 12 },
    fields: [{
      text: "Duration",
      value: "5s"
    }]
  },
  a4: { // WildfireRhythm
    canShow: stats => stats.ascension >= 4,
    name: <span><b>Sweeping Fervor</b> DMG</span>,
    stats: { physical_enemyRes_: -15, }//TODO: party buff
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
        sections: [
          normalDocSection(tr, formula, data),
          {
            text: tr(`auto.fields.charged`),
            fields: [{
              canShow: stats => stats.constellation <= 5,
              text: `Spinning DMG`,
              formulaText: stats => <span>{data.charged.spinning[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
              formula: formula.charged.spinning,
              variant: stats => getTalentStatKeyVariant("charged", stats)
            }, {
              canShow: stats => stats.constellation > 5,
              text: `Spinning DMG`,
              formulaText: stats => <span>{data.charged.spinning[stats.tlvl.auto]}% ( {Stat.printStat("finalATK", stats)} + 50% {Stat.printStat("finalDEF", stats)} ) * {Stat.printStat(getTalentStatKey("charged", stats) + "_multi", stats)}</span>,
              formula: formula.charged.spinningDEF,
              variant: stats => getTalentStatKeyVariant("charged", stats)
            }, {
              canShow: stats => stats.constellation <= 5,
              text: `Spinning Final DMG`,
              formulaText: stats => <span>{data.charged.final[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
              formula: formula.charged.final,
              variant: stats => getTalentStatKeyVariant("charged", stats)
            }, {
              canShow: stats => stats.constellation > 5,
              text: `Spinning Final DMG`,
              formulaText: stats => <span>{data.charged.final[stats.tlvl.auto]}% ( {Stat.printStat("finalATK", stats)} + 50% {Stat.printStat("finalDEF", stats)} ) * {Stat.printStat(getTalentStatKey("charged", stats) + "_multi", stats)}</span>,
              formula: formula.charged.finalDEF,
              variant: stats => getTalentStatKeyVariant("charged", stats)
            }, {
              canShow: stats => stats.constellation <= 5,
              text: `Stamina Cost`,
              value: "40/s",
            }, {
              canShow: stats => stats.constellation > 5,
              text: `Stamina Cost`,
              value: "40/s - 30%",
            }, {
              text: `Max Duration`,
              value: "5s",
            }],
          },
          plungeDocSection(tr, formula, data),
        ],
      },
      skill: {
        name: tr("skill.name"),
        img: skill,
        sections: [{
          text: tr("skill.description"),
          fields: [{
            text: "Swing DMG",
            formulaText: stats => <span>{data.skill.dmg[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.skill.dmg,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          },
          ...[...Array(3)].map((_, i) => i + 1).flatMap(i => [{
            text: <ColorText color="pyro">Shield Level {i} DMG Absorption</ColorText>,
            formulaText: stats => <span>( {data.skill[`def${i}`][stats.tlvl.skill]}% {Stat.printStat("finalDEF", stats)} + {data.skill[`flat${i}`][stats.tlvl.skill]} ) * (100% + {Stat.printStat("shield_", stats)}) * (250% <ColorText color="pyro">Pyro Absorption</ColorText>)</span>,
            formula: formula.skill[`shield${i}Pyro`],
            variant: "pyro"
          }, {
            text: `Shield Level ${i} DMG Absorption`,
            formulaText: stats => <span>( {data.skill[`def${i}`][stats.tlvl.skill]}% {Stat.printStat("finalDEF", stats)} + {data.skill[`flat${i}`][stats.tlvl.skill]} ) * (100% + {Stat.printStat("shield_", stats)})</span>,
            formula: formula.skill[`shield${i}`],
          }]),
          {
            text: "Pyro DoT",
            formulaText: stats =>
              <span>{data.skill.dot[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.skill.dot,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: "Shield Duration",
            value: "12s",
          }, {
            text: "CD",
            value: "18s",
          }]
        }],
      },
      burst: {
        name: tr("burst.name"),
        img: burst,
        sections: [{
          text: tr("burst.description"),
          fields: [{
            text: "Burst DMG",
            formulaText: stats =>
              <span>{data.burst.dmg[stats.tlvl.burst]}% {Stat.printStat(stats.constellation >= 2 ? `physical_burst_critHit` : `physical_burst_${stats.hitMode}`, stats)}</span>,
            formula: formula.burst.dmg,
            variant: "physical"
          }, {
            text: "Pyro DoT",
            formulaText: stats =>
              <span>{data.burst.dot[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
            formula: formula.burst.dot,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            text: "Duration",
            value: "2s",
          }, {
            text: "CD",
            value: "15s",
          }, {
            text: "Energy Cost",
            value: 60,
          }, {
            canShow: stats => stats.constellation >= 2,
            text: "Form a shield at Level 3: Rave when cast"
          }, {
            canShow: stats => stats.constellation >= 2,
            text: "The Burst DMG will always CRIT."
          }],
        }]
      },
      passive1: talentTemplate("passive1", tr, passive1),
      passive2: {
        name: tr("passive2.name"),
        img: passive2,
        sections: [{
          text: tr("passive2.description"),
          conditional: conditionals.a4s
        }],
      },
      passive3: talentTemplate("passive3", tr, passive3),
      constellation1: {
        name: tr("constellation1.name"),
        img: c1,
        sections: [{
          text: tr("constellation1.description"),
          conditional: conditionals.a1
        }],
      },
      constellation2: talentTemplate("constellation2", tr, c2),
      constellation3: talentTemplate("constellation3", tr, c3, { skillBoost: 3 }),
      constellation4: {
        name: tr("constellation4.name"),
        img: c4,
        sections: [{
          text: tr("constellation4.description"),
          conditional: conditionals.a4
        }],
      },
      constellation5: talentTemplate("constellation5", tr, c5, { burstBoost: 3 }),
      constellation6: {
        name: tr("constellation6.name"),
        img: c6,
        sections: [{ text: tr("constellation6.description"), }],
        stats: stats => stats.constellation >= 6 && {
          staminaChargedDec_: 30
        }
      },
    },
  },
};
export default char;
