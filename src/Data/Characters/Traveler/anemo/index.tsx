import c1 from './Constellation_Raging_Vortex.png'
import c2 from './Constellation_Uprising_Whirlwind.png'
import c3 from './Constellation_Sweeping_Gust.png'
import c4 from './Constellation_Cherishing_Breezes.png'
import c5 from './Constellation_Vortex_Stellaris.png'
import c6 from './Constellation_Interwinded_Winds.png'
import normal from './Talent_Foreign_Ironwind.png'
import skill from './Talent_Palm_Vortex.png'
import burst from './Talent_Gust_Surge.png'
import passive1 from './Talent_Slitting_Wind.png'
import passive2 from './Talent_Second_Wind.png'
import Stat from '../../../../Stat'
import formula, { data } from './data'
import { getTalentStatKey, getTalentStatKeyVariant } from "../../../../Build/Build"
import { TalentSheet } from '../../../../Types/character';
import { absorbableEle } from '../../dataUtil'
import { Translate } from '../../../../Components/Translate'
import { normalDocSection, plungeDocSection, sgt, talentTemplate } from '../../SheetUtil'
import ColorText from '../../../../Components/ColoredText'
const tr = (strKey: string) => <Translate ns="char_Traveler_gen" key18={`anemo.${strKey}`} />
const talentSheet: TalentSheet = {
  formula,
  sheets: {
    auto: {
      name: tr("auto.name"),
      img: normal,
      sections: [
        normalDocSection(tr, formula, data),
        {
          text: tr(`auto.fields.charged`),
          fields: data.charged.hitArr.map((percentArr, i) =>
          ({
            text: i === 1 ? `Male Charged 2-Hit DMG` : (i === 2 ? `Female Charged 2-Hit DMG` : `Charged ${i + 1}-Hit DMG`),
            formulaText: stats => <span>{percentArr[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
            formula: formula.charged[i],
            variant: stats => getTalentStatKeyVariant("charged", stats),
          }))
        },
        plungeDocSection(tr, formula, data),
      ]
    },
    skill: {
      name: tr("skill.name"),
      img: skill,
      sections: [{
        text: tr("skill.description"),
        fields: [{
          text: "Initial Cutting DMG",
          formulaText: stats => <span>{data.skill.initial_dmg[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.initial_dmg,
          variant: stats => getTalentStatKeyVariant("skill", stats),
        }, {
          text: "Max Cutting DMG",
          formulaText: stats => <span>{data.skill.initial_max[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.initial_max,
          variant: stats => getTalentStatKeyVariant("skill", stats),
        }, {
          text: "Initial Storm DMG",
          formulaText: stats => <span>{data.skill.storm_dmg[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.storm_dmg,
          variant: stats => getTalentStatKeyVariant("skill", stats),
        }, {
          text: "Max Storm DMG",
          formulaText: stats => <span>{data.skill.storm_max[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.storm_max,
          variant: stats => getTalentStatKeyVariant("skill", stats),
        }, {
          text: "Base CD",
          value: "5s",
        }, {
          text: "Max Charging CD",
          value: "8s",
        }, {
          canShow: stats => stats.constellation >= 4,
          text: "Reduce DMG taken while casting",
          value: "10%",
        }],
      }],
    },
    burst: {
      name: tr("burst.name"),
      img: burst,
      sections: [{
        text: tr("burst.description"),
        fields: [{
          text: "Tornado DMG",
          formulaText: stats => <span>{data.burst.dmg[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
          formula: formula.burst.dmg,
          variant: stats => getTalentStatKeyVariant("burst", stats),
        }, {
          text: "Duration",
          value: "6s",
        }, {
          text: "CD",
          value: "15s",
        }, {
          text: "Energy Cost",
          value: 60,
        }],
        conditional: { // Absorption
          key: "q",
          name: "Elemental Absorption",
          states: {
            ...Object.fromEntries(absorbableEle.map(eleKey => [eleKey, {
              name: <ColorText color={eleKey}>{sgt(`element.${eleKey}`)}</ColorText>,
              fields: [{
                canShow: stats => {
                  const [num, condEleKey] = stats.conditionalValues?.character?.Traveler_anemo?.q ?? []
                  return !!num && condEleKey === eleKey
                },
                text: "Absorption DoT",
                formulaText: stats => <span>{data.burst.dmg_[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats, eleKey), stats)}</span>,
                formula: formula.burst[eleKey],
                variant: eleKey
              },],
              stats: stats => ({
                ...stats.constellation >= 6 && { anemo_enemyRes_: - 20 },
                ...stats.constellation >= 6 && { [`${eleKey}_enemyRes_`]: -20 }
              })
            }]))
          }
        },
      }],
    },
    passive1: {
      name: tr("passive1.name"),
      img: passive1,
      sections: [{
        text: tr("passive1.description"),
        fields: [{
          text: "Anemo Auto",
          formulaText: stats => <span>60% * {Stat.printStat("finalATK", stats)}</span>,
          formula: formula.passive1.windAuto,
          variant: stats => getTalentStatKeyVariant("normal", stats, "anemo"),
        }]
      }]
    },
    passive2: {
      name: tr("passive2.name"),
      img: passive2,
      sections: [{
        text: tr("passive2.description"),
        fields: [{
          text: "Heal",
          formulaText: stats => <span>2% * {Stat.printStat("finalHP", stats)} * {Stat.printStat("heal_multi", stats)}</span>,
          formula: formula.passive2.heal,
          variant: "success",
        }]
      }]
    },
    constellation1: talentTemplate("constellation1", tr, c1),
    constellation2: {
      name: tr("constellation2.name"),
      img: c2,
      sections: [{
        text: tr("constellation2.description"),
        conditional: {
          key: "c2",
          canShow: stats => stats.constellation >= 2,
          maxStack: 0,
          name: "Uprising Whirlwind",
          stats: { enerRech_: 16 }
        }
      }]
    },
    constellation3: talentTemplate("constellation3", tr, c3, "burstBoost"),
    constellation4: talentTemplate("constellation4", tr, c4),
    constellation5: talentTemplate("constellation5", tr, c5, "skillBoost"),
    constellation6: talentTemplate("constellation6", tr, c6),
  },
}
export default talentSheet