import card from './Character_Chongyun_Card.jpg'
import thumb from './Character_Chongyun_Thumb.png'
import c1 from './Constellation_Ice_Unleashed.png'
import c2 from './Constellation_Atmospheric_Revolution.png'
import c3 from './Constellation_Cloudburst.png'
import c4 from './Constellation_Frozen_Skies.png'
import c5 from './Constellation_The_True_Path.png'
import c6 from './Constellation_Rally_of_Four_Blades.png'
import normal from './Talent_Demonbane.png'
import skill from './Talent_Spirit_Blade_-_Chonghua\'s_Layered_Frost.png'
import burst from './Talent_Spirit_Blade_-_Cloud-parting_Star.png'
import passive1 from './Talent_Steady_Breathing.png'
import passive2 from './Talent_Rimechaser_Blade.png'
import passive3 from './Talent_Gallant_Journey.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'

const char = {
  name: "Chongyun",
  cardImg: card,
  thumbImg: thumb,
  star: 4,
  elementKey: "cryo",
  weaponTypeKey: "claymore",
  gender: "M",
  constellationName: "Nubis Caesor",
  titles: ["Frozen Ardor", "Banisher of Evil and Rumors Thereof"],
  baseStat: data.baseStat,
  specializeStat: data.specializeStat,
  formula,
  talent: {
    auto: {
      name: "Demonbane",
      img: normal,
      infusable: true,
      document: [{
        text: <span><strong>Normal Attack</strong> Perform up to 4 consecutive strikes.</span>,
        fields: data.normal.hitArr.map((percentArr, i) =>
        ({
          text: `${i + 1}-Hit DMG`,
          formulaText: (tlvl, stats) => <span>{percentArr[tlvl]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
          formula: formula.normal[i],
          variant: (tlvl, stats) => getTalentStatKeyVariant("normal", stats),
        }))
      }, {
        text: <span><strong>Charged Attack</strong> Drains Stamina over time to perform continuous spinning attacks against all nearby opponents. At end of the sequence, perform a more powerful slash.</span>,
        fields: [{
          text: `Spinning DMG`,
          formulaText: (tlvl, stats) => <span>{data.charged.spinning[tlvl]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
          formula: formula.charged.spinning,
          variant: (tlvl, stats) => getTalentStatKeyVariant("charged", stats),
        }, {
          text: `Spinning Final DMG`,
          formulaText: (tlvl, stats) => <span>{data.charged.finalATK[tlvl]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
          formula: formula.charged.finalATK,
          variant: (tlvl, stats) => getTalentStatKeyVariant("charged", stats),
        }, {
          text: `Stamina Cost`,
          value: `40/s`,
        }, {
          text: `Max Duration`,
          value: `5s`,
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
      name: "Spirit Blade: Chonghua's Layered Frost",
      img: skill,
      document: [{
        text: <span>
          <p className="mb-2">Chongyun strikes the ground with his greatsword, causing a Cryo explosion in a circular AoE in front of him that deals <span className="text-cryo">Cryo DMG</span>.</p>
          <p className="mb-2">After a short delay, the cold air created by the Cryo explosion will coalesce into a Chonghua Frost Field, within which all Sword, Claymore and Polearm-wielding characters' weapons will be infused with <span className="text-cryo">Cryo</span>.</p>
        </span>,
        fields: [{
          text: "Skill DMG",
          formulaText: (tlvl, stats, c) => <span>{data.skill.dmg[tlvl]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.dmg,
          variant: (tlvl, stats) => getTalentStatKeyVariant("skill", stats),
        }, {
          text: "Infusion Duration",
          value: (tlvl, stats, c) => `${data.skill.infusionDuration[tlvl]}s`,
        }, {
          text: "Field Duration",
          value: "10s",
        }, {
          text: "CD",
          value: "15s",
        }],
        conditional: (tlvl, c, a) => a >= 4 && {
          type: "character",
          conditionalKey: "RimechaserBlade",
          condition: "Opponents hit by Rimechase Blade",
          sourceKey: "chongyun",
          maxStack: 1,
          stats: { cryo_enemyRes_: -10 },
          fields: [{
            text: "Duration",
            value: "8s",
          }]
        }
      }],
    },
    burst: {
      name: "Spirit Blade: Cloud-Parting Star",
      img: burst,
      document: [{
        text: <span>
          <p className="mb-2">Performing the secret hand seals, Chongyun summons 3 giant spirit blades in mid-air that fall to the earth one by one after a short delay, exploding as they hit the ground.</p>
          <p className="mb-2">When the spirit blades explode, they will deal <span className="text-cryo">AoE Cryo DMG</span> and launch opponents.</p>
        </span>,
        fields: [{
          text: "Skill DMG",
          formulaText: (tlvl, stats) => <span>{data.burst.dmg[tlvl]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
          formula: formula.burst.dmg,
          variant: (tlvl, stats) => getTalentStatKeyVariant("burst", stats),
        }, {
          text: "CD",
          value: "12s",
        }, {
          text: "Energy Cost",
          value: 40,
        }],
        conditional: (tlvl, c) => c >= 6 && {
          type: "character",
          conditionalKey: "RallyOfFourBlades",
          condition: "Enemy with lower MaxHP% than Chongyun",
          sourceKey: "chongyuon",
          maxStack: 1,
          stats: { burst_dmg_: 15 },
        }
      }],
    },
    passive1: {
      name: "Steady Breathing",
      img: passive1,
      document: [{ text: <span>Sword, Claymore, or Polearm-wielding characters within the field created by <b>Spirit Blade: Chonghua's Layered Frost</b> have their Normal ATK SPD increased by 8%.</span> }],
    },
    passive2: {
      name: "Rimechaser Blade",
      img: passive2,
      document: [{
        text: <span>
        <p className="mb-2">When the field created by <b>Spirit Blade: Chonghua's Layered Frost</b> disappears, another spirit blade will be summoned to strike nearby opponents, dealing 100% of Chonghua's Layered Frost's Skill DMG as <span className="text-cryo">AoE Cryo DMG</span>.</p>
        <p className="mb-2">Opponents hit by this blade will have their <span className="text-cryo">Cryo RES</span> decreased by 10% for 8s.</p>
      </span>,
        fields: [(con ,a) => a >= 4 && {
          text: "Summoned Sword DMG",
          formulaText: (tlvl, stats, c) => <span>{data.skill.dmg[tlvl]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.passive2.dmg,
          variant: (tlvl, stats) => getTalentStatKeyVariant("skill", stats),
        }]
      }],
    },
    passive3: {
      name: "Gallant Journey",
      img: passive3,
      document: [{
        text: <span>
          When dispatched on an expedition in Liyue, time consumed is reduced by 25%.
        </span>
      }],
    },
    constellation1: {
      name: "Ice Unleashed",
      img: c1,
      document: [{ text: <span>The last attack of Chongyun's Normal Attack combo releases 3 ice blades. Each blade deals 50% of Chongyun's ATK as <span className="text-cryo">Cryo DMG</span> to all opponents in its path.</span>,
      fields: [(con) => con >= 1 && {
        text: "Ice Blade DMG",
        formulaText: (tlvl, stats) => <span>50% {Stat.printStat(getTalentStatKey("elemental", stats), stats)}</span>,
        formula: formula.constellation1.dmg,
        variant: (tlvl, stats) => getTalentStatKeyVariant("elemental", stats),
        }]
    }]
  },
    constellation2: {
      name: "Atmospheric Revolution",
      img: c2,
      document: [{ text: <span>Elemental Skills and Elemental Bursts cast within the Frost Field created by <b>Spirit Blade: Chonghua's Layered Frost</b> have their CD time decreased by 15%.</span> }],
    },
    constellation3: {
      name: "Cloudburst",
      img: c3,
      document: [{ text: <span>Increases the level of <b>Spirit Blade: Cloud-parting Star</b> by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { burst: 3 }
    },
    constellation4: {
      name: "Frozen Skies",
      img: c4,
      document: [{
        text: <span>
        <p className="mb-2">Chongyun regenerates 1 Energy every time he hits an opponent affected by <span className="text-cryo">Cryo</span>.</p>
        <p className="mb-2">This effect can only occur once every 2s.</p>
        </span>
       }],
    },
    constellation5: {
      name: "The True Path",
      img: c5,
      document: [{ text: <span>Increases the level of <b>Spirit Blade: Chonghua's Layered Frost</b> by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { skill: 3 }
    },
    constellation6: {
      name: "Rally of Four Blades",
      img: c6,
      document: [{
        text: <span>
        <p className="mb-2"><b>Spirit Blade: Cloud-parting Star</b> deals 15% more DMG to opponents with a lower percentage of their Max HP remaining than Chongyun.</p>
        <p className="mb-2">This skill will also summon 1 additional spirit blade.</p>
        </span>
       }],
    },
  },
};
export default char;
