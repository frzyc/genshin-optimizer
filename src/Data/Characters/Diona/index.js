import card from './Character_Diona_Card.png'
import thumb from './Character_Diona_Thumb.png'
import c1 from './Constellation_A_Lingering_Flavor.png'
import c2 from './Constellation_Shaken,_Not_Purred.png'
import c3 from './Constellation_A-Another_Round_.png'
import c4 from './Constellation_Wine_Industry_Slayer.png'
import c5 from './Constellation_Double_Shot,_On_The_Rocks.png'
import c6 from './Constellation_Cat\'s_Tail_Closing_Time.png'
import normal from './Talent_Kätzlein_Style.png'
import skill from './Talent_Icy_Paws.png'
import burst from './Talent_Signature_Mix.png'
import passive1 from './Talent_Cat\'s_Tail_Secret_Menu.png'
import passive2 from './Talent_Drunkards\'_Farce.png'
import passive3 from './Talent_Complimentary_Bar_Food.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'

const char = {
  name: "Diona",
  cardImg: card,
  thumbImg: thumb,
  star: 4,
  elementKey: "cryo",
  weaponTypeKey: "bow",
  gender: "F",
  constellationName: "Feles",
  titles: ["Kätzlein Cocktail", "Wine Industry Slayer (Self-proclaimed)"],
  baseStat: data.baseStat,
  specializeStat: data.specializeStat,
  formula,
  talent: {
    auto: {
      name: "Kätzlein Style",
      img: normal,
      document: [{
        text: <span><strong>Normal Attack</strong> Perform up to 5 consecutive shots with a bow.</span>,
        fields: data.normal.hitArr.map((percentArr, i) =>
        ({
          text: `${i + 1}-Hit DMG`,
          formulaText: stats => <span>{percentArr[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
          formula: formula.normal[i],
          variant: stats => getTalentStatKeyVariant("normal", stats),
        }))
      }, {
        text: <span><strong>Charged Attack</strong> Perform a more precise Aimed Shot with increased DMG. While aiming, biting frost will accumulate on the arrowhead. A fully charged frost arrow will deal <span className="text-cryo">Cryo DMG</span>.</span>,
        fields: [{
          text: `Aimed Shot DMG`,
          formulaText: stats => <span>{data.charged.aimedShot[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
          formula: formula.charged.aimShot,
          variant: stats => getTalentStatKeyVariant("charged", stats),
        }, {
          text: `Fully-Charged Aimed Shot DMG`,
          formulaText: stats => <span>{data.charged.fullAimedShot[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats, true), stats)}</span>,
          formula: formula.charged.fullAimedShot,
          variant: stats => getTalentStatKeyVariant("charged", stats, true),
        }, (con) => con >= 4 && {
          text: "Charge time reduced by 60% in Burst zone"
          }]
      }, {
        text: <span><strong>Plunging Attack</strong> Fires off a shower of arrows in mid-air before falling and striking the ground, dealing AoE DMG upon impact.</span>,
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
      name: "Icy Paws",
      img: skill,
      document: [{
        text: <span>
          <p className="mb-2">Fires an Icy Paw that deals <span className="text-cryo">Cryo DMG</span> to opponents and forms a shield on hit.The shield's DMG Absorption scales based on Diona's Max HP, and its duration scales off the number of Icy Paws that hit their target.</p>
          <p className="mb-2"><strong>Press:</strong> Rapidly fires off 2 Icy Paws.</p>
          <p className="mb-2"><strong>Hold:</strong> ashes back quickly before firing five Icy Paws.</p>
          <p className="mb-2">The shield created by a Hold attack will gain a 75% DMG Absorption Bonus.The shield has a 250% <span className="text-cryo">Cryo DMG</span> Absorption Bonus, and will cause your active character to become affected by <span className="text-cryo">Cryo</span> at the point of formation for a short duration.</p>
          </span>,
        fields: [{
          text: "Shield DMG Absorption",
          formulaText: stats => <span>({data.skill.shieldHp[stats.tlvl.skill]}% {Stat.printStat("finalHP", stats)} + {data.skill.shieldFlat[stats.tlvl.skill]}){stats.constellation >= 2 ? " * 1.15" : ""}</span>,
          formula: formula.skill.shield,
          }, {
          text: "Hold Shield DMG Absorption",
          formulaText: stats => <span>({data.skill.shieldHp[stats.tlvl.skill]}% {Stat.printStat("finalHP", stats)} + {data.skill.shieldFlat[stats.tlvl.skill]}){stats.constellation >= 2 ? " * 1.9" : " * 1.75"}</span>,
          formula: formula.skill.shieldHold,
          }, {
          text: "Icy Paw DMG",
          formulaText: stats => <span>{data.skill.dmgPerPaw[stats.tlvl.skill]}%{stats.constellation >= 2 ? " + 15%" : ""} {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.dmg,
          variant: stats => getTalentStatKeyVariant("skill", stats),
          }, {
          text: "Duration per Paw",
          value: (stats) => `${data.skill.durationPerPaw[stats.tlvl.skill]}s`,
          }, {
          text: "Press CD",
          value: "6s",
          }, {
          text: "Hold CD",
          value: "12s",
        }],
     }]
   },
   burst: {
    name: "Signature Mix",
    img: burst,
    document: [{
      text: <span>
        <p className="mb-2">Tosses out a special cold brew that deals <span className="text-cryo">AoE Cryo DMG</span> and creates a Drunken Mist in an AoE.</p>
        <p className="mb-2"><strong>Drunken Mist</strong></p>
        <p className="mb-1">Deals continuous <span className="text-cryo">Cryo DMG</span> to opponents within the AoE.</p>
        <p className="mb-1">Continuously regenerates the HP of characters within the AoE.</p>
        </span>,
        fields: [{
          text: "Skill DMG",
          formulaText: stats => <span>{data.burst.dmg[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.burst.dmg,
          variant: stats => getTalentStatKeyVariant("burst", stats),
       }, {
          text: "Continuous Field DMG",
          formulaText: stats => <span>{data.burst.continuousDmg[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.burst.continuousDmg,
          variant: stats => getTalentStatKeyVariant("burst", stats),
       }, {
         text: "HP Regeneration Over Time",
         formulaText: stats => <span>( {data.burst.hpPercent[stats.tlvl.burst]}% {Stat.printStat("finalHP", stats)} + {data.burst.hpFlat[stats.tlvl.burst]} ) * {Stat.printStat("heal_multi", stats)}</span>,
         formula: formula.burst.regen,
         variant: stats => getTalentStatKeyVariant("burst", stats),
       }, {
         text: "Duration",
         value: "12s",
       },  {
         text: "CD",
         value: "20s",
       }, {
          text: "Energy Cost",
          value: 80,
        }]
     }],
    },
    passive1: {
     name: "Cat's Tail Secret Menu",
     img: passive1,
     document: [{ text: <span>Characters shielded by <b>Icy Paws</b> have their Movement SPD increased by 10% and their Stamina Consumption decreased by 10%.</span> }],
    },
    passive2: {
     name: "Drunkards' Farce",
     img: passive2,
     document: [{ text: <span>Opponents who enter the AoE of Signature Mix have 10% decreased ATK for 15s.</span> }],
    },
    passive3: {
     name: "Complimentary Bar Food",
     img: passive3,
     document: [{ text: <span>When a Perfect Cooking is achieved on a dish with restorative effects, there is a 12% chance to obtain double the product.</span> }],
    },
    constellation1: {
      name: "A Lingering Flavor",
      img: c1,
      document: [{ text: <span>Regenerates 15 Energy for Diona after the effects of Signature Mix end.</span> }],
    },
    constellation2: {
      name: "Shaken, Not Purred",
      img: c2,
      document: [{
        text: <span>Increases Icy Paws' DMG by 15%, and increases its shield's DMG Absorption by 15%. Additionally, when paws hit their targets, creates a shield for other nearby characters on the field with 50% of the Icy Paws shield's DMG Absorption for 5s.</span>
      }],
      stats: (c) => c >= 2 && {
        skill_dmg_: 15 
      }
    },
    constellation3: {
      name: "A—Another Round?",
      img: c3,
      document: [{ text: <span> Increases the Level of <b>Signature Mix</b> by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { burst: 3 }
    },
    constellation4: {
      name: "Wine Industry Slayer",
      img: c4,
      document: [{ text: <span>Within the radius of <b>Signature Mix</b>, Diona's charge time for aimed shots is reduced by 60%</span> }],
    },
    constellation5: {
      name: "Double Shot, On The Rocks",
      img: c5,
      document: [{ text: <span>Increases the Level of <b>Icy Paws</b> by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { skill: 3 }
    },
    constellation6: {
      name: "Cat's Tail Closing Time",
      img: c6,
      document: [{
        text: <span>Characters within Signature Mix's radius will gain the following effects based on their HP amounts:
          <ul className="mb-2">
            <li>Increases Incoming Healing Bonus by 30% when HP falls below or is equal to 50%.</li>
            <li>Elemental Mastery increased by 200 when HP is above 50%.</li>
          </ul>
        </span>
      }],
    }
  },
};
export default char;
