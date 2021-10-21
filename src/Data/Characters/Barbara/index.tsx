import card from './Character_Barbara_Card.jpg'
import thumb from './Icon.png'
import thumbSide from './IconSide.png'
import banner from './Banner.png'
import c1 from './Constellation_Gleeful_Songs.png'
import c2 from './Constellation_Vitality_Burst.png'
import c3 from './Constellation_Star_of_Tomorrow.png'
import c4 from './Constellation_Attentiveness_be_My_Power.png'
import c5 from './Constellation_The_Purest_Companionship.png'
import c6 from './Constellation_Dedicating_Everything_to_You.png'
import normal from './Talent_Whisper_of_Water.png'
import skill from './Talent_Let_the_Show_Begin.png'
import burst from './Talent_Shining_Miracle.png'
import passive1 from './Talent_Glorious_Season.png'
import passive2 from './Talent_Encore.png'
import passive3 from './Talent_With_My_Whole_Heart.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import data_gen from './data_gen.json'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'
import { IConditionals } from '../../../Types/IConditional'
import { ICharacterSheet } from '../../../Types/character'
import { Translate } from '../../../Components/Translate'
import { plungeDocSection, talentTemplate } from '../SheetUtil'
import { WeaponTypeKey } from '../../../Types/consts'
const tr = (strKey: string) => <Translate ns="char_Barbara_gen" key18={strKey} />
const conditionals: IConditionals = {
  a1: { // Glorious Season
    canShow: stats => stats.ascension >= 1,
    name: <span>Within <b>Let the Show Begin</b>'s Melody Loop</span>,
    stats: { staminaDec_: 12 }//TODO: Party buff
  },
  c2: { // VitalityBurst
    canShow: stats => stats.constellation >= 2,
    name: <span>During <b>Let the Show Begin</b></span>,
    stats: { hydro_dmg_: 15 }//TODO: Party buff active character
  }
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
          text: tr(`auto.fields.normal`),
          fields: data.normal.hitArr.map((percentArr, i) =>
          ({
            text: `${i + 1}-Hit DMG`,
            formulaText: stats => <span>{percentArr[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
            formula: formula.normal[i],
            variant: stats => getTalentStatKeyVariant("normal", stats),
          }))
        }, {
          text: tr("auto.fields.charged"),
          fields: [{
            text: `Charged Attack DMG`,
            formulaText: stats => <span>{data.charged.dmg[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
            formula: formula.charged.dmg,
            variant: stats => getTalentStatKeyVariant("charged", stats),
          }, {
            text: `Stamina Cost`,
            value: `50`,
          }]
        },
        plungeDocSection(tr, formula, data)],
      },
      skill: {
        name: tr("skill.name"),
        img: skill,
        sections: [{
          text: tr("skill.description"),
          fields: [{
            text: "HP Regeneration Per Hit",
            formulaText: stats => <span>( {data.skill.hp[stats.tlvl.skill]}% {Stat.printStat("finalHP", stats)} + {data.skill.hpFlat[stats.tlvl.skill]} ) * {Stat.printStat("heal_multi", stats)}</span>,
            formula: formula.skill.regenPerHit,
            variant: "success"
          }, {
            text: "Continuous Regeneration",
            formulaText: stats => <span>( {data.skill.contHP[stats.tlvl.skill]}% {Stat.printStat("finalHP", stats)} + {data.skill.contHPFlat[stats.tlvl.skill]} ) * {Stat.printStat("heal_multi", stats)}</span>,
            formula: formula.skill.contRegen,
            variant: "success"
          }, {
            text: "Droplet DMG",
            formulaText: stats => <span>{data.skill.dmg[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.skill.dmg,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: "Duration",
            value: stats => "15s" + (stats.ascension >= 4 ? " (+1s when your active character gains an Elemental Orb/Particle, up to 5s)" : ""),
          }, {
            text: "CD",
            value: stats => "32s" + (stats.constellation >= 2 ? " -15%" : ""),
          }]
        }, {
          conditional: conditionals.a1
        }, {
          conditional: conditionals.c2
        }],

      },
      burst: {
        name: tr("burst.name"),
        img: burst,
        sections: [{
          text: tr("burst.description"),
          fields: [{
            text: "Regeneration",
            formulaText: stats => <span>( {data.burst.hp[stats.tlvl.burst]}% {Stat.printStat("finalHP", stats)} + {data.burst.flat[stats.tlvl.burst]} ) * {Stat.printStat("heal_multi", stats)}</span>,
            formula: formula.burst.regen,
            variant: "success"
          }, {
            text: "CD",
            value: "20s",
          }, {
            text: "Energy Cost",
            value: 80,
          }]
        }],
      },
      passive1: talentTemplate("passive1", tr, passive1),
      passive2: talentTemplate("passive2", tr, passive2),
      passive3: talentTemplate("passive3", tr, passive3),
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
