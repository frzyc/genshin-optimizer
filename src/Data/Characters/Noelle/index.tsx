import card from './Character_Noelle_Card.jpg'
import thumb from './Character_Noelle_Thumb.png'
import c1 from './Constellation_I_Got_Your_Back.png'
import c2 from './Constellation_Combat_Maid.png'
import c3 from './Constellation_Invulnerable_Maid.png'
import c4 from './Constellation_To_Be_Cleaned.png'
import c5 from './Constellation_Favonius_Sweeper_Master.png'
import c6 from './Constellation_Must_Be_Spotless.png'
import normal from './Talent_Favonius_Bladework_-_Maid.png'
import skill from './Talent_Breastplate.png'
import burst from './Talent_Sweeping_Time.png'
import passive1 from './Talent_Devotion.png'
import passive2 from './Talent_Nice_and_Clean.png'
import passive3 from './Talent_Maid\'s_Knighthood.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'
import { IConditionals } from '../../../Types/IConditional'
import { ICharacterSheet } from '../../../Types/character'
import { Translate } from '../../../Components/Translate'
const tr = (strKey: string) => <Translate ns="char_noelle" key18={strKey} />
const conditionals: IConditionals = {
  q: { // Sweeping Time
    name: "Sweeping Time",
    maxStack: 1,
    stats: stats => ({
      modifiers: { finalATK: { finalDEF: (data.burst.bonus[stats.tlvl.burst] + (stats.constellation >= 6 ? 50 : 0)) / 100 } },
      infusionSelf: "geo",
    }),
    fields: [{ text: "Larger attack AOE" }]
  }
}
const char: ICharacterSheet = {
  name: "Noelle",
  cardImg: card,
  thumbImg: thumb,
  star: 4,
  elementKey: "geo",
  weaponTypeKey: "claymore",
  gender: "F",
  constellationName: tr("constellationName"),
  titles: ["Chivalric Blossom", "Maid of Favonius"],
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
          text: `${i + 1}-Hit DMG`,
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
          text: "Skill DMG",
          formulaText: stats => <span>{data.skill.skill_dmg[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats) + "_multi", stats)} * {Stat.printStat("finalDEF", stats)}</span>,
          formula: formula.skill.skill_dmg,
          variant: stats => getTalentStatKeyVariant("skill", stats),
        }, {
          text: "Shield DMG Absorption",
          formulaText: stats => <span>( {data.skill.shield_def[stats.tlvl.skill]}% {Stat.printStat("finalDEF", stats)} + {data.skill.shield_flat[stats.tlvl.skill]} ) * (100% + {Stat.printStat("powShield_", stats)}) * 150% All DMG Absorption</span>,
          formula: formula.skill.shield,
        }, {
          text: "Healing",
          formulaText: stats => <span>( {data.skill.heal_def[stats.tlvl.skill]}% {Stat.printStat("finalDEF", stats)} + {data.skill.heal_flat[stats.tlvl.skill]} ) * {Stat.printStat("heal_multi", stats)}</span>,
          formula: formula.skill.heal,
          variant: "success"
        }, {
          text: "Trigger Chance",
          value: stats => <span>{data.skill.heal_trigger[stats.tlvl.skill]}%{stats.constellation >= 1 ? <span> (100% while <b>Sweeping Time</b> and <b>Breastplate</b> are both in effect)</span> : ""}</span>,
        }, {
          text: "Duration",
          value: "12s",
        }, {
          text: "CD",
          value: stats => "24s" + (stats.ascension > 4 ? " -1s Every 4 hits" : ""),
        }],
      }],
    },
    burst: {
      name: tr("burst.name"),
      img: burst,
      document: [{
        text: tr("burst.description"),
        fields: [{
          text: "Burst DMG",
          formulaText: stats => <span>{data.burst.burst_dmg[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
          formula: formula.burst.burst_dmg,
          variant: stats => getTalentStatKeyVariant("burst", stats),
        }, {
          text: "Skill DMG",
          formulaText: stats => <span>{data.burst.skill_dmg[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
          formula: formula.burst.skill_dmg,
          variant: stats => getTalentStatKeyVariant("burst", stats),
        }, {
          text: "ATK Bonus",
          formulaText: stats => <span>{data.burst.bonus[stats.tlvl.burst]}% {stats.constellation >= 6 ? "+50% " : ""}{Stat.printStat("finalDEF", stats)}</span>,
          formula: formula.burst.bonus,
        }, {
          text: "Duration",
          value: stats => "15s" + (stats.constellation >= 6 ? " +1s per kill, up to 10s" : ""),
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
    passive1: {
      name: tr("passive1.name"),
      img: passive1,
      document: [{
        text: tr("passive1.description"),
        fields: [{
          canShow: stats => stats.ascension >= 1,
          text: "Shield Effective HP",
          formulaText: stats => <span>400% {Stat.printStat("finalDEF", stats)} * (100% + {Stat.printStat("powShield_", stats)}) * 150% All DMG Absorption</span>,
          formula: formula.passive1.hp,
        }, {
          canShow: stats => stats.ascension >= 1,
          text: "CD",
          value: "60s",
        }]
      }],
    },
    passive2: {
      name: tr("passive2.name"),
      img: passive2,
      document: [{
        text: tr("passive2.description"),
      }],
    },
    passive3: {
      name: tr("passive3.name"),
      img: passive3,
      document: [{
        text: tr("passive3.description"),
      }]
    },
    constellation1: {
      name: tr("constellation1.name"),
      img: c1,
      document: [{ text: tr("constellation1.description"), }]
    },
    constellation2: {
      name: tr("constellation2.name"),
      img: c2,
      document: [{ text: tr("constellation2.description"), }],
      stats: {
        charged_dmg_: 15,
        staminaChargedDec_: 20,
      }
    },
    constellation3: {
      name: tr("constellation3.name"),
      img: c3,
      document: [{ text: tr("constellation3.description"), }],
      stats: { skillBoost: 3 }
    },
    constellation4: {
      name: tr("constellation4.name"),
      img: c4,
      document: [{
        text: tr("constellation4.description"),
        fields: [{
          canShow: stats => stats.constellation >= 4,
          text: "Breastplate shatter damage",
          formulaText: stats => <span>400% {Stat.printStat(getTalentStatKey("elemental", stats), stats)}</span>,
          formula: formula.constellation4.dmg,
          variant: stats => getTalentStatKeyVariant("elemental", stats),
        }]
      }]
    },
    constellation5: {
      name: tr("constellation5.name"),
      img: c5,
      document: [{ text: tr("constellation5.description"), }],
      stats: { burstBoost: 3 }
    },
    constellation6: {
      name: tr("constellation6.name"),
      img: c6,
      document: [{ text: tr("constellation6.description"), }]
    }
  }
};
export default char;
