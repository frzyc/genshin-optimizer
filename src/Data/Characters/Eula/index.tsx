import card from './Character_Eula_Card.png'
import thumb from './Character_Eula_Thumb.png'
import c1 from './placeholder.png'
import c2 from './placeholder.png'
import c3 from './placeholder.png'
import c4 from './placeholder.png'
import c5 from './placeholder.png'
import c6 from './placeholder.png'
import normal from './Talent_Favonius_Bladework_-_Edel.png'
import skill from './Talent_Icetide_Vortex.png'
import burst from './Talent_Glacial_Illumination.png'
import passive1 from './placeholder.png'
import passive2 from './placeholder.png'
import passive3 from './placeholder.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'
import { IConditionals } from '../../../Types/IConditional'
import { ICharacterSheet } from '../../../Types/character'
import { Translate } from '../../../Components/Translate'
const tr = (strKey: string) => <Translate ns="char_eula_gen" key18={strKey} />
const conditionals: IConditionals = {
  e: {
    name: "Grimheart",
    states: {
      g: {//grimheart
        name: "Grimheart Stacks",
        stats: { def_: 30 },
        fields: [{
          text: "Increase resistance to interruption"
        }, {
          text: "Grimheart Duration",
          value: "18s"
        }, {
          text: "Max Stacks",
          value: 2
        }]
      },
      c: {//consumed
        name: "Grimheart Consumed",
        stats: stats => ({
          cryo_enemyRes_: -data.skill.cyroResDec[stats.tlvl.skill],
          physical_enemyRes_: -data.skill.cyroResDec[stats.tlvl.skill],
        }),
        fields: [{
          text: "RES Decrease Duration",
          value: "7s"
        }]
      }
    }
  },
  q: { // Sweeping Time
    name: "Lightfall Sword",
    states: Object.fromEntries([...Array(31).keys()].map(i =>
      [i, {
        name: i === 0 ? `Base DMG` : i === 1 ? `1 Stack` : `${i} Stacks`,
        fields: [{
          text: `Lightfall Sword ${i === 0 ? `Base DMG` : i === 1 ? `1 Stack` : `${i} Stacks`}`,
          canShow: stats => {
            if (i < 5 && stats.constellation >= 6) return false
            const [stacks, stateKey] = (stats.conditionalValues?.character?.eula?.q ?? [])
            return stacks && stateKey === i.toString()
          },
          formulaText: stats => {
            const statKey = getTalentStatKey("burst", stats, "physical")
            const increase = stats.constellation >= 4 ? "125% * " : ""
            return i === 0 ? <span>{increase}{data.burst.baseDMG[stats.tlvl.burst]}% {Stat.printStat(statKey, stats)}</span> :
              <span>{increase}( {data.burst.baseDMG[stats.tlvl.burst]}% + {i} * {data.burst.stackDMG[stats.tlvl.burst]}%) {Stat.printStat(statKey, stats)}</span>
          },
          formula: formula.burst[i],
          variant: stats => getTalentStatKeyVariant("burst", stats, "physical"),
        }, {
          text: "Starts at 5 stacks"
        }]
      }])),
  },
  c1: {
    name: <span>Consume <b>Grimheart</b> stacks</span>,
    canShow: stats => stats.constellation >= 1,
    stats: {
      physical_dmg_: 30
    },
    fields: [{
      text: "Duration",
      value: "6s + 6s per stack, up to 18s"
    }]
  }
}
const char: ICharacterSheet = {
  name: tr("name"),
  cardImg: card,
  thumbImg: thumb,
  star: 5,
  elementKey: "cryo",
  weaponTypeKey: "claymore",
  gender: "F",
  constellationName: tr("constellationName"),
  titles: [],
  baseStat: data.baseStat,
  specializeStat: data.specializeStat,
  formula,
  conditionals,
  talent: {
    auto: {
      name: tr("auto.name"),
      img: normal,
      document: [{
        text: tr("auto.fields.normal"),
        fields: data.normal.hitArr.map((percentArr, i) =>
        ({
          text: `${i + 1}-Hit DMG${i === 2 || i === 4 ? " (x2)" : ""}`,
          formulaText: stats => <span>{percentArr[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
          formula: formula.normal[i],
          variant: stats => getTalentStatKeyVariant("normal", stats),
        }))
      }, {
        text: tr("auto.fields.charged"),
        fields: [{
          text: `Spinning DMG`,
          formulaText: stats => <span>{data.charged.spinning[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
          formula: formula.charged.spinning,
          variant: stats => getTalentStatKeyVariant("charged", stats),
        }, {
          text: `Spinning Final DMG`,
          formulaText: stats => <span>{data.charged.final[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
          formula: formula.charged.final,
          variant: stats => getTalentStatKeyVariant("charged", stats),
        }, {
          text: `Stamina Cost`,
          value: `40/s`,
        }, {
          text: `Max Duration`,
          value: `5s`,
        }]
      }, {
        text: tr("auto.fields.plunging"),
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
      },],
    },
    skill: {
      name: tr("skill.name"),
      img: skill,
      document: [{
        text: tr("skill.description"),
        fields: [{
          text: "Press DMG",
          formulaText: stats => <span>{data.skill.pressDMG[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.pressDMG,
          variant: stats => getTalentStatKeyVariant("skill", stats),
        }, {
          text: "Press CD",
          value: "4s"
        }, {
          text: "Hold DMG",
          formulaText: stats => <span>{data.skill.holdDMG[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.holdDMG,
          variant: stats => getTalentStatKeyVariant("skill", stats),
        }, {
          text: "Hold CD",
          value: stats => stats.constellation >= 2 ? "4s" : "10s"
        },],
        conditional: conditionals.e
      }, {
        fields: [{
          text: "Icewhirl Brand DMG",
          formulaText: stats => <span>{data.skill.brandDMG[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.brandDMG,
          variant: stats => getTalentStatKeyVariant("skill", stats),
        }],
      }],
    },
    burst: {
      name: tr("burst.name"),
      img: burst,
      document: [{
        text: tr("burst.description"),
        fields: [{
          text: "Skill DMG",
          formulaText: stats => <span>{data.burst.dmg[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
          formula: formula.burst.dmg,
          variant: stats => getTalentStatKeyVariant("burst", stats),
        }, {
          text: "CD",
          value: "15s",
        }, {
          text: "Energy Cost",
          value: 60,
        }, {
          text: "Lightfall Sword Duration",
          value: "7s"
        }],
        conditional: conditionals.q
      }],
    },
    passive1: {
      name: tr("passive1.name"),
      img: passive1,
      document: [{
        text: tr("passive1.description"),
        fields: [{
          canShow: stats => stats.ascension >= 1,
          text: "Shattered Lightfall Sword DMG",
          formulaText: stats => <span>50% * {data.burst.baseDMG[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats, "physical"), stats)}</span>,
          formula: formula.passive1.dmg,
          variant: stats => getTalentStatKeyVariant("burst", stats, "physical")
        }]
      }],
    },
    passive2: {
      name: tr("passive2.name"),
      img: passive2,
      document: [{ text: tr("passive2.description"), }],
    },
    passive3: {
      name: tr("passive3.name"),
      img: passive3,
      document: [{ text: tr("passive3.description"), }]
    },
    constellation1: {
      name: tr("constellation1.name"),
      img: c1,
      document: [{
        text: tr("constellation1.description"),
        conditional: conditionals.c1
      }]
    },
    constellation2: {
      name: tr("constellation2.name"),
      img: c2,
      document: [{ text: tr("constellation2.description"), }]
    },
    constellation3: {
      name: tr("constellation3.name"),
      img: c3,
      document: [{ text: tr("constellation3.description"), }],
      stats: { burstBoost: 3 }
    },
    constellation4: {
      name: tr("constellation4.name"),
      img: c4,
      document: [{ text: tr("constellation4.description") }]
    },
    constellation5: {
      name: tr("constellation5.name"),
      img: c5,
      document: [{ text: tr("constellation5.description"), }],
      stats: { skillBoost: 3 }
    },
    constellation6: {
      name: tr("constellation6.name"),
      img: c6,
      document: [{ text: tr("constellation6.description"), }]
    }
  }
};
export default char;
