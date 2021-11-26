import card from './Character_Venti_Card.jpg'
import thumb from './Icon.png'
import thumbSide from './IconSide.png'
import banner from './Banner.png'
import c1 from './Constellation_Splitting_Gales.png'
import c2 from './Constellation_Breeze_of_Reminiscence.png'
import c3 from './Constellation_Ode_to_Thousand_Winds.png'
import c4 from './Constellation_Hurricane_of_Freedom.png'
import c5 from './Constellation_Concerto_dal_Cielo.png'
import c6 from './Constellation_Storm_of_Defiance.png'
import normal from './Talent_Divine_Marksmanship.png'
import skill from './Talent_Skyward_Sonnet.png'
import burst from './Talent_Wind\'s_Grand_Ode.png'
import passive1 from './Talent_Embrace_of_Winds.png'
import passive2 from './Talent_Stormeye.png'
import passive3 from './Talent_Windrider.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import data_gen from './data_gen.json'
import { getTalentStatKey, getTalentStatKeyVariant } from "../../../Build/Build"
import { ICharacterSheet } from '../../../Types/character'
import { bowChargedDocSection, conditionalHeader, plungeDocSection, sgt, st, talentTemplate } from '../SheetUtil'
import { Translate, TransWrapper } from '../../../Components/Translate'
import { absorbableEle } from '../dataUtil'
import { WeaponTypeKey } from '../../../Types/consts'
import ColorText from '../../../Components/ColoredText'
import { Typography } from '@mui/material'
const tr = (strKey: string) => <Translate ns="char_Venti_gen" key18={strKey} />

const char: ICharacterSheet = {
  name: tr("name"),
  cardImg: card,
  thumbImg: thumb,
  thumbImgSide: thumbSide,
  bannerImg: banner,
  rarity: data_gen.star,
  elementKey: "anemo",
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
        img: normal,
        sections: [{
          text: tr(`auto.fields.normal`),
          fields: data.normal.hitArr.map((percentArr, i) =>
          ({
            text: <span>{sgt(`normal.hit${i + 1}`)} {i === 0 || i === 3 ? <span>(<Translate ns="sheet" key18="hits" values={{ count: 2 }} />)</span> : null}</span>,
            formulaText: stats => <span>{percentArr[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
            formula: formula.normal[i],
            variant: stats => getTalentStatKeyVariant("normal", stats),
          }))
        }, bowChargedDocSection(tr, formula, data, "anemo"), {
          canShow: stats => stats.constellation >= 1,
          text: <strong>{tr("constellation1.name")}</strong>,
          fields: [{
            text: <Translate ns="char_Venti" key18="addAimed" />,
            formulaText: stats => <span>{(data.charged.hit[stats.tlvl.auto] * 0.33)?.toFixed(2)}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
            formula: formula.charged.hit_bonus,
            variant: stats => getTalentStatKeyVariant("charged", stats),
          }, {
            text: <Translate ns="char_Venti" key18="addFullAimed" />,
            formulaText: stats => <span>{(data.charged.full[stats.tlvl.auto] * 0.33)?.toFixed(2)}% {Stat.printStat(getTalentStatKey("charged", stats, "anemo"), stats)}</span>,
            formula: formula.charged.full_bonus,
            variant: stats => getTalentStatKeyVariant("charged", stats, "anemo"),
          }]
        }, plungeDocSection(tr, formula, data)],
      },
      skill: {
        name: tr("skill.name"),
        img: skill,
        sections: [{
          text: tr("skill.description"),
          fields: [{
            text: sgt("press.dmg"),
            formulaText: stats => <span>{data.skill.press[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.skill.press,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: sgt("press.cd"),
            value: "6s",
          }, {
            text: sgt("hold.dmg"),
            formulaText: stats => <span>{data.skill.hold[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
            formula: formula.skill.hold,
            variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
            text: sgt("hold.cd"),
            value: "15s",
          }, {
            canShow: stats => stats.ascension >= 1,
            text: <Translate ns="char_Venti" key18="upcurrentDuration" />,
            value: "20s",
          }],
          conditional: { // BreezeOfReminiscence
            key: "c2",
            header: conditionalHeader("constellation2", tr, c2),
            description: tr("constellation2.description"),
            name: tr("skill.name"),
            canShow: stats => stats.constellation >= 2,
            states: {
              hit: {
                name: <Translate ns="char_Venti" key18="c2.hit" />,
                stats: {
                  anemo_enemyRes_: -12,
                  physical_enemyRes_: -12
                },
              },
              launch: {
                name: <Translate ns="char_Venti" key18="c2.launched" />,
                stats: {
                  anemo_enemyRes_: -24,
                  physical_enemyRes_: -24
                },
              }
            }
          },
        }],
      },
      burst: {
        name: tr("burst.name"),
        img: burst,
        sections: [{
          text: tr("burst.description"),
          fields: [{
            text: sgt("dot"),
            formulaText: stats => <span>{data.burst.hit[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
            formula: formula.burst.hit,
            variant: stats => getTalentStatKeyVariant("burst", stats),
          }, {
            text: sgt("duration"),
            value: "8s",
          }, {
            text: sgt("cd"),
            value: "15s",
          }, {
            text: sgt("energyCost"),
            value: 60,
          }, {
            canShow: stats => stats.ascension >= 4,
            text: <Translate ns="char_Venti" key18="regenEner" />,
          }],
          conditional: {// Storm of defiance
            key: "c6",
            canShow: stats => stats.constellation >= 6,
            name: <Translate ns="char_Venti" key18="c6" />,
            stats: { anemo_enemyRes_: -20 }
          }
        }, {
          conditional: { // Absorption
            key: "q",
            name: st("eleAbsor"),
            states: Object.fromEntries(absorbableEle.map(eleKey => [eleKey, {
              name: <ColorText color={eleKey}>{sgt(`element.${eleKey}`)}</ColorText>,
              fields: [{
                canShow: stats => {
                  const [num, condEleKey] = stats.conditionalValues?.character?.Venti?.q ?? []
                  return !!num && condEleKey === eleKey
                },
                text: st("absorDot"),
                formulaText: stats => <span>{(data.burst.hit[stats.tlvl.burst] / 2)?.toFixed(2)}% {Stat.printStat(getTalentStatKey("burst", stats, eleKey), stats)}</span>,
                formula: formula.burst[eleKey],
                variant: eleKey
              }, {
                canShow: stats => stats.ascension >= 4,
                text: <Translate ns="char_Venti" key18="q" />,
              }],
              stats: stats => ({
                ...stats.constellation >= 6 && { [`${eleKey}_enemyRes_`]: -20 }
              })
            }]))
          },
        }, {
          canShow: stats => Boolean(stats.conditionalValues?.character?.Venti?.q),
          text: stats => {
            const [num, eleKey] = stats.conditionalValues?.character?.Venti?.q ?? []
            if (!num) return ""
            return <TransWrapper ns="char_Venti" key18="fullBurstDMG.text"><span>
              <Typography variant="h6">Full Elemental Burst DMG</Typography>
              <Typography gutterBottom>This calculates the total Elemental Burst DMG, including swirl. This calculation assumes:</Typography>
              <Typography component="div">
                <ul>
                  <li>20 ticks of <ColorText color="anemo">Burst DMG</ColorText></li>
                  <li>15 ticks of <ColorText color={eleKey}>absorption DMG</ColorText></li>
                  <li>7 ticks of <ColorText color={eleKey}>Swirl</ColorText>, for one enemy, OR,</li>
                  <li>14 ticks of <ColorText color={eleKey}>Swirl</ColorText>, for multiple enemy, that Swirls eachother.</li>
                </ul>
              </Typography>
            </span></TransWrapper>
          },
          fields: absorbableEle.flatMap(eleKey => ([7, 14].map(swirlTicks => ({
            canShow: stats => {
              const [num, condEleKey] = stats.conditionalValues?.character?.Venti?.q ?? []
              return !!num && condEleKey === eleKey
            },
            text: <TransWrapper ns="char_Venti" key18="fullBurstDMG.dmg" values={{ swirlTicks }}><span>Total DMG (<span className={`text-${eleKey}`}>{{ swirlTicks }} Swirl ticks</span>)</span></TransWrapper>,
            formula: formula.burst[`${eleKey}_tot_${swirlTicks}`],
            formulaText: stats => <span>20 * {data.burst.hit[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)} + 15 * {(data.burst.hit[stats.tlvl.burst] / 2)?.toFixed(2)}% {Stat.printStat(`${eleKey}_burst_${stats.hitMode}`, stats)} + {swirlTicks} * {Stat.printStat(`${eleKey}_swirl_hit`, stats)}</span>
          }))))
        }],
      },
      passive1: talentTemplate("passive1", tr, passive1),
      passive2: talentTemplate("passive2", tr, passive2),
      passive3: {
        name: tr("passive3.name"),
        img: passive3,
        sections: [{
          text: tr("passive3.description"),
          conditional: {
            key: "pas",
            maxStack: 0,
            stats: { staminaGlidingDec_: 20 }
          }
        }],
      },
      constellation1: talentTemplate("constellation1", tr, c1),
      constellation2: talentTemplate("constellation2", tr, c2),
      constellation3: talentTemplate("constellation3", tr, c3, "burstBoost"),
      constellation4: {
        name: tr("constellation4.name"),
        img: c4,
        sections: [{
          text: tr("constellation4.description"),
          conditional: { // HurricaneOfFreedom
            key: "c4",
            canShow: stats => stats.constellation >= 4,
            name: <Translate ns="char_Venti" key18="c4" />,
            stats: { anemo_dmg_: 25 },
            fields: [{
              text: sgt("duration"),
              value: "10s",
            }]
          },
        }],
      },
      constellation5: talentTemplate("constellation5", tr, c5, "skillBoost"),
      constellation6: talentTemplate("constellation6", tr, c6),
    },
  },
};
export default char;
