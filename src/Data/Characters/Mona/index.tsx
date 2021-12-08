import card from './Character_Mona_Card.jpg'
import thumb from './Icon.png'
import thumbSide from './IconSide.png'
import banner from './Banner.png'
import c1 from './constellation1.png'
import c2 from './constellation2.png'
import c3 from './constellation3.png'
import c4 from './constellation4.png'
import c5 from './constellation5.png'
import c6 from './constellation6.png'
import skill from './skill.png'
import burst from './burst.png'
import sprint from './sprint.png'
import passive1 from './passive1.png'
import passive2 from './passive2.png'
import passive3 from './passive3.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import data_gen from './data_gen.json'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'
import { ICharacterSheet } from '../../../Types/character'
import { Translate } from '../../../Components/Translate'
import { chargedDocSection, conditionalHeader, normalDocSection, normalSrc, plungeDocSection, sgt, talentTemplate } from '../SheetUtil'
import { KeyPath } from '../../../Util/KeyPathUtil'
import { FormulaPathBase } from '../../formula'
import { WeaponTypeKey } from '../../../Types/consts'
import ColorText from '../../../Components/ColoredText'

const path = KeyPath<FormulaPathBase, any>().character.Mona
const tr = (strKey: string) => <Translate ns="char_Mona_gen" key18={strKey} />

const char: ICharacterSheet = {
  name: tr("name"),
  cardImg: card,
  thumbImg: thumb,
  thumbImgSide: thumbSide,
  bannerImg: banner,
  rarity: data_gen.star,
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
    sheets: {
      auto: {
        name: tr("auto.name"),
        img: normalSrc(data_gen.weaponTypeKey as WeaponTypeKey),
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
          conditional: {
            key: "q",
            partyBuff: "partyAll",
            header: conditionalHeader("burst", tr, burst),
            description: tr("burst.description"),
            name: "Omen",
            stats: stats => ({
              dmg_: data.burst.dmg_[stats.tlvl.burst],
            }),
            fields: [{
              text: "Omen Duration",
              value: stats => `${data.burst.omen_duration[stats.tlvl.burst]}s`,
            }]
          },
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
        sections: [{
          text: tr("passive2.description"),
          fields: [{
            canShow: stats => stats.ascension >= 4,
            text: "Hydro DMG Bonus",
            formulaText: stats => <span>20% {Stat.printStat("enerRech_", stats, true)}</span>,
            formula: formula.passive2.bonus,
            fixed: 1,
            unit: "%"
          }],
          conditional: {
            key: "a4",
            canShow: stats => stats.ascension >= 4,
            maxStack: 0,
            stats: {
              modifiers: { hydro_dmg_: [path.passive2.bonus()] },
            },
          }
        }],
      },
      passive3: talentTemplate("passive3", tr, passive3),
      constellation1: {
        name: tr("constellation1.name"),
        img: c1,
        sections: [{
          text: tr("constellation1.description"),
          conditional: { // 	Prophecy of Submersion
            key: "c1",
            canShow: stats => stats.constellation >= 1,
            partyBuff: "partyAll",
            header: conditionalHeader("constellation1", tr, c1),
            description: tr("constellation1.description"),
            name: <span>Any characters in the party hit an opponent affected by an <strong>Omen</strong></span>,
            stats: {
              electrocharged_dmg_: 15,
              vaporize_dmg_: 15,
              swirl_dmg_: 15
            },
            fields: [{
              canShow: stats => stats.constellation >= 1,
              text: <span><ColorText color="cryo">Frozen</ColorText> Duration Increase</span>,
              value: 15,
              unit: "%",
              variant: "cryo",
            },]
          },
        }],
      },
      constellation2: talentTemplate("constellation2", tr, c2),
      constellation3: talentTemplate("constellation3", tr, c3, "burstBoost"),
      constellation4: {
        name: tr("constellation4.name"),
        img: c4,
        sections: [{
          text: tr("constellation4.description"),
          conditional: { // ProphecyOfOblivion
            key: "c4",
            canShow: stats => stats.constellation >= 4,
            partyBuff: "partyAll",
            header: conditionalHeader("constellation4", tr, c4),
            description: tr("constellation4.description"),
            name: <span>Any characters in the party hit an opponent affected by an <strong>Omen</strong></span>,
            stats: { critRate_: 15 },
          },
        }],
      },
      constellation5: talentTemplate("constellation5", tr, c5, "skillBoost"),
      constellation6: {
        name: tr("constellation6.name"),
        img: c6,
        sections: [{
          text: tr("constellation6.description"),
          conditional: { // RhetoricsOfCalamitas
            key: "c6",
            canShow: stats => stats.constellation >= 6,
            name: <span>Upon entering <b>Illusory Torrent</b></span>,
            maxStack: 3,
            stats: { charged_dmg_: 60 },
            fields: [{
              text: sgt("duration"),
              value: 8,
              unit: "s"
            }]
          },
        }],
      }
    },
  },
};
export default char;
