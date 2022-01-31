import card from './Character_Arataki_Itto_Card.jpg'
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
import passive1 from './passive1.png'
import passive2 from './passive2.png'
import passive3 from './passive3.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import data_gen from './data_gen.json'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../PageBuild/Build'
import { ICharacterSheet } from '../../../Types/character'
import { Translate } from '../../../Components/Translate'
import { conditionalHeader, normalDocSection, normalSrc, plungeDocSection, sgt, talentTemplate } from '../SheetUtil'
import { KeyPath } from '../../../Util/KeyPathUtil'
import { FormulaPathBase } from '../../formula'
import { allElementsWithPhy, WeaponTypeKey } from '../../../Types/consts'
import { Typography } from '@mui/material'

const path = KeyPath<FormulaPathBase, any>().character.AratakiItto
const tr = (strKey: string) => <Translate ns="char_AratakiItto_gen" key18={strKey} />
const charTr = (strKey: string) => <Translate ns="char_AratakiItto" key18={strKey} />
const char: ICharacterSheet = {
  name: tr("name"),
  cardImg: card,
  thumbImg: thumb,
  thumbImgSide: thumbSide,
  bannerImg: banner,
  rarity: data_gen.star,
  elementKey: "geo",
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
          {
            text: tr("auto.fields.charged"),
            fields: [{
              text: tr("auto.skillParams.4"),
              canShow: stats => stats.ascension < 4,
              formulaText: stats => <span>{data.charged.akSlash[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
              formula: formula.charged.akSlash,
              variant: stats => getTalentStatKeyVariant("charged", stats),
            }, {
              text: tr("auto.skillParams.4"),
              canShow: stats => stats.ascension >= 4,
              formulaText: stats => <span>( {data.charged.akSlash[stats.tlvl.auto]}% {Stat.printStat("finalATK", stats)} + {data.passive2.def}% {Stat.printStat("finalDEF", stats)} ) * {Stat.printStat(getTalentStatKey("charged", stats) + "_multi", stats)}</span>,
              formula: formula.charged.akSlashA4,
              variant: stats => getTalentStatKeyVariant("charged", stats),
            }, {
              text: tr("auto.skillParams.5"),
              canShow: stats => stats.ascension < 4,
              formulaText: stats => <span>{data.charged.akFinal[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
              formula: formula.charged.akFinal,
              variant: stats => getTalentStatKeyVariant("charged", stats),
            }, {
              text: tr("auto.skillParams.5"),
              canShow: stats => stats.ascension >= 4,
              formulaText: stats => <span>( {data.charged.akFinal[stats.tlvl.auto]}% {Stat.printStat("finalATK", stats)} + {data.passive2.def}% {Stat.printStat("finalDEF", stats)} ) * {Stat.printStat(getTalentStatKey("charged", stats) + "_multi", stats)}</span>,
              formula: formula.charged.akFinalA4,
              variant: stats => getTalentStatKeyVariant("charged", stats),
            }, {
              text: tr("auto.skillParams.6"),
              value: data.ss.duration,
              unit: "s"
            }, {
              text: tr("auto.skillParams.7"),
              formulaText: stats => <span>{data.charged.sSlash[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
              formula: formula.charged.sSlash,
              variant: stats => getTalentStatKeyVariant("charged", stats),
            }, {
              text: tr("auto.skillParams.8"),
              value: data.charged.stam,
            }]
          },
          plungeDocSection(tr, formula, data)
        ],
      },
      skill: {
        name: tr("skill.name"),
        img: skill,
        sections: [{
          text: tr("skill.description"),
          fields: [
            {
              text: tr("skill.skillParams.0"),
              formulaText: stats => <span>{data.skill.dmg[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats) + "_multi", stats)} * {Stat.printStat("finalDEF", stats)}</span>,
              formula: formula.skill.dmg,
              variant: stats => getTalentStatKeyVariant("skill", stats),
            }, {
              text: tr("skill.skillParams.1"),
              formulaText: stats => <span>{data.skill.hp[stats.tlvl.skill]}% {Stat.printStat("finalHP", stats)}</span>,
              formula: formula.skill.hp,
              variant: "success",
            }, {
              text: tr("skill.skillParams.2"),
              value: data.skill.duration,
              unit: "s"
            }, {
              text: tr("skill.skillParams.3"),
              value: data.skill.cd,
              unit: "s"
            }
          ],
        }],
      },
      burst: {
        name: tr("burst.name"),
        img: burst,
        sections: [{
          text: tr("burst.description"),
          fields: [{
            text: tr("burst.skillParams.3"),
            value: data.burst.cd,
            unit: "s"
          }, {
            text: tr("burst.skillParams.4"),
            value: data.burst.cost,
            unit: "s"
          }],
          conditional: { // Sweeping Time
            key: "q",
            name: tr("burst.name"),
            maxStack: 1,
            stats: stats => ({
              modifiers: { atk: [path.burst.defConv()] },
              infusionSelf: "geo",
              atkSPD_: data.burst.atkSpd[stats.tlvl.burst],
              ...Object.fromEntries(allElementsWithPhy.map(ele => [`${ele}_res_`, -data.burst.resDec[stats.tlvl.burst]]))
            }),
            fields: [{
              text: tr("burst.skillParams.0"),
              formulaText: stats => <span>{data.burst.defConv[stats.tlvl.burst]}% {Stat.printStat("finalDEF", stats, true)}</span>,
              formula: formula.burst.defConv,
            }, {
              text: tr("burst.skillParams.2"),
              value: data.burst.duration,
              unit: "s"
            }]
          }
        }],
      },
      passive1: {
        name: tr("passive1.name"),
        img: passive1,
        sections: [{
          text: tr("passive1.description"),
          conditional: {
            key: "a1",
            canShow: stats => stats.ascension >= 1,
            name: charTr("a1.name"),
            maxStack: 3,
            stats: {
              atkSPD_: 10
            }
          },
        }],
      },
      passive2: talentTemplate("passive2", tr, passive2),
      passive3: talentTemplate("passive3", tr, passive3),
      constellation1: talentTemplate("constellation1", tr, c1),
      constellation2: talentTemplate("constellation2", tr, c2),
      constellation3: talentTemplate("constellation3", tr, c3, "skillBoost"),
      constellation4: {
        name: tr("constellation4.name"),
        img: c4,
        sections: [{
          text: tr("constellation4.description"),
          conditional: {
            key: "c4",
            canShow: stats => stats.constellation >= 4,
            partyBuff: "partyActive",
            header: conditionalHeader("constellation4", tr, c4),
            description: tr("constellation4.description"),
            name: charTr("c4.name"),
            stats: {
              def_: data.constellation4.def_,
              atk_: data.constellation4.atk_,
            },
            fields: [{
              text: sgt("duration"),
              value: data.constellation4.duration,
              unit: "s"
            }]
          }
        }]
      },
      constellation5: talentTemplate("constellation5", tr, c5, "burstBoost"),
      constellation6: {
        name: tr("constellation6.name"),
        img: c6,
        sections: [{
          text: stats => stats.constellation < 6 ? tr("constellation6.description") :
            <span>
              {tr("constellation6.description")}
              <Typography color="warning.main">This skill needs more system changes before it can be implemented.</Typography>
            </span>,
        }],
      },
    },
  },
};
export default char;
