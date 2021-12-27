import card from './Character_Gorou_Card.jpg'
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
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'
import { ICharacterSheet } from '../../../Types/character'
import { Translate } from '../../../Components/Translate'
import { bowChargedDocSection, conditionalHeader, normalSrc, plungeDocSection, sgt, st, talentTemplate } from '../SheetUtil'
import { WeaponTypeKey } from '../../../Types/consts'
import { Typography } from '@mui/material'
const tr = (strKey: string) => <Translate ns="char_Gorou_gen" key18={strKey} />
const charTr = (strKey: string) => <Translate ns="char_Gorou" key18={strKey} />
const char: ICharacterSheet = {
  name: tr("name"),
  cardImg: card,
  thumbImg: thumb,
  thumbImgSide: thumbSide,
  bannerImg: banner,
  rarity: data_gen.star,
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
    sheets: {
      auto: {
        name: tr("auto.name"),
        img: normalSrc(data_gen.weaponTypeKey as WeaponTypeKey),
        sections: [{
          text: tr("auto.fields.normal"),
          fields: data.normal.hitArr.map((percentArr, i) =>
          ({
            text: <span>{sgt(`normal.hit${i + 1}`)} {i === 2 ? <span>(<Translate ns="sheet" key18="hits" values={{ count: 2 }} />)</span> : ""}</span>,
            formulaText: stats => <span>{percentArr[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
            formula: formula.normal[i],
            variant: stats => getTalentStatKeyVariant("normal", stats),
          }))
        },
        bowChargedDocSection(tr, formula, data, "geo"),
        plungeDocSection(tr, formula, data)],
      },
      skill: {
        name: tr("skill.name"),
        img: skill,
        sections: [{
          text: tr("skill.description"),
          fields: [{
            text: tr("skill.skillParams.0"),
            canShow: stats => stats.ascension < 4,
            formulaText: stats => <span>{data.skill.dmg[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.skill.dmg,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: tr("skill.skillParams.0"),
            canShow: stats => stats.ascension >= 4,
            formulaText: stats => <span>( {data.skill.dmg[stats.tlvl.skill]}% {Stat.printStat("finalATK", stats)} + {data.passive2.skill_def_}% {Stat.printStat("finalDEF", stats)} ) * {Stat.printStat(getTalentStatKey("skill", stats) + "_multi", stats)}</span>,
            formula: formula.skill.dmgA4,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: tr("skill.skillParams.3"),
            value: data.skill.duration,
          }, {
            text: tr("skill.skillParams.4"),
            value: data.skill.cd,
            unit: "s"
          },],
          conditional: {
            key: "e",
            partyBuff: "partyActive",
            header: conditionalHeader("skill", tr, skill),
            description: tr("skill.description"),
            name: charTr("e.name"),
            states: {
              g1: {
                name: charTr("e.g1"),
                stats: stats => ({
                  def: data.skill.def_[stats.tlvl.skill]
                })
              },
              g2: {
                name: charTr("e.g2"),
                stats: stats => ({
                  def: data.skill.def_[stats.tlvl.skill]
                }),
                fields: [{
                  text: st("incInterRes"),
                }],
              },
              g3: {
                name: charTr("e.g3"),
                stats: stats => ({
                  def: data.skill.def_[stats.tlvl.skill],
                  geo_dmg_: data.skill.geo_dmg_[stats.tlvl.skill],
                }),
                fields: [{
                  text: st("incInterRes"),
                }],
              },
            }
          }
        }],
      },
      burst: {
        name: tr("burst.name"),
        img: burst,
        sections: [{
          text: tr("burst.description"),
          fields: [{
            text: tr("burst.skillParams.0"),
            formulaText: stats => <span>{stats.ascension >= 4 ? `( ${data.burst.dmg[stats.tlvl.skill]}% + ${data.passive2.burst_def_}% )` : `${data.burst.dmg[stats.tlvl.skill]}%`} {Stat.printStat("finalDEF", stats)} * {Stat.printStat(getTalentStatKey("burst", stats) + "_multi", stats)}</span>,
            formula: formula.burst.dmg,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            text: tr("burst.skillParams.1"),
            formulaText: stats => <span>{stats.ascension >= 4 ? `( ${data.burst.dmgCollapse[stats.tlvl.skill]}% + ${data.passive2.burst_def_}% )` : `${data.burst.dmgCollapse[stats.tlvl.skill]}%`} {Stat.printStat("finalDEF", stats)} * {Stat.printStat(getTalentStatKey("burst", stats) + "_multi", stats)}</span>,
            formula: formula.burst.dmgCollapse,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            text: tr("burst.skillParams.2"),
            value: data.burst.duration,
            unit: "s"
          }, {
            text: tr("burst.skillParams.3"),
            value: data.burst.cd,
            unit: "s"
          }, {
            text: tr("burst.skillParams.4"),
            value: data.burst.cost,
          },],
          conditional: {
            key: "a1",
            partyBuff: "partyAll",
            header: conditionalHeader("passive1", tr, passive1),
            description: tr("passive1.description"),
            name: charTr("a1.name"),
            stats: { def_: data.passive1.def_ },
            fields: [{
              text: sgt("duration"),
              value: data.passive1.duration,
              unit: "s"
            }]
          }
        }],
      },
      passive1: talentTemplate("passive1", tr, passive1),
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
          fields: [{
            text: sgt("healing"),
            formulaText: stats => <span>{data.constellation4.heal_def_}% {Stat.printStat("finalDEF", stats)} * {Stat.printStat("heal_multi", stats)}</span>,
            formula: formula.constellation4.heal,
            variant: "success"
          }]
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