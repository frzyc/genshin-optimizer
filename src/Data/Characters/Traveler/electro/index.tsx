import c1 from './Constellation_Spring_Thunder_of_Fertility.png'
import c2 from './Constellation_Violet_Vehemence.png'
import c3 from './Constellation_Distant_Crackling.png'
import c4 from './Constellation_Fickle_Cloudstrike.png'
import c5 from './Constellation_Clamor_in_the_Wilds.png'
import c6 from './Constellation_World-Shaker.png'
import normal from './Talent_Foreign_Thundershock.png'
import skill from './Talent_Lightning_Blade.png'
import burst from './Talent_Bellowing_Thunder.png'
import passive1 from './Talent_Thunderflash.png'
import passive2 from './Talent_Resounding_Roar.png'
import Stat from '../../../../Stat'
import formula, { data } from './data'
import { getTalentStatKey, getTalentStatKeyVariant } from "../../../../Build/Build"
import { TalentSheet } from '../../../../Types/character';
import { Translate } from '../../../../Components/Translate'
import { conditionalHeader, normalDocSection, plungeDocSection, sgt, talentTemplate } from '../../SheetUtil'
import { KeyPath } from '../../../../Util/KeyPathUtil'
import { FormulaPathBase } from '../../../formula'
const path = KeyPath<FormulaPathBase, any>().character.Traveler.electro
const tr = (strKey: string) => <Translate ns="char_Traveler_gen" key18={`electro.${strKey}`} />
const charTr = (strKey: string) => <Translate ns="char_Traveler" key18={`electro.${strKey}`} />
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
          text: "Skill DMG",
          formulaText: stats => <span>{data.skill.dmg[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.dmg,
          variant: stats => getTalentStatKeyVariant("skill", stats),
        }, {
          text: "Number of Abundance Amulets",
          value: stats => stats.constellation < 1 ? 2 : 3
        }, {
          text: "CD",
          value: "13.5s",
        }],
        conditional: {
          key: "e",
          name: charTr("skill.absorb"),
          partyBuff: "partyAll",
          header: conditionalHeader("skill", tr, skill),
          description: tr("skill.description"),
          stats: {
            modifiers: { enerRech_: [path.skill.enerRechInc()] },
          },
          fields: [{
            text: tr("skill.enerRegen"),
            value: stats => {
              if (stats.constellation < 4) return data.skill.enerRegen[stats.tlvl.skill]
              return <span>{data.skill.enerRegen[stats.tlvl.skill]} / {data.skill.enerRegen[stats.tlvl.skill] * 2}</span>
            }
          }, {
            text: tr("skill.enerRechInc"),
            formulaText: stats => {
              if (stats.ascension < 4) return <span>20%</span>;
              return <span>20% + ( 10% * {Stat.printStat("enerRech_", stats, true)} )</span>
            },
            formula: formula.skill.enerRechInc,
            unit: "%",
            fixed: 1
          }, {
            text: sgt("duration"),
            value: "6s"
          }]
        },
      }],
    },
    burst: {
      name: tr("burst.name"),
      img: burst,
      sections: [{
        text: tr("burst.description"),
        fields: [{
          text: sgt("burstDMG"),
          formulaText: stats => <span>{data.burst.dmg[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
          formula: formula.burst.dmg,
          variant: stats => getTalentStatKeyVariant("burst", stats),
        }, {
          text: tr("burst.thunderDMG"),
          formulaText: stats => <span>{data.burst.thunder[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
          formula: formula.burst.thunder,
          variant: stats => getTalentStatKeyVariant("burst", stats),
        }, {
          canShow: stats => stats.constellation >= 6,
          text: charTr("burst.3rd"),
          formulaText: stats => <span>( {data.burst.thunder[stats.tlvl.burst]}% + 100% ) {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
          formula: formula.burst.thunder3,
          variant: stats => getTalentStatKeyVariant("burst", stats),
        }, {
          text: tr("skill.enerRegen"),
          value: stats => {
            if (stats.constellation < 6) return data.burst.enerRegen[stats.tlvl.burst]
            return <span>{data.burst.enerRegen[stats.tlvl.burst]} (+1)</span>
          }
        }, {
          text: sgt("duration"),
          value: "12s",
        }, {
          text: sgt("cd"),
          value: "20s",
        }, {
          text: sgt("energyCost"),
          value: 80,
        }],
        conditional: {
          key: "c2",
          canShow: stats => stats.constellation >= 2,
          name: charTr("c2.thunderHit"),
          stats: {
            electro_enemyRes_: -15
          }
        }
      }],
    },
    passive1: talentTemplate("passive1", tr, passive1),
    passive2: talentTemplate("passive2", tr, passive2),
    constellation1: {
      name: tr("constellation1.name"),
      img: c1,
      sections: [{
        text: tr("constellation1.description"),
      }]
    },
    constellation2: talentTemplate("constellation2", tr, c2),
    constellation3: talentTemplate("constellation3", tr, c3, "burstBoost"),
    constellation4: talentTemplate("constellation4", tr, c4),
    constellation5: talentTemplate("constellation5", tr, c5, "skillBoost"),
    constellation6: talentTemplate("constellation6", tr, c6),
  },
}

export default talentSheet;