import card from './Character_Keqing_Card.jpg'
import thumb from './Icon.png'
import thumbSide from './IconSide.png'
import banner from './Banner.png'
import c1 from './Constellation_Thundering_Might.png'
import c2 from './Constellation_Keen_Extraction.png'
import c3 from './Constellation_Foreseen_Reformation.png'
import c4 from './Constellation_Attunement.png'
import c5 from './Constellation_Beckoning_Stars.png'
import c6 from './Constellation_Tenacious_Star.png'
import normal from './Talent_Yunlai_Swordsmanship.png'
import skill from './Talent_Stellar_Restoration.png'
import burst from './Talent_Starward_Sword.png'
import passive1 from './Talent_Thundering_Penance.png'
import passive2 from './Talent_Aristocratic_Dignity.png'
import passive3 from './Talent_Land\'s_Overseer.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import data_gen from './data_gen.json'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'
import { IConditionals } from '../../../Types/IConditional'
import { ICharacterSheet } from '../../../Types/character'
import { Translate } from '../../../Components/Translate'
import { WeaponTypeKey } from '../../../Types/consts'
import { talentTemplate } from '../SheetUtil'
const tr = (strKey: string) => <Translate ns="char_Keqing_gen" key18={strKey} />
const conditionals: IConditionals = {
  a1: {
    canShow: stats => stats.ascension >= 4,
    name: <span>Recasting <b>Stellar Restoration</b> while a Lightning Stiletto is present</span>,
    stats: { infusionSelf: "electro" },
    fields: [{
      text: "Duration",
      value: "5s"
    }]
  },
  a4: { // AristocraticDignity
    canShow: stats => stats.ascension >= 4,
    name: <span>Casting <b>Starward Sword</b></span>,
    stats: {
      critRate_: 15,
      enerRech_: 15,
    },
    fields: [{
      text: "Duration",
      value: "8s",
    }]
  },
  c4: { // Attunement
    canShow: stats => stats.constellation >= 4,
    name: "Trigger an Electro-related Elemental Reaction",
    stats: { atk_: data.constellation4.atk_ },
    fields: [{
      text: "Duration",
      value: "10s",
    }]
  },
  c6: { // Initating
    canShow: stats => stats.constellation >= 6,
    name: "Initiating Normal/Charged Attack, Skill or Burst",
    stats: { electro_dmg_: data.constellation6.electro_ },
    fields: [{
      text: "Duration",
      value: data.constellation6.duration,
      unit: "s"
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
        sections: [{
          text: <span><strong>Normal Attack</strong> Perform up to 5 rapid strikes.</span>,
          fields: data.normal.hitArr.map((percentArr, i) =>
          ({
            text: `${i + (i < 4 ? 1 : 0)}${i === 3 ? ".1" : i === 4 ? ".2" : ""}-Hit DMG`,
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
          text: <span><strong>Plunging Attack</strong> Plunges from mid-air to strike the ground below, damaging enemies along the path and dealing AoE DMG upon impact.</span>,
          fields: [{
            text: `Plunge DMG`,
            formulaText: stats => <span>{data.plunging.dmg[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
            formula: formula.plunging.dmg,
            variant: stats => getTalentStatKeyVariant("plunging", stats),
          }, {
            text: `Low Plunge DMG`,
            formulaText: stats => <span>{data.plunging.low[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
            formula: formula.plunging.low,
            variant: stats => getTalentStatKeyVariant("plunging", stats),
          }, {
            text: `High Plunge DMG`,
            formulaText: stats => <span>{data.plunging.high[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
            formula: formula.plunging.high,
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
            text: "Lightning Stiletto DMG",
            formulaText: stats => <span>{data.skill.stilleto[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.skill.stilleto,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: "Slashing DMG",
            formulaText: stats => <span>{data.skill.slashing[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.skill.slashing,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: "Thunderclap Slash DMG",
            formulaText: stats => <span>{data.skill.thunderclasp_slash[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.skill.thunderclap_slashing,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: "CD",
            value: data.skill.cd,
            fixed: 1,
            unit: "s"
          }]
        }],
      },
      burst: {
        name: tr("burst.name"),
        img: burst,
        sections: [{
          text: <span>
            {tr("burst.description")}
            <small>The <b>consecutive slashes</b> hits 8 times.</small>
          </span>,
          fields: [{
            text: "Skill DMG",
            formulaText: stats => <span>{data.burst.skill[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
            formula: formula.burst.skill,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            text: "Consecutive Slash DMG",
            formulaText: stats => <span>{data.burst.consec_slash[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
            formula: formula.burst.consec_slash,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            text: "Last Attack DMG",
            formulaText: stats => <span>{data.burst.last[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
            formula: formula.burst.last,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            text: "CD",
            value: data.burst.cd,
            unit: "s"
          }, {
            text: "Energy Cost",
            value: data.burst.cost,
          }],
          conditional: conditionals.a4
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
            text: " Thundering Might DMG",
            formulaText: stats => <span>{data.constellation1.dmg}% {Stat.printStat(getTalentStatKey("elemental", stats), stats)}</span>,
            formula: formula.constellation1.dmg,
            variant: stats => getTalentStatKeyVariant("elemental", stats),
          }]
        }],
      },
      constellation2: talentTemplate("constellation2", tr, c2),
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
