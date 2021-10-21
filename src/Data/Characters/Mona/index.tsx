import card from './Character_Mona_Card.jpg'
import thumb from './Icon.png'
import thumbSide from './IconSide.png'
import banner from './Banner.png'
import c1 from './Constellation_Prophecy_of_Submersion.png'
import c2 from './Constellation_Lunar_Chain.png'
import c3 from './Constellation_Restless_Revolution.png'
import c4 from './Constellation_Prophecy_of_Oblivion.png'
import c5 from './Constellation_Mockery_of_Fortuna.png'
import c6 from './Constellation_Rhetorics_of_Calamitas.png'
import normal from './Talent_Ripple_of_Fate.png'
import skill from './Talent_Mirror_Reflection_of_Doom.png'
import burst from './Talent_Stellaris_Phantasm.png'
import sprint from './Talent_Illusory_Torrent.png'
import passive1 from './Talent_Come_\'n\'_Get_Me,_Hag.png'
import passive2 from './Talent_Waterborne_Destiny.png'
import passive3 from './Talent_Principium_of_Astrology.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import data_gen from './data_gen.json'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'
import { IConditionals } from '../../../Types/IConditional'
import { ICharacterSheet } from '../../../Types/character'
import { Translate } from '../../../Components/Translate'
import { chargedDocSection, normalDocSection, plungeDocSection, talentTemplate } from '../SheetUtil'
import { KeyPath } from '../../../Util/KeyPathUtil'
import { FormulaPathBase } from '../../formula'
import { WeaponTypeKey } from '../../../Types/consts'
import ColorText from '../../../Components/ColoredText'

const path = KeyPath<FormulaPathBase, any>().character.Mona
const tr = (strKey: string) => <Translate ns="char_Mona_gen" key18={strKey} />
const conditionals: IConditionals = {
  q: { // StellarisPhantasm
    name: "Stellaris Phantasm",
    stats: stats => ({
      dmg_: data.burst.dmg_[stats.tlvl.burst],
      ...(stats.constellation >= 1) && {
        electrocharged_dmg_: 15,
        vaporize_dmg_: 15,
        swirl_dmg_: 15
      },//TODO: frozen duration as a stat
    }),
    fields: [{
      canShow: stats => stats.constellation >= 1,
      text: <span><ColorText color="cryo">Frozen</ColorText> Duration Increase</span>,
      value: "15.0%",
      variant: "cryo",
    }, {
      text: "Omen Duration",
      value: stats => `${data.burst.omen_duration[stats.tlvl.burst]}s`,
    }]
  },
  c4: { // ProphecyOfOblivion
    canShow: stats => stats.constellation >= 4,
    name: <span>Any characters in the party hit an opponent affected by an <b>Omen</b></span>,
    stats: { critRate_: 15 },//TODO: party conditional
  },
  c6: { // RhetoricsOfCalamitas
    canShow: stats => stats.constellation >= 6,
    name: <span>Upon entering <b>Illusory Torrent</b></span>,
    maxStack: 3,
    stats: { charged_dmg_: 60 },
    fields: [{
      text: "Duration",
      value: "8s"
    }]
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
            text: "DoT",
            formulaText: stats => <span>{data.skill.dot[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.skill.dot,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: "Explosion DMG",
            formulaText: stats => <span>{data.skill.dmg[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.skill.dmg,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: "CD",
            value: "12s",
          }]
        }],
      },
      burst: {
        name: tr("burst.name"),
        img: burst,
        sections: [{
          text: tr("burst.description"),
          fields: [{
            text: "Illusory Bubble Duration",
            value: "8s",
          }, {
            text: "Illusory Bubble Explosion DMG",
            formulaText: stats => <span>{data.burst.bubble_explosion[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
            formula: formula.burst.bubble_explosion,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            text: "CD",
            value: "15s",
          }, {
            text: "Energy Cost",
            value: 60,
          }],
          conditional: conditionals.q
        }],
      },
      sprint: {
        name: tr("sprint.name"),
        img: sprint,
        sections: [{
          text: tr("sprint.description"),
          fields: [{
            text: "Activation Stamina Consumption",
            value: 10,
          }, {
            text: "Stamina Drain",
            value: "15/s",
          }]
        }],
      },
      passive1: {
        name: tr("passive1.name"),
        img: passive1,
        sections: [{
          text: tr("passive1.description"),
          fields: [{
            canShow: stats => stats.ascension >= 1,
            text: "Explosion DMG",
            formulaText: stats => <span>{data.skill.dmg[stats.tlvl.skill]}% * 50% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.passive1.dmg,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            canShow: stats => stats.ascension >= 1,
            text: "Phantom Duration",
            value: "2s"
          }]
        }],
      },
      passive2: {
        name: tr("passive2.name"),
        img: passive2,
        stats: stats => stats.ascension >= 4 && {
          modifiers: { hydro_dmg_: [path.passive2.bonus()] },
        },
        sections: [{
          text: tr("passive2.description"),
          fields: [{
            canShow: stats => stats.ascension >= 4,
            text: "Hydro DMG Bonus",
            formulaText: stats => <span>20% {Stat.printStat("enerRech_", stats, true)}</span>,
            formula: formula.passive2.bonus,
            fixed: 1,
            unit: "%"
          }]
        }],
      },
      passive3: talentTemplate("passive3", tr, passive3),
      constellation1: talentTemplate("constellation1", tr, c1),
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
      }
    },
  },
};
export default char;
