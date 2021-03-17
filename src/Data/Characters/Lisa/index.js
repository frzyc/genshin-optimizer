import card from './Character_Lisa_Card.jpg'
import thumb from './Character_Lisa_Thumb.png'
import c1 from './Constellation_Infinite_Circuit.png'
import c2 from './Constellation_Electromagnetic_Field.png'
import c3 from './Constellation_Resonant_Thunder.png'
import c4 from './Constellation_Plasma_Eruption.png'
import c5 from './Constellation_Electrocute.png'
import c6 from './Constellation_Pulsating_Witch.png'
import normal from './Talent_Lightning_Touch.png'
import skill from './Talent_Violet_Arc.png'
import burst from './Talent_Lightning_Rose.png'
import passive1 from './Talent_Induced_Aftershock.png'
import passive2 from './Talent_Static_Electricity_Field.png'
import passive3 from './Talent_General_Pharmaceutics.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'
const char = {
  name: "Lisa",
  cardImg: card,
  thumbImg: thumb,
  star: 4,
  elementKey: "electro",
  weaponTypeKey: "catalyst",
  gender: "F",
  constellationName: "Tempus Fugit",
  titles: ["Witch of Purple Rose", "The Librarian"],
  baseStat: data.baseStat,
  specializeStat: data.specializeStat,
  formula,
  talent: {
    auto: {
      name: "Lightning Touch",
      img: normal,
      infusable: false,
      document: [{
        text: <span><strong>Normal Attack</strong> Perform up to 4 lightning attacks that deal Electro DMG <span className="text-electro">Electro DMG</span>.</span>,
        fields: data.normal.hitArr.map((percentArr, i) =>
        ({
          text: `${i + 1}-Hit DMG`,
          formulaText: (tlvl, stats) => <span>{percentArr[tlvl]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
          formula: formula.normal[i],
          variant: (tlvl, stats) => getTalentStatKeyVariant("normal", stats),
        }))
      }, {
        text: <span><strong>Charged Attack</strong> Consumes a certain amount of Stamina to deal <span className="text-electro">AoE Electro DMG</span> after a short casting time.</span>,
        fields: [{
          text: `Charged Attack DMG`,
          formulaText: (tlvl, stats) => <span>{data.charged.hit[tlvl]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
          formula: formula.charged.hit,
          variant: (tlvl, stats) => getTalentStatKeyVariant("charged", stats),
        }, {
          text: `Stamina Cost`,
          value: 50,
        }]
      }, {
        text: <span><strong>Plunging Attack</strong> Gathering the might of Electro, Lisa plunges towards the ground from mid-air, damaging all opponents in her path. Deals <span className="text-electro">AoE Electro DMG</span> upon impact with the ground.</span>,
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
      name: "Violet Arc",
      img: skill,
      document: [{
        text: <span>
        <p className="mb-2">Channels the power of lightning to sweep bothersome matters away.</p>
        <ul className="mb-2">
        <li>Releases a homing Lightning Orb.</li>
        <li>On hit, it deals <span className="text-electro">Electro DMG</span>, and applies a stack of the Conductive status (Max 3 stacks) to opponents in a small AoE.</li>
        </ul>
        <p className="mb-2"><b>Hold:</b> After an extended casting time, calls down lightning from the heavens, dealing massive <span className="text-electro">Electro DMG</span> to all nearby opponents.</p>
        <p> Deals great amounts of extra damage to opponents based on the number of Conductive stacks applied to them, and clears their Conductive status.</p>
        </span>,
        fields: [{
          text: "Press DMG",
          formulaText: (tlvl, stats) => <span>{data.skill.dmg[tlvl]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.dmg,
          variant: (tlvl, stats) => getTalentStatKeyVariant("skill", stats),
        },  {
          text: "No Stack Hold",
          formulaText: (tlvl, stats) => <span>{data.skill.stack0[tlvl]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.stack0,
          variant: (tlvl, stats) => getTalentStatKeyVariant("skill", stats),
        }, {
          text: "1 Stack Hold",
          formulaText: (tlvl, stats) => <span>{data.skill.stack1[tlvl]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.stack1,
          variant: (tlvl, stats) => getTalentStatKeyVariant("skill", stats),
        },{
          text: "2 Stack Hold",
          formulaText: (tlvl, stats) => <span>{data.skill.stack2[tlvl]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.stack2,
          variant: (tlvl, stats) => getTalentStatKeyVariant("skill", stats),
        },{
          text: "3 Stack Hold",
          formulaText: (tlvl, stats) => <span>{data.skill.stack3[tlvl]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.stack3,
          variant: (tlvl, stats) => getTalentStatKeyVariant("skill", stats),
        },{
          text: "Press CD",
          value: "1s",
        },{
          text: "Hold CD",
          value: "12s",
        }]
      }],
    },
    burst: {
      name: "Lightning Rose",
      img: burst,
      document: [{
        text: <span>
        <p className="mb-2">Summons a Lightning Rose that unleashes powerful lightning bolts, launching surrounding opponents and dealing <span className="text-electro">Electro DMG</span>.</p>
        <p className="mb-2">The <b>Lightning Rose</b> will continuously emit lightning to knock back opponents and deal <span className="text-electro">Electro DMG</span> throughout the ability's duration.</p>
        
        </span>,
        fields: [{
          text: "Lightning Rose Duration",
          value: "15s",
        }, {
          text: "Lightning Rose Explosion DMG",
          formulaText: (tlvl, stats) => <span>{data.burst.dmg[tlvl]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
          formula: formula.burst.dmg,
          variant: (tlvl, stats) => getTalentStatKeyVariant("burst", stats), 
        }, {
          text: "CD",
          value: "20s",
        }, {
          text: "Energy Cost",
          value: 80,
        }],
        
      }],
    },
    
    passive1: {
      name: "Induced Aftershock",
      img: passive1,
      document: [{
        text: <span>
        <p className="mb-2">Hits by Charged Attacks apply <b>Violet Arc's Conductive</b> status to opponents.</p>
        
        </span>,
        
      }],
    },
    passive2: {
      name: "Static Electricity Field Destiny",
      img: passive2,
      document: [{ text: <span>Opponents hit by <b>Lightning Rose</b> have their DEF decreased by 15% for 10s.</span>, 
        conditional: (tlvl, c, a) => a >= 4 && {
          type: "character",
          conditionalKey: "StaticElectricityFieldDestiny",
          condition: "Opponents hit by Lightning Rose",
          sourceKey: "lisa",
          maxStack: 1,
          stats: {
            enemyDEFRed_: 15,
          },
          fields: [{
            text: "Duration",
            value: "10s",
          }],
        },}],
      
    },
    passive3: {
      name: "General Pharmaceutics",
      img: passive3,
      document: [{ text: <span>When Lisa crafts a potion, she has a 20% chance to refund a portion of the crafting materials used.</span> }],
    },
    constellation1: {
      name: "Infinite Circuit",
      img: c1,
      document: [{
        text: <span>
        Lisa regenerates 2 Energy for every opponent hit while holding <b>Violet Arc</b>. A maximum of 10 Energy can be regenerated in this manner at any one time.
        </span>
      }],
    },
    constellation2: {
      name: "Electromagnetic Field",
      img: c2,
      document: [{ text: <span><b>Holding Violet Arc</b> has the following effects:
        <ul>
        <li>Increases DEF by 25%.</li>
        <li>Increases Lisa's resistance to interruption.</li>
        </ul></span> }],
      },
      constellation3: {
        name: "Restless Revolution",
        img: c3,
        document: [{ text: <span>Increases the Level of <b>Lightning Rose</b> by 3. Maximum upgrade level is 15.</span> }],
        talentBoost: { burst: 3 }
      },
      constellation4: {
        name: "Plasma Eruption",
        img: c4,
        document: [{
          text: <span>Increases the number of lightning bolts released by <b>Lightning Rose</b> by 1-3.</span>,
         
        }],
      },
      constellation5: {
        name: "Mockery of Fortuna",
        img: c5,
        document: [{ text: <span>Increases the Level of <b>Violet Arc</b> by 3. Maximum upgrade level is 15.</span> }],
        talentBoost: { skill: 3 }
      },
      constellation6: {
        name: "Pulsating Witch",
        img: c6,
        document: [{
          text: <span>When Lisa takes the field, she applies 3 stacks of <b>Violet Arc's Conductive</b> status onto nearby opponents. This effect can only occur once every 5s.</span>,
        
        }],
      }
    },
  };
  export default char;
  