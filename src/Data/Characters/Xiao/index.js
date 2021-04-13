import card from './Character_Xiao_Card.jpg'
import thumb from './Character_Xiao_Thumb.png'
import c1 from './Constellation_Dissolution_Eon_-_Destroyer_of_Worlds.png'
import c2 from './Constellation_Annihilation_Eon_-_Blossom_of_Kaleidos.png'
import c3 from './Constellation_Conqueror_of_Evil_-_Wrath_Deity.png'
import c4 from './Constellation_Transcension_-_Extinction_of_Suffering.png'
import c5 from './Constellation_Evolution_Eon_-_Origin_of_Ignorance.png'
import c6 from './Constellation_Conqueror_of_Evil_-_Guardian_Yaksha.png'
import normal from './Talent_Whirlwind_Thrust.png'
import skill from './Talent_Lemniscatic_Wind_Cycling.png'
import burst from './Talent_Bane_of_All_Evil.png'
import passive1 from './Talent_Evil_Conqueror_-_Tamer_of_Demons.png'
import passive2 from './Talent_Dissolution_Eon_-_Heaven_Fall.png'
import passive3 from './Talent_Transcension_-_Gravity_Defier.png'
import Stat from '../../../Stat'
import DisplayPercent from '../../../Components/DisplayPercent'
import formula, { data } from './data'
import { getTalentStatKey, getTalentStatKeyVariant } from "../../../Build/Build"

const char = {
  name: "Xiao",
  cardImg: card,
  thumbImg: thumb,
  star: 5,
  elementKey: "anemo",
  weaponTypeKey: "polearm",
  gender: "M",
  constellationName: "Alatus Nemeseos",
  titles: ["Vigilant Yaksha", "Guardian Yaksha", "Nuo Dance of Evil Conquering", "Alatus, the Golden-Winged King", "Conqueror of Demons"],
  baseStat: data.baseStat,
  specializeStat: data.specializeStat,
  formula,
  talent: {
    auto: {
      name: "Whirlwind Thrust",
      img: normal,
      infusable: true,
      document: [{
        text: <span><strong>Normal Attack</strong> Performs up to 6 consecutive spear strikes.</span>,
        fields: data.normal.hitArr.map((percentArr, i) =>
        ({
          text: `${i + 1}-Hit DMG`,
          formulaText: stats => <span>{percentArr[stats.tlvl.auto]}%{(i === 0 || i === 3) ? " × 2" : ""} {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
          formula: formula.normal[i],
          variant: stats => getTalentStatKeyVariant("normal", stats),
        }))
      }, {
        text: <span><strong>Charged Attack</strong> Consumes a certain amount of Stamina to perform an upward thrust.</span>,
        fields: [{
          text: `Charged Attack DMG`,
          formulaText: stats => <span>{data.charged.hit[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
          formula: formula.charged.hit,
          variant: stats => getTalentStatKeyVariant("charged", stats),
        }, {
          text: `Stamina Cost`,
          value: 25,
        }]
      }, {
        text: <span><strong>Plunging Attack</strong> Plunges from mid-air to strike the ground from below, damaging opponents along the path and dealing AoE DMG upon impact. Xiao does not take DMG from performing Plunging Attacks.</span>,
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
      }],
    },
    skill: {
      name: "Lemniscatic Wind Cycling",
      img: skill,
      document: [{
        text: <span>
          <p className="mb-2">Xiao lunges forward, dealing <span className="text-anemo">Anemo DMG</span> to opponents in his path.</p>
          <p className="mb-2">Can be used in mid-air.<br />Starts with 2 charges.</p>
        </span>,
        fields: [{
          text: "Skill DMG",
          formulaText: stats => <span>{data.skill.hit[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.hit,
          variant: stats => getTalentStatKeyVariant("skill", stats),
        }, {
          text: "CD",
          value: "10s",
        }, {
          text: "Charges",
          value: stats => stats.constellation >= 1 ? "2 + 1" : `2`,
        }]
      }],
    },
    burst: {
      name: "Bane of All Evil",
      img: burst,
      document: [{
        text: <span>
          <p className="mb-2">Xiao dons the Yaksha Mask that set gods and demons trembling millennia ago.</p>
          <p className="mb-2"><b>Yaksha's Mask:</b></p>
          <ul className="mb-2">
            <li>Greatly increases Xiao's jumping ability.</li>
            <li>Increases his attack AoE and attack DMG.</li>
            <li>Converts attack DMG into <span className="text-anemo">Anemo DMG</span>, which cannot be overriden by any other elemental infusion.</li>
          </ul>
          <p className="mb-2">In this state, Xiao will continuously lose HP.<br />The effects of this skill end when Xiao leaves the field.</p>
        </span>,
        fields: [{
          text: "Normal/Charged/Plunging Attack DMG Bonus",
          value: stats => <span>{data.burst.atk_bonus[stats.tlvl.burst]}%</span>,
        }, {
          text: "Duration",
          value: "15s",
        }, {
          text: "CD",
          value: "18s",
        }, {
          text: "Energy Cost",
          value: 70,
        }],
        conditional: stats => ({
          type: "character",
          conditionalKey: "BaneOfAllEvil",
          condition: "Bane of All Evil",
          sourceKey: "xiao",
          maxStack: 1,
          stats: {
            normal_dmg_: data.burst.atk_bonus[stats.tlvl.burst],
            charged_dmg_: data.burst.atk_bonus[stats.tlvl.burst],
            plunging_dmg_: data.burst.atk_bonus[stats.tlvl.burst],
          }
        })
      }],
    },
    passive1: {
      name: "Evil Conqueror - Tamer of Demons",
      img: passive1,
      document: [{
        text: <span>While under the effects of <b>Bane of All Evil</b>, all DMG dealt by Xiao increases by 5%. DMG increases by a further 5% for every 3s the ability persists. The maximum DMG Bonus is 25%.</span>,
        conditional: stats => stats.ascension >= 1 && {
          type: "character",
          conditionalKey: "TamerofDemons",
          condition: "Tamer of Demons",
          sourceKey: "xiao",
          maxStack: 5,
          stats: {
            dmg_: 5,
          }
        }
      }],
    },
    passive2: {
      name: "Dissolution Eon - Heaven Fall",
      img: passive2,
      document: [{
        text: <span>Using <b>Lemniscatic Wind Cycling</b> increases the DMG of subsequent uses of Lemniscatic Wind Cycling by 15%. This effect lasts for 7s, and has a maximum of 3 stacks. Gaining a new stack refreshes the effect's duration.</span>,
        conditional: stats => stats.ascension >= 1 && {
          type: "character",
          conditionalKey: "HeavenFall",
          condition: "Heaven Fall",
          sourceKey: "xiao",
          maxStack: 3,
          stats: {
            skill_dmg_: 15,
          }
        }
      }],
    },
    passive3: {
      name: "Transcension - Gravity Defier",
      img: passive3,
      document: [{
        text: <span>Decreases climbing Stamina consumption for your own party members by 20%.<br />Not stackable with Passive Talents that provide the exact same effects.</span>
      }],
    },
    constellation1: {
      name: "Dissolution Eon: Destroyer of Worlds",
      img: c1,
      document: [{ text: <span>Increases <b>Lemniscatic Wind Cycling</b>'s charges by 1.</span> }],
    },
    constellation2: {
      name: "Annihilation Eon: Blossom of Kaleidos",
      img: c2,
      document: [{
        text: <span>When in party but not on the field, Xiao's Energy Recharge is increased by 25%.</span>,
        conditional: stats => stats.constellation >= 2 && {
          type: "character",
          conditionalKey: "BlossomofKaleidos",
          condition: "Blossom of Kaleidos",
          sourceKey: "xiao",
          maxStack: 1,
          stats: {
            enerRech_: 25,
          }
        }
      }],
    },
    constellation3: {
      name: "Conqueror of Evil: Wrath Deity",
      img: c3,
      document: [{ text: <span>Increases the Level of <b>Lemniscatic Wind Cycling</b> by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { skill: 3 }
    },
    constellation4: {
      name: "Transcension: Extinction of Suffering",
      img: c4,
      document: [{
        text: stats => <span>When Xiao's HP falls below 50%{DisplayPercent(50, stats, "finalHP")}, he gains a 100% DEF Bonus.</span>,
        conditional: stats => stats.constellation >= 4 && {
          type: "character",
          conditionalKey: "ExtinctionofSuffering",
          condition: "Extinction of Suffering",
          sourceKey: "xiao",
          maxStack: 1,
          stats: {
            def_: 100,
          }
        }
      }],
    },
    constellation5: {
      name: "Evolution Eon: Origin of Ignorance",
      img: c5,
      document: [{ text: <span>Increases the Level of <b>Bane of All Evil</b> by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { burst: 3 }
    },
    constellation6: {
      name: "Conqueror of Evil: Guardian Yaksha",
      img: c6,
      document: [{ text: <span>While under the effects of <b>Bane of All Evil</b>, hitting at least 2 opponents with Xiao's Plunging Attack will immediately grant him 1 charge of <b>Lemniscatic Wind Cycling</b> and for the next 1s, he may use Lemniscatic Wind Cycling while ignoring its CD.</span> }],
    }
  },
};
export default char;
