import card from './Character_Barbara_Card.jpg'
import thumb from './Character_Barbara_Thumb.png'
import c1 from './Constellation_Gleeful_Songs.png'
import c2 from './Constellation_Vitality_Burst.png'
import c3 from './Constellation_Star_of_Tomorrow.png'
import c4 from './Constellation_Attentiveness_be_My_Power.png'
import c5 from './Constellation_The_Purest_Companionship.png'
import c6 from './Constellation_Dedicating_Everything_to_You.png'
import normal from './Talent_Whisper_of_Water.png'
import skill from './Talent_Let_the_Show_Begin.png'
import burst from './Talent_Shining_Miracle.png'
import passive1 from './Talent_Glorious_Season.png'
import passive2 from './Talent_Encore.png'
import passive3 from './Talent_With_My_Whole_Heart.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'

const char = {
  name: "Barbara",
  cardImg: card,
  thumbImg: thumb,
  star: 4,
  elementKey: "hydro",
  weaponTypeKey: "catalyst",
  gender: "F",
  constellationName: "Crater",
  titles: ["Shining Idol", "Deaconess"],
  baseStat: data.baseStat,
  specializeStat: data.specializeStat,
  formula,
  talent: {
    auto: {
      name: "Whisper of Water",
      img: normal,
      document: [{
        text: <span><strong>Normal Attack</strong> Perform up to 4 water splash attacks that deal <span className="text-hydro">Hydro DMG</span>.</span>,
        fields: data.normal.hitArr.map((percentArr, i) =>
        ({
          text: `${i + 1}-Hit DMG`,
          formulaText: stats => <span>{percentArr[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("normal", stats), stats)}</span>,
          formula: formula.normal[i],
          variant: stats => getTalentStatKeyVariant("normal", stats),
        }))
      }, {
        text: <span><strong>Charged Attack</strong> Consumes a certain amount of Stamina to deal <span className="text-hydro">AoE Hydro DMG</span> after a short casting time.</span>,
        fields: [{
          text: `Charged Attack DMG`,
          formulaText: stats => <span>{data.charged.dmg[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
          formula: formula.charged.dmg,
          variant: stats => getTalentStatKeyVariant("charged", stats),
        }, {
          text: `Stamina Cost`,
          value: `50`,
        }]
      }, {
        text: <span><strong>Plunging Attack</strong> Gathering the might of Hydro, Barbara plunges towards the ground from mid-air, damaging all enemies in her path. Deals <span className="text-hydro">AoE Hydro DMG</span> upon impact with the ground.</span>,
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
      name: "Let the Show Begin",
      img: skill,
      document: [{
        text: <span>
          <p className="mb-2">Summons water droplets resembling musical notes that form a Melody Loop, dealing <span className="text-hydro">Hydro DMG</span> to surrounding enemies and afflicting them with the <span className="text-hydro">Wet</span> status.</p>
          <h6>Melody Loop:</h6>
          <ul className="mb-0">
            <li>Barbara's Normal Attacks heal your characters in the party and nearby allied characters for a certain amount of HP, which scales with Barbara's Max HP.</li>
            <li>Her Charged Attack generates 4 times the amount of healing.</li>
            <li>Regenerates a certain amount of HP at regular intervals for your active character.</li>
            <li>Applies the <span className="text-hydro">Wet</span> status to the character and enemies who come in contact with them.</li>
          </ul>
        </span>,
        fields: [{
          text: "HP Regeneration Per Hit",
          formulaText: stats => <span>( {data.skill.hp[stats.tlvl.skill]}% {Stat.printStat("finalHP", stats)} + {data.skill.hpFlat[stats.tlvl.skill]} ) * {Stat.printStat("heal_multi", stats)}</span>,
          formula: formula.skill.regenPerHit,
          variant: "success"
        }, {
          text: "Continuous Regeneration",
          formulaText: stats => <span>( {data.skill.contHP[stats.tlvl.skill]}% {Stat.printStat("finalHP", stats)} + {data.skill.contHPFlat[stats.tlvl.skill]} ) * {Stat.printStat("heal_multi", stats)}</span>,
          formula: formula.skill.contRegen,
          variant: "success"
        }, {
          text: "Droplet DMG",
          formulaText: stats => <span>{data.skill.dmg[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.dmg,
          variant: stats => getTalentStatKeyVariant("skill", stats),
        }, {
          text: "Duration",
          value: stats => "15s" + (stats.ascension >= 4 ? " (+1s when your active character gains an Elemental Orb/Particle, up to 5s)" : ""),
        }, {
          text: "CD",
          value: stats => "32s" + (stats.constellation >= 2 ? " -15%" : ""),
        }]
      }, {
        //TODO party conditional
        conditional: stats => stats.ascension >= 1 && {
          type: "character",
          conditionalKey: "GloriousSeason",
          condition: "Glorious Season",
          sourceKey: "barbara",
          maxStack: 1,
          stats: {
            staminaDec_: 12,
          }
        }
      }, {
        conditional: stats => stats.constellation >= 2 && {
          type: "character",
          conditionalKey: "VitalityBurst",
          condition: "Vitality Burst",
          sourceKey: "barbara",
          maxStack: 1,
          stats: {
            hydro_dmg_: 15,
          }
        }
      }],

    },
    burst: {
      name: "Shining Miracle",
      img: burst,
      document: [{
        text: <span>Heals nearby allied characters and your characters in the party for a large amount of HP that scales with Barbara's Max HP.</span>,
        fields: [{
          text: "Regeneration",
          formulaText: stats => <span>( {data.burst.hp[stats.tlvl.burst]}% {Stat.printStat("finalHP", stats)} + {data.burst.flat[stats.tlvl.burst]} ) * {Stat.printStat("heal_multi", stats)}</span>,
          formula: formula.burst.regen,
          variant: "success"
        }, {
          text: "CD",
          value: "20s",
        }, {
          text: "Energy Cost",
          value: 80,
        }]
      }],
    },
    passive1: {
      name: "Glorious Season",
      img: passive1,
      document: [{ text: <span>The Stamina Consumption of characters within <b>Let the Show Begin</b>'s Melody Loop is reduced by 12%.</span> }],
    },
    passive2: {
      name: "Encore",
      img: passive2,
      document: [{ text: <span>When your active character gains an Elemental Orb/Particle, the duration of <b>Let the Show Begin</b>'s Melody Loop is extended by 1s. The maximum extension is 5s.</span> }],
    },
    passive3: {
      name: "With My Whole Heart",
      img: passive3,
      document: [{ text: <span>When a Perfect Cooking is achieved on a dish with restorative effects, Barbara has a 12% chance to obtain double the product.</span> }],
    },
    constellation1: {
      name: "Gleeful Songs",
      img: c1,
      document: [{ text: <span>Barbara regenerates 1 Energy every 10s.</span> }],
    },
    constellation2: {
      name: "Vitality Burst",
      img: c2,
      document: [{ text: <span>Decreases the CD of <b>Let the Show Begin</b> by 15%. During the ability's duration, your active character gains 15% <span className="text-hydro">Hydro DMG Bonus</span>.</span> }],
    },
    constellation3: {
      name: "Star of Tomorrow",
      img: c3,
      document: [{ text: <span>Increases the level of <b>Shining Miracle</b> by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { burst: 3 }
    },
    constellation4: {
      name: "Attentiveness be My Power",
      img: c4,
      document: [{ text: <span>Every enemy Barbara hits with her <b>Charged Attack</b> regenerates 1 Energy for her. A maximum of 5 energy can be regenerated in this manner with any one Charged Attack.</span> }],
    },
    constellation5: {
      name: "The Purest Companionship",
      img: c5,
      document: [{ text: <span>Increases the level of <b>Let the Show Begin</b> by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { skill: 3 }
    },
    constellation6: {
      name: "Dedicating Everything to You",
      img: c6,
      document: [{
        text: <span>
          <p className="mb-2">When Barbara is not on the field, and one of your characters in the party falls:</p>
          <ul className="mb-0">
            <li>Automatically revives this character.</li>
            <li>Fully regenerates this character's HP to 100%.</li>
            <li>This effect can only occur once every 15 mins.</li>
          </ul>
        </span>
      }],
    },
  },
};
export default char;
