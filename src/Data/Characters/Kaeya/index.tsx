import card from './Character_Kaeya_Card.jpg'
import thumb from './Character_Kaeya_Thumb.png'
import c1 from './Constellation_Excellent_Blood.png'
import c2 from './Constellation_Never-Ending_Performance.png'
import c3 from './Constellation_Dance_of_Frost.png'
import c4 from './Constellation_Frozen_Kiss.png'
import c5 from './Constellation_Frostbiting_Embrace.png'
import c6 from './Constellation_Glacial_Whirlwind.png'
import normal from './Talent_Ceremonial_Bladework.png'
import skill from './Talent_Frostgnaw.png'
import burst from './Talent_Glacial_Waltz.png'
import passive1 from './Talent_Cold-Blooded_Strike.png'
import passive2 from './Talent_Heart_of_the_Abyss.png'
import passive3 from './Talent_Hidden_Strength.png'
import DisplayPercent from '../../../Components/DisplayPercent'
import Stat from '../../../Stat'
import formula, { data } from './data'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'
import { IConditionals } from '../../../Types/IConditional'
import { ICharacterSheet } from '../../../Types/character'
const conditionals: IConditionals = {
  c1: { // ColdBloodedStrike
    canShow: stats => stats.constellation >= 1,
    name: <span>Opponent affected by <span className="text-cryo">Cryo</span></span>,
    stats: {
      normal_critRate_: 15,
      charged_critRate_: 15
    }
  }
}
const char: ICharacterSheet = {
  name: "Kaeya",
  cardImg: card,
  thumbImg: thumb,
  star: 4,
  elementKey: "cryo",
  weaponTypeKey: "sword",
  gender: "M",
  constellationName: "Pavo Ocellus",
  titles: ["Cavalry Captain", "Quartermaster", "Frostblade"],
  baseStat: data.baseStat,
  specializeStat: data.specializeStat,
  formula,
  conditionals,
  talent: {
    auto: {
      name: "Ceremonial Bladework",
      img: normal,
      document: [{
        text: <span><strong>Normal Attack</strong> Perform up to 5 rapid strikes.</span>,
        fields: data.normal.hitArr.map((percentArr, i) =>
        ({
          text: `${i + 1}-Hit DMG`,
          formulaText: stats => <span>{percentArr[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
          formula: formula.normal[i],
          variant: stats => getTalentStatKeyVariant("normal", stats),
        }))
      }, {
        text: <span><strong>Charged Attack</strong> Consumes a certain amount of Stamina to unleash 2 rapid sword strikes.</span>,
        fields: [{
          text: `Charged 1-Hit DMG`,
          formulaText: stats => <span>{data.charged.atk1[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
          formula: formula.charged.atk1,
          variant: stats => getTalentStatKeyVariant("charged", stats),
        }, {
          text: `Charged 2-Hit DMG`,
          formulaText: stats => <span>{data.charged.atk2[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
          formula: formula.charged.atk2,
          variant: stats => getTalentStatKeyVariant("charged", stats),
        }, {
          text: `Stamina Cost`,
          value: `20`,
        }]
      }, {
        text: <span><strong>Plunging Attack</strong> Plunges from mid-air to strike the ground below, damaging opponents along the path and dealing AoE DMG upon impact.</span>,
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
      name: "Frostgnaw",
      img: skill,
      document: [{
        text: <span>Unleashes a frigid blast, dealing <span className="text-cryo">Cryo DMG</span> to opponents in front of Kaeya.</span>,
        fields: [{
          text: "Skill DMG",
          formulaText: stats => <span>{data.skill.dmg[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats) + "_multi", stats)}</span>,
          formula: formula.skill.dmg,
          variant: stats => getTalentStatKeyVariant("skill", stats),
        }, {
          text: "CD",
          value: "6s",
        }],
      }],
    },
    burst: {
      name: "Glacial Waltz",
      img: burst,
      document: [{
        text: <span>Coalescing the frost in the air, Kaeya summons 3 icicles that revolve around him. These icicles will follow the character around and deal <span className="text-cryo">Cryo DMG</span> to opponents in their path for the ability's duration.</span>,
        fields: [{
          text: "Icicles DMG",
          formulaText: stats => <span>{data.burst.dmg[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
          formula: formula.burst.dmg,
          variant: stats => getTalentStatKeyVariant("burst", stats),
        }, {
          text: "Duration",
          value: "8s",
        }, {
          text: "CD",
          value: "15s",
        }, {
          text: "Energy Cost",
          value: 60,
        }, {
          canShow: stats => stats.constellation >= 2,
          text: "Increase duration by 2.5s per opponent defeated during, up to 15s"
        }],
      }],
    },
    passive1: {
      name: "Cold-Blooded Strike",
      img: passive1,
      document: [{
        text: stats => <span>Every hit with <b>Frostgnaw</b> regenerates HP for Kaeya equal to 15% of his ATK.{DisplayPercent(15, stats, "finalATK")}</span>,
        fields: [{
          text: "Healing",
          formulaText: stats => <span>15% {Stat.printStat("finalATK", stats)} * {Stat.printStat("heal_multi", stats)}</span>,
          formula: formula.passive1.dmg,
          variant: "success",
        }],
      }],
    },
    passive2: {
      name: "Glacial Heart",
      img: passive2,
      document: [{
        text: <span>Opponents Frozen by <b>Frostgnaw</b> will drop additional Elemental Particles. <b>Frostgnaw</b> may only produce a maximum of 2 additional Elemental Particles per use.</span>,
      }],
    },
    passive3: {
      name: "Hidden Strength",
      img: passive3,
      document: [{
        text: <span>Decreases sprinting Stamina consumption for your own party members by 20%. Not stackable with Passive Talents that provide the exact same effects.</span>
      }]
    },
    constellation1: {
      name: "Excellent Blood",
      img: c1,
      document: [{
        text: <span>The CRIT Rate of Kaeya's <b>Normal</b> and <b>Charged Attacks</b> against opponents affected by <span className="text-cryo">Cryo</span> is increased by 15%.</span>,
        conditional: conditionals.c1
      }]
    },
    constellation2: {
      name: "Never-Ending Performance",
      img: c2,
      document: [{ text: <span>Every time <b>Glacial Waltz</b> defeats an opponent during its duration, its duration is increased by 2.5s, up to a maximum of 15s.</span> }],
    },
    constellation3: {
      name: "Dance of Frost",
      img: c3,
      document: [{ text: <span>Increases the Level of <b>Frostgnaw</b> by 3. Maximum upgrade level is 15.</span> }],
      stats: { skillBoost: 3 }
    },
    constellation4: {
      name: "Frozen Kiss",
      img: c4,
      document: [{
        text: stats => <span>Triggers automatically when Kaeya's HP falls below 20%: Creates a shield that absorbs damage equal to 30% of Kaeya's Max HP{DisplayPercent(30, stats, "finalHP")}. Lasts for 20s. This shield absorbs <span className="text-cryo">Cryo DMG</span> with 250% efficiency. Can only occur once every 60s.</span>,
        fields: [{
          canShow: stats => stats.constellation >= 4,
          text: <span className="text-cryo">Shield DMG Absorption</span>,
          formulaText: stats => <span>30% {Stat.printStat("finalHP", stats)} * (100% + {Stat.printStat("powShield_", stats)}) * (250% <span className="text-cryo">Cryo Absorption</span>)</span>,
          formula: formula.constellation4.shieldCryo,
          variant: "cryo"
        }, {
          canShow: stats => stats.constellation >= 4,
          text: "Shield DMG Absorption",
          formulaText: stats => <span>30% {Stat.printStat("finalHP", stats)} * (100% + {Stat.printStat("powShield_", stats)})</span>,
          formula: formula.constellation4.shield,
        }, {
          canShow: stats => stats.constellation >= 4,
          text: "Duration",
          value: "20s",
        }, {
          canShow: stats => stats.constellation >= 4,
          text: "CD",
          value: "60s",
        }]
      }]
    },
    constellation5: {
      name: "Frostbiting Embrace",
      img: c5,
      document: [{ text: <span>Increases the Level of <b>Glacial Waltz</b> by 3. Maximum upgrade level is 15.</span> }],
      stats: { burstBoost: 3 }
    },
    constellation6: {
      name: "Glacial Whirlwind",
      img: c6,
      document: [{ text: <span><b>Glacial Waltz</b> will generate 1 additional icicle, and will regenerate 15 Energy when cast.</span> }]
    }
  }
};
export default char;
