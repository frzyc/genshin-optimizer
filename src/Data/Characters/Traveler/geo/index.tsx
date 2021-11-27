import c1 from './Constellation_Invincible_Stonewall.png'
import c2 from './Constellation_Rockcore_Meltdown.png'
import c3 from './Constellation_Will_of_the_Rock.png'
import c4 from './Constellation_Reaction_Force.png'
import c5 from './Constellation_Meteorite_Impact.png'
import c6 from './Constellation_Everlasting_Boulder.png'
import normal from './Talent_Foreign_Rockblade.png'
import skill from './Talent_Starfell_Sword.png'
import burst from './Talent_Wake_of_Earth.png'
import passive1 from './Talent_Shattered_Darkrock.png'
import passive2 from './Talent_Frenzied_Rockslide.png'
import Stat from '../../../../Stat'
import formula, { data } from './data'
import { getTalentStatKey, getTalentStatKeyVariant } from "../../../../Build/Build"
import { TalentSheet } from '../../../../Types/character';
import { Translate } from '../../../../Components/Translate'
import { conditionalHeader, normalDocSection, plungeDocSection, talentTemplate } from '../../SheetUtil'
const tr = (strKey: string) => <Translate ns="char_Traveler_gen" key18={`geo.${strKey}`} />
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
          canShow: stats => stats.constellation >= 2,
          text: "Meteorite Explosion DMG",
          formulaText: stats => <span>{data.skill.dmg[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.exp,
          variant: stats => getTalentStatKeyVariant("skill", stats),
        }, {
          text: "Base CD",
          value: stats => stats.ascension >= 1 ? "6s" : "8s",
        }, {
          text: "Meteorite Duration",
          value: stats => stats.ascension >= 6 ? "40s" : "30s",
        }],
      }],
    },
    burst: {
      name: tr("burst.name"),
      img: burst,
      sections: [{
        text: tr("burst.description"),
        fields: [{
          text: "DMG Per Shockwave",
          formulaText: stats => <span>{data.burst.dmg[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
          formula: formula.burst.dmg,
          variant: stats => getTalentStatKeyVariant("burst", stats),
        }, {
          text: "Stonewall Duration",
          value: stats => stats.constellation >= 6 ? "20s" : "15s",
        }, {
          text: "CD",
          value: "15s",
        }, {
          text: "Energy Cost",
          value: 60,
        }],
      }],
    },
    passive1: talentTemplate("passive1", tr, passive1),
    passive2: {
      name: tr("passive2.name"),
      img: passive2,
      sections: [{
        text: tr("passive2.description"),
        fields: [{
          text: "Geo Auto",
          formulaText: stats => <span>60% * {Stat.printStat("finalATK", stats)}</span>,
          formula: formula.passive2.geoAuto,
          variant: stats => getTalentStatKeyVariant("normal", stats, "geo"),
        }]
      }]
    },
    constellation1: {
      name: tr("constellation1.name"),
      img: c1,
      sections: [{
        text: tr("constellation1.description"),
        conditional: { // InvincibleStonewall
          key: "c1",
          canShow: stats => stats.constellation >= 1,
          partyBuff: "partyActive",
          header: conditionalHeader("constellation1", tr, c1),
          description: tr("constellation1.description"),
          name: <span>Party members within the radius of <b>Wake of Earth</b>.</span>,
          stats: { critRate_: 10 },
          fields: [{
            text: "Increased resistance against interruption"
          }]
        }
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