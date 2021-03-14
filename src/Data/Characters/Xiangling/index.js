import card from './Character_Xiangling_Card.jpg'
import thumb from './Character_Xiangling_Thumb.png'
import c1 from './Constellation_Crispy_Outside,_Tender_Inside.png'
import c2 from './Constellation_Oil_Meets_Fire.png'
import c3 from './Constellation_Deepfry.png'
import c4 from './Constellation_Slowbake.png'
import c5 from './Constellation_Guoba_Mad.png'
import c6 from './Constellation_Condensed_Pyronado.png'
import normal from './Talent_Dough-Fu.png'
import skill from './Talent_Guoba_Attack.png'
import burst from './Talent_Pyronado.png'
import passive1 from './Talent_Crossfire.png'
import passive2 from './Talent_Beware,_It\'s_Super_Hot.png'
import passive3 from './Talent_Chef_de_Cuisine.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'

const char = {
  name: "Xiangling",
  cardImg: card,
  thumbImg: thumb,
  star: 4,
  elementKey: "pyro",
  weaponTypeKey: "polearm",
  gender: "F",
  constellationName: "Trulla",
  titles: ["Exquisite Delicacy", "Chef de Cuisine"],
  baseStat: data.baseStat,
  specializeStat: data.specializeStat,
  formula,
  talent: {
    auto: {
      name: "Dough-Fu",
      img: normal,
      infusable: false,
      document: [{
        text: <span><strong>Normal Attack</strong> Performs up to five consecutive spear strikes. <small><i>Note: the 3th attack hits twice, the 4th hits four times.</i></small></span>,
        fields: data.normal.hitArr.map((percentArr, i) =>
        ({
          text: `${i + 1}-Hit DMG`,
          formulaText: (tlvl, stats) => <span>{i === 2 ? "2 × " : i === 3 ? "4 × " : ""}{percentArr[tlvl]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
          formula: formula.normal[i],
          variant: (tlvl, stats) => getTalentStatKeyVariant("normal", stats),
        }))
      }, {
        text: <span><strong>Charged Attack</strong> Consumes a certain amount of Stamina to lunge forward, dealing damage to opponents along the way.</span>,
        fields: [{
          text: `Charged Attack`,
          formulaText: (tlvl, stats) => <span>{data.charged.dmg[tlvl]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
          formula: formula.charged.dmg,
          variant: (tlvl, stats) => getTalentStatKeyVariant("charged", stats),
        }, {
          text: `Stamina Cost`,
          value: 25,
        }]
      }, {
        text: <span><strong>Plunging Attack</strong> Plunges from mid-air to strike the ground below, damaging opponents along the path and dealing AoE DMG upon impact.</span>,
        fields: [{
          text: `Plunge DMG`,
          formulaText: (tlvl, stats) => <span>{data.plunging.dmg[tlvl]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
          formula: formula.plunging.dmg,
          variant: (tlvl, stats) => getTalentStatKeyVariant("plunging", stats),
        }, {
          text: `Low Plunge DMG`,
          formulaText: (tlvl, stats) => <span>{data.plunging.low[tlvl]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
          formula: formula.plunging.low,
          variant: (tlvl, stats) => getTalentStatKeyVariant("plunging", stats),
        }, {
          text: `High Plunge DMG`,
          formulaText: (tlvl, stats) => <span>{data.plunging.high[tlvl]}% {Stat.printStat(getTalentStatKey("plunging", stats), stats)}</span>,
          formula: formula.plunging.high,
          variant: (tlvl, stats) => getTalentStatKeyVariant("plunging", stats),
        }]
      }],
    },
    skill: {
      name: "Guoba Attack",
      img: skill,
      document: [{
        text: <span>
          <p className="mb-2">Summons Guoba the Panda. Guoba continuously breathes fire at opponents, dealing <span className="text-pyro">AoE Pyro DMG</span>.</p>
        </span>,
        fields: [{
          text: "Flame DMG",
          formulaText: (tlvl, stats, c) => <span>{data.skill.dmg[tlvl]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.dmg,
          variant: (tlvl, stats) => getTalentStatKeyVariant("skill", stats),
        }, {
          text: "CD",
          value: "12s",
        }],
        conditional: (tlvl, c) => c >= 1 && {
          type: "character",
          conditionalKey: "CrispyOutsideTenderInside",
          condition: "Opponents hit by Gouba",
          sourceKey: "xiangling",
          maxStack: 1,
          stats: { pyro_enemyRes_: -15 },
          fields: [{
            text: "Duration",
            value: "6s",
          }]
        }
      }],
    },
    burst: {
      name: "Pyronado",
      img: burst,
      document: [{
        text: <span>
          <p className="mb-2">Displaying her mastery over both fire and polearms, Xiangling sends a Pyronado whirling around her. The Pyronado will move with your character for the ability's duration, dealing <span className="text-pyro">Pyro DMG</span> to all opponents in its path.</p>
        </span>,
        fields: [{
          text: "1-Hit Swing DMG",
          formulaText: (tlvl, stats, c) => <span>{data.burst.hit1[tlvl]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
          formula: formula.burst.hit1,
          variant: (tlvl, stats) => getTalentStatKeyVariant("burst", stats),
        }, {
          text: "2-Hit Swing DMG",
          formulaText: (tlvl, stats, c) => <span>{data.burst.hit2[tlvl]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
          formula: formula.burst.hit2,
          variant: (tlvl, stats) => getTalentStatKeyVariant("burst", stats),
        }, {
          text: "3-Hit Swing DMG",
          formulaText: (tlvl, stats, c) => <span>{data.burst.hit3[tlvl]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
          formula: formula.burst.hit3,
          variant: (tlvl, stats) => getTalentStatKeyVariant("burst", stats),
        }, {
          text: "Pyronado DMG",
          formulaText: (tlvl, stats, c) => <span>{data.burst.dmg[tlvl]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
          formula: formula.burst.dmg,
          variant: (tlvl, stats) => getTalentStatKeyVariant("burst", stats),
        },
        (con, a) => ({
          text: "Duration",
          value: con >= 4 ? "14s" : "10s",
        }), {
          text: "CD",
          value: "20s",
        }, {
          text: "Energy Cost",
          value: 80,
        }],
        conditional: (tlvl, c) => c >= 6 && {
          type: "character",
          conditionalKey: "CondensedPyronado",
          condition: "During Pyronado",
          sourceKey: "xiangling",
          maxStack: 1,
          stats: { pyro_dmg_: 15 },//TODO: party buff
        }
      }],
    },
    passive1: {
      name: "Crossfire",
      img: passive1,
      document: [{ text: <span>Increases the flame range of Guoba by 20%.</span> }],
    },
    passive2: {
      name: "Beware, It's Super Hot!",
      img: passive2,
      document: [{
        text: <span>When Guoba Attack's effect ends, Guoba leaves a chili pepper on the spot where it disappeared. Picking up a chili pepper increases ATK by 10% for 10s.</span>,
        conditional: (tlvl, c, a) => a >= 4 && {
          type: "character",
          conditionalKey: "BewareItsSuperHot",
          condition: "Pick up chili pepper",
          sourceKey: "xiangling",
          maxStack: 1,
          stats: { atk_: 10 },//TODO: party buff
          fields: [{
            text: "Duration",
            value: "10s",
          }]
        }
      }],
    },
    passive3: {
      name: "Chef de Cuisine",
      img: passive3,
      document: [{ text: <span>When Xiangling cooks an ATK-boosting dish perfectly, she has a 12% chance to receive double the product.</span> }],
    },
    constellation1: {
      name: "Crispy Outside, Tender Inside",
      img: c1,
      document: [{ text: <span>Opponents hit by Guoba's attacks have their Pyro RES reduced by 15% for 6s.</span> }],
    },
    constellation2: {
      name: "Oil Meets Fire",
      img: c2,
      document: [{
        text: <span>The last attack in a Normal Attack sequence applies the Implode status onto the opponent for 2s. An explosion will occur once this duration ends, dealing 75% of Xiangling's ATK as <span className="text-pyro">AoE Pyro DMG</span>.</span>,
        fields: [(con) => con >= 2 && {
          text: "Explosion DMG",
          formulaText: (tlvl, stats, c) => <span>75% {Stat.printStat(getTalentStatKey("elemental", stats), stats)}</span>,
          formula: formula.constellation2.dmg,
          variant: (tlvl, stats) => getTalentStatKeyVariant("elemental", stats),
        }]
      }],
    },
    constellation3: {
      name: "Deepfry",
      img: c3,
      document: [{ text: <span>	Increases the level of <b>Pyronado</b> by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { burst: 3 }
    },
    constellation4: {
      name: "Slowbake",
      img: c4,
      document: [{ text: <span><b>Pyronado</b>'s duration is increased by 40%.</span> }],
    },
    constellation5: {
      name: "Guoba Mad",
      img: c5,
      document: [{ text: <span>Increases the level of <b>Guoba Attack</b> by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { skill: 3 }
    },
    constellation6: {
      name: "Condensed Pyronado",
      img: c6,
      document: [{ text: <span>For the duration of <b>Pyronado</b>, all party members receive a 15% <span className="text-pyro">Pyro DMG Bonus</span>.</span> }],
    }
  },
};
export default char;