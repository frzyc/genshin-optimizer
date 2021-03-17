import card from './Character_Klee_Card.jpg'
import thumb from './Character_Klee_Thumb.png'
import c1 from './Constellation_Chained_Reactions.png'
import c2 from './Constellation_Explosive_Frags.png'
import c3 from './Constellation_Exquisite_Compound.png'
import c4 from './Constellation_Sparkly_Explosion.png'
import c5 from './Constellation_Nova_Burst.png'
import c6 from './Constellation_Blazing_Delight.png'
import normal from './Talent_Kaboom.png'
import skill from './Talent_Jumpy_Dumpty.png'
import burst from './Talent_Sparks_\'n\'_Splash.png'
import passive1 from './Talent_Pounding_Surprise.png'
import passive2 from './Talent_Sparkling_Burst.png'
import passive3 from './Talent_All_Of_My_Treasures.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'

const char = {
  name: "Klee",
  cardImg: card,
  thumbImg: thumb,
  star: 5,
  elementKey: "pyro",
  weaponTypeKey: "catalyst",
  gender: "F",
  constellationName: "Trifolium",
  titles: ["Fleeing Sunlight", "Spark Knight", "Red Burny Girl"],
  baseStat: data.baseStat,
  specializeStat: data.specializeStat,
  formula,
  talent: {
    auto: {
      name: "Kaboom!",
      img: normal,
      infusable: false,
      document: [{
        text: <span><strong>Normal Attack</strong> Throws things that go boom when they hit things! Perform up to 3 explosive attacks, dealing <span className="text-pyro">AoE Pyro DMG</span>.</span>,
        fields: data.normal.hitArr.map((percentArr, i) =>
        ({
          text: `${i + 1}-Hit DMG`,
          formulaText: (tlvl, stats) => <span>{percentArr[tlvl]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
          formula: formula.normal[i],
          variant: (tlvl, stats) => getTalentStatKeyVariant("normal", stats),
        }))
      }, {
        text: <span><strong>Charged Attack</strong> Consumes a certain amount of Stamina and deals <span className="text-pyro">AoE Pyro DMG</span> to opponents after a short casting time.</span>,
        fields: [{
          text: `Charged Attack DMG`,
          formulaText: (tlvl, stats) => <span>{data.charged.dmg[tlvl]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
          formula: formula.charged.dmg,
          variant: (tlvl, stats) => getTalentStatKeyVariant("charged", stats),
        }, {
          text: `Stamina Cost`,
          value: 50,
        }],
      }, {
        text: <span><strong>Plunging Attack</strong> Gathering the power of <span className="text-pyro">Pyro</span>, Klee plunges towards the ground from mid-air, damaging all opponents in her path. Deals <span className="text-pyro">AoE Pyro DMG</span> upon impact with the ground.</span>,
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
      name: "Jumpy Dumpty",
      img: skill,
      document: [{
        text: <span>
          <p className="mb-2">Jumpy Dumpty is tons of boom-bang-fun!</p>
          <p className="mb-2">When thrown, Jumpy Dumpty bounces thrice, igniting and dealing <span className="text-pyro">AoE Pyro DMG</span> with every bounce.</p>
          <p className="mb-2">On the third bounce, the bomb splits into 8 mines. The mines will explode upon contact with opponents, or after a short period of time, dealing <span className="text-pyro">AoE Pyro DMG</span>.</p>
          <p className="mb-2">Starts with 2 charges.</p>
        </span>,
        fields: [{
          text: "Jumpy Dumpty DMG",
          formulaText: (tlvl, stats) => <span>{data.skill.jumpyDmg[tlvl]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.jumpyDmg,
          variant: (tlvl, stats) => getTalentStatKeyVariant("skill", stats),
        }, {
          text: "Mine DMG",
          formulaText: (tlvl, stats) => <span>{data.skill.mineDmg[tlvl]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.mineDmg,
          variant: (tlvl, stats) => getTalentStatKeyVariant("skill", stats),
        }, {
          text: "Mine Duration",
          value: "15s",
        }, {
          text: "CD",
          value: "20s",
        }]
      }],
    },
    burst: {
      name: "Sparks 'n' Splash",
      img: burst,
      document: [{
        text: <span>Klee's Blazing Delight! For 10 seconds, summons 5 times 4 Sparks 'n' Splash to attack nearby opponents, dealing <span className="text-pyro">AoE Pyro DMG</span>.</span>,
        fields: [{
          text: "Sparks 'n' Splash DMG",
          formulaText: (tlvl, stats) => <span>{data.burst.dmg[tlvl]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
          formula: formula.burst.dmg,
          variant: (tlvl, stats) => getTalentStatKeyVariant("burst", stats),
        }, {
          text: "Duration",
          value: "10s",
        }, {
          text: "CD",
          value: "15s",
        }, {
          text: "Energy Cost",
          value: 60,
        }]
      }],
    },
    passive1: {
      name: "Pounding Surprise",
      img: passive1,
      document: [{
        text: <span>When <b>Jumpy Dumpty</b> and <b>Normal Attacks</b> deal DMG, Klee has a 50% chance to obtain an Explosive Spark. This Explosive Spark is consumed by the next Charged Attack, which costs no Stamina and deals 50% increased DMG.</span>,
        conditional: (tlvl, c, a) => a >= 1 && {
          type: "character",
          conditionalKey: "Pounding Surprise",
          condition: "has Explosive Spark",
          sourceKey: "klee",
          maxStack: 1,
          stats: {
            charged_dmg_: 50,
          },
          fields: [{ text: "Next Charged attack cost no stamina" }]
        }
      }],
    },
    passive2: {
      name: "Sparkling Burst",
      img: passive2,
      document: [{ text: <span>When Klee's <b>Charged Attack</b> results in a CRIT, all party members gain 2 Elemental Energy.</span> }],//TODO: party buff
    },
    passive3: {
      name: "	All Of My Treasures!",
      img: passive3,
      document: [{ text: <span>Displays the location of nearby resources unique to Mondstadt on the mini-map.</span> }],
    },
    constellation1: {
      name: "Chained Reactions",
      img: c1,
      document: [{
        text: <span>Attacks and Skills have a certain chance to summon sparks that bombard opponents, dealing DMG equal to 120% of Sparks 'n' Splash's DMG.</span>,
        fields: [(con) => con >= 1 && {
          text: "Chained Reactions DMG",
          formulaText: (tlvl, stats) => <span>120% x {data.burst.dmg[stats.talentLevelKeys.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
          formula: formula.constellation1.dmgChained,
          variant: (tlvl, stats) => getTalentStatKeyVariant("burst", stats),
        },]
      }],
    },
    constellation2: {
      name: "Explosive Frags",
      img: c2,
      document: [{
        text: <span>Being hit by <b>Jumpy Dumpty</b>'s mines decreases opponents' DEF by 23% for 10s.</span>,
        conditional: (tlvl, c) => c >= 2 && {
          type: "character",
          conditionalKey: "Explosive Frags",
          condition: "Hit by Jumpy Dumpty's mines",
          sourceKey: "klee",
          maxStack: 1,
          stats: { enemyDEFRed_: 23 },
          fields: [{
            text: "Duration",
            value: "10s",
          }]
        }
      }],
    },
    constellation3: {
      name: "Exquisite Compound",
      img: c3,
      document: [{ text: <span>Increases the level of <b>Jumpy Dumpty</b> by 3. Maximum level is 15.</span> }],
      talentBoost: { skill: 3 }
    },
    constellation4: {
      name: "Sparkly Explosion",
      img: c4,
      document: [{
        text: <span>If Klee leaves the field during the duration of <b>Sparks 'n' Splash</b>, her departure triggers an explosion that deals 555% of her ATK as <span className="text-pyro">AoE Pyro DMG</span>.</span>,
        fields: [{
          text: "Sparkly Explosion DMG",
          formulaText: (tlvl, stats) => <span>555% {Stat.printStat(getTalentStatKey("elemental", stats), stats)}</span>,
          formula: formula.constellation4.dmg,
          variant: (tlvl, stats) => getTalentStatKeyVariant("elemental", stats),
        }]
      }],
    },
    constellation5: {
      name: "Nova Burst",
      img: c5,
      document: [{ text: <span>Increases the level of <b>Sparks 'n' Splash</b> by 3. Maximum level is 15.</span> }],
      talentBoost: { burst: 3 }
    },
    constellation6: {
      name: "Blazing Delight",
      img: c6,
      document: [{
        text: <span>
          <p className="mb-2">While under the effects of <b>Sparks 'n' Splash</b>, other members of the party will continuously regenerate Energy.</p>
          <p className="mb-0">When <b>Sparks 'n' Splash</b> is used, all party members will gain a 10% <span className="text-pyro">Pyro DMG Bonus</span> for 25s.</p>
        </span>,
        conditional: (tlvl, c) => c >= 6 && {
          type: "character",
          conditionalKey: "Blazing Delight",
          condition: "Sparks 'n' Splash is used",
          sourceKey: "klee",
          maxStack: 1,
          stats: { pyro_dmg_: 10 }//TODO: party buff
        }
      }],
    }
  },
};
export default char;
