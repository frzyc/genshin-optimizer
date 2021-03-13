import card from './Character_Albedo_Card.png'
import thumb from './Character_Albedo_Thumb.png'
import c1 from './Constellation_Flower_of_Eden.png'
import c2 from './Constellation_Opening_of_Phanerozoic.png'
import c3 from './Constellation_Grace_of_Helios.png'
import c4 from './Constellation_Descent_of_Divinity.png'
import c5 from './Constellation_Tide_of_Hadaen.png'
import c6 from './Constellation_Dust_of_Purification.png'
import normal from './Talent_Favonius_Bladework_-_Weiss.png'
import skill from './Talent_Abiogenesis_-_Solar_Isotoma.png'
import burst from './Talent_Rite_of_Progeniture_-_Tectonic_Tide.png'
import passive1 from './Talent_Calcite_Might.png'
import passive2 from './Talent_Homuncular_Nature.png'
import passive3 from './Talent_Flash_of_Genius_(Albedo).png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import { getTalentStatKey, getTalentStatKeyVariant, } from "../../../Build/Build"
const char = {
  name: "Albedo",
  cardImg: card,
  thumbImg: thumb,
  star: 5,
  elementKey: "geo",
  weaponTypeKey: "sword",
  gender: "M",
  constellationName: "Princeps Cretaceus",
  titles: ["Kreideprinz", "The Chalk Prince", "Chief Alchemist"],
  baseStat: data.baseStat,
  specializeStat: data.specializeStat,
  formula,
  talent: {
    auto: {
      name: "Favonius Bladework - Weiss",
      img: normal,
      infusable: false,
      document: [{
        text: <span><strong>Normal Attack</strong> Perform up to 5 rapid strikes.</span>,
        fields: data.normal.hitArr.map((percentArr, i) =>
        ({
          text: `${i + 1}-Hit DMG`,
          formulaText: (tlvl, stats) => <span>{percentArr[tlvl]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
          formula: formula.normal[i],
          variant: (tlvl, stats) => getTalentStatKeyVariant("normal", stats)
        }))
      }, {
        text: <span><strong>Charged Attack</strong> Consumes a certain amount of Stamina to unleash 2 rapid sword strikes.</span>,
        fields: [{
          text: `Charged 1-Hit DMG`,
          formulaText: (tlvl, stats) => <span>{data.charged.atk1[tlvl]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
          formula: formula.charged.atk1,
          variant: (tlvl, stats) => getTalentStatKeyVariant("charged", stats),
        }, {
          text: `Charged 2-Hit DMG`,
          formulaText: (tlvl, stats) => <span>{data.charged.atk2[tlvl]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
          formula: formula.charged.atk2,
          variant: (tlvl, stats) => getTalentStatKeyVariant("charged", stats),
        }, {
          text: `Stamina Cost`,
          value: 20,
        }]
      }, {
        text: <span><strong>Plunging Attack</strong> Plunges from mid-air to strike the ground, damaging enemies along the path and dealing AoE DMG upon impact.</span>,
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
      }]
    },
    skill: {
      name: "Abiogenesis: Solar Isotoma",
      img: skill,
      document: [{
        text: <span>
          <p className="mb-2">Albedo creates a Solar Isotoma using alchemy, which deals AoE Geo DMG on appearance.</p>
          <h6>Solar Isotoma:</h6>
          <ul className="mb-1">
            <li>When opponents within the Solar Isotoma field take DMG, the Solar Isotoma will generate Transient Blossoms which deal AoE Geo DMG. DMG dealt scales off Albedo's DEF. </li>
            <li>Transient Blossoms can only be generated once every 2s.</li>
            <li>When a character is located at the locus of the Solar Isotoma, the Solar Isotoma will accumulate Geo power to form a crystallized platform that lifts the character up to a certain height. Only one crystallized platform can exist at a time.</li>
            <li>Solar Isotoma is considered a Geo construct. Only one Solar Isotoma created by Albedo himself can exist at a time</li>
          </ul>
        </span>,
        fields: [{
          text: "Place DMG",
          formulaText: (tlvl, stats) => <span>{data.skill.press[tlvl]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.press,
          variant: (tlvl, stats) => getTalentStatKeyVariant("skill", stats),
        },
        {
          text: "Transient Blossom DMG",
          formulaText: (tlvl, stats) => <span>{data.skill.blossom[tlvl]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.blossom,
          variant: (tlvl, stats) => getTalentStatKeyVariant("skill", stats),
        }]
      }],
    },
    burst: {
      name: "Rite of Progeniture: Tectonic Tide",
      img: burst,
      document: [{
        text: <span>
          <p className="mb-2">Under Albedo's command, Geo crystals surge and burst forth, dealing AoE Geo DMG in front of him. If a Solar Isotoma created by Albedo himself is on the field, 7 Fatal Blossoms will be generated in the Solar Isotoma field, bursting violently into bloom and dealing AoE Geo DMG. Tectonic Tide DMG and Fatal Blossom DMG will not generate Transient Blossoms.</p>
        </span>,
        fields: [{
          text: "Brust DMG",
          formulaText: (tlvl, stats) => <span>{data.burst.dmg[tlvl]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
          formula: formula.burst.dmg,
          variant: (tlvl, stats) => getTalentStatKeyVariant("burst", stats),
        },
        {
          text: "Fatal Blossom DMG",
          formulaText: (tlvl, stats) => <span>{data.burst.blossom[tlvl]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
          formula: formula.burst.blossom,
          variant: (tlvl, stats) => getTalentStatKeyVariant("burst", stats),
        }]
      }],
    },
    passive1: {
      name: "Calcite Might",
      img: passive2,
      document: [{ text: <span>Transient Blossoms generated by Abiogenesis: Solar Isotoma deal 25% more DMG to opponents whose HP is below 50%.</span> }],
      conditional: (tlvl, c, a) => a >= 2 && {
        type: "character",
        conditionalKey: "enemy50",
        condition: "Enemy with <50% HP",
        sourceKey: "albedo",
        maxStack: 1,
        stats: {
          dmg_: 25,
        }
      }
    },
    passive2: {
      name: "Homuncular Nature",
      img: passive1,
      document: [{
        text: <span>Using Rite of Progeniture: Tectonic Tide increases the Elemental Mastery of nearby party members by 125 for 10s.</span>,
        conditional: (tlvl, c, a) => a >= 4 && {
          type: "character",
          conditionalKey: "TectonicTide",
          condition: "Tectonic Tide",
          sourceKey: "albedo",
          maxStack: 1,
          stats: {
            eleMas: 125,
          }//TODO: team buff
        }
      }],
    },
    passive3: {
      name: "Flash of Genius",
      img: passive3,
      document: [{ text: <span>When Albedo crafts Weapon Ascension Materials, he has a 10% chance to receive double the product.</span> }],
    },
    constellation1: {
      name: "Flower of Eden",
      img: c1,
      document: [{ text: <span>Transient Blossoms generated by Albedo's Abiogenesis: Solar Isotoma regenerate 1.2 Energy for Albedo.</span> }],
    },
    constellation2: {
      name: "Opening of Phanerozoic",
      img: c2,
      document: [{
        text: <span>
          <p className="mb-2">Transient Blossoms generated by Abiogenesis: Solar Isotoma grant Albedo Fatal Reckoning for 30s:</p>
          <ul className="mb-1">
            <li>Unleashing Rite of Progeniture: Tectonic Tide consumes all stacks of Fatal Reckoning. Each stack of Fatal Reckoning consumed increases the DMG dealt by Fatal Blossoms and Rite of Progeniture: Tectonic Tide's burst DMG by 30% of Albedo's DEF.</li>
            <li>This effect stacks up to 4 times.</li>
          </ul>
        </span>,
        conditional: (tlvl, c, a) => c >= 2 && {
          type: "character",
          conditionalKey: "FatalReckoning",
          condition: "Fatal Reckoning",
          sourceKey: "albedo",
          maxStack: 4,
          stats: {
            modifiers: { geo_burst_hit: { finalDEF: 0.3 } },//This was the only way i could make it calculate the correct value but it isnt added and does not stack
          }//TODO: frzyc
        }
      }],
    },
    constellation3: {
      name: "Grace of Helios",
      img: c3,
      document: [{ text: <span>	Increases the level of <b>Abiogenesis: Solar Isotoma</b> by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { burst: 3 }
    },
    constellation4: {
      name: "Descent of Divinity",
      img: c4,
      document: [{
        text: <span>Active party members within the <b>Solar Isotoma</b> field have their Plunging Attack DMG increased by 30%.</span>,
        conditional: (tlvl, c, a) => c >= 4 && {
          type: "character",
          conditionalKey: "SolarIsotoma",
          condition: "Within the Solar Isotoma",
          sourceKey: "albedo",
          maxStack: 1,
          stats: {
            plunging_dmg_: 30,
          }
        }//TODO: team buff 
      }],
    },
    constellation5: {
      name: "Tide of Hadean",
      img: c5,
      document: [{ text: <span>Increases the level of <b>Rite of Progeniture: Tectonic Tide</b> by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { skill: 3 }
    },
    constellation6: {
      name: "Dust of Purification",
      img: c6,
      document: [{
        text: <span>Active party members within the Solar Isotoma field who are protected by a shield created by Crystallize have their DMG increased by 17%.</span>,
        conditional: (tlvl, c, a) => c >= 6 && {
          type: "character",
          conditionalKey: "Protectedbyashield",
          condition: "Protected by a shield created by Crystallize",
          sourceKey: "albedo",
          maxStack: 1,
          stats: {
            dmg_: 17,
          }
        }//TODO: team buff
      }],
    }
  },
};
export default char;
