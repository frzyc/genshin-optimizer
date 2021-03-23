import card from './Character_Mona_Card.jpg'
import thumb from './Character_Mona_Thumb.png'
import c1 from './Constellation_Prophecy_of_Submersion.png'
import c2 from './Constellation_Lunar_Chain.png'
import c3 from './Constellation_Restless_Revolution.png'
import c4 from './Constellation_Prophecy_of_Oblivion.png'
import c5 from './Constellation_Mockery_of_Fortuna.png'
import c6 from './Constellation_Rhetorics_of_Calamitas.png'
import normal from './Talent_Ripple_of_Fate.png'
import skill from './Talent_Mirror_Reflection_of_Doom.png'
import burst from './Talent_Stellaris_Phantasm.png'
import sprint from './Talent_Illusory_Torrent.png'
import passive1 from './Talent_Come_\'n\'_Get_Me,_Hag.png'
import passive2 from './Talent_Waterborne_Destiny.png'
import passive3 from './Talent_Principium_of_Astrology.png'
import Stat from '../../../Stat'
import formula, { data } from './data'
import { getTalentStatKey, getTalentStatKeyVariant } from '../../../Build/Build'

const char = {
  name: "Mona",
  cardImg: card,
  thumbImg: thumb,
  star: 5,
  elementKey: "hydro",
  weaponTypeKey: "catalyst",
  gender: "F",
  constellationName: "Astrolabos",
  titles: ["Astral Reflection", "Enigmatic Astrologer"],
  baseStat: data.baseStat,
  specializeStat: data.specializeStat,
  formula,
  talent: {
    auto: {
      name: "Ripple of Fate",
      img: normal,
      infusable: false,
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
          formulaText: stats => <span>{data.charged.hit[stats.tlvl.auto]}% {Stat.printStat(getTalentStatKey("charged", stats), stats)}</span>,
          formula: formula.charged.hit,
          variant: stats => getTalentStatKeyVariant("charged", stats),
        }, {
          text: `Stamina Cost`,
          value: 50,
        }]
      }, {
        text: <span><strong>Plunging Attack</strong> Gathering the might of Hydro, Mona plunges towards the ground from mid-air, damaging all opponents in her path. Deals <span className="text-hydro">AoE Hydro DMG</span> upon impact with the ground.</span>,
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
      name: "Mirror Reflection of Doom",
      img: skill,
      document: [{
        text: <span>
          <p className="mb-2">Creates an illusory Phantom of fate from coalesced waterspouts.</p>
          <p className="mb-2">The <b>Phantom</b> has the following special properties:</p>
          <ul className="mb-2">
            <li>Continuously taunts nearby opponents, attracting their fire.</li>
            <li>Each second, 4 times, deals <span className="text-hydro">AoE Hydro DMG</span>.</li>
            <li>When its duration expires, the Phantom explodes, dealing <span className="text-hydro">AoE Hydro DMG</span>.</li>
          </ul>
          <p className="mb-2"><b>Hold:</b> Utilizes water currents to move backwards swiftly before conjuring a Phantom. Only one Phantom created by Mirror Reflection of Doom can exist at any time. When the Phantom explodes and hits at least one opponent, it generates 3 elemental particles.</p>
        </span>,
        fields: [{
          text: "DoT",
          formulaText: stats => <span>{data.skill.dot[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.dot,
          variant: stats => getTalentStatKeyVariant("skill", stats),
        }, {
          text: "Explosion DMG",
          formulaText: stats => <span>{data.skill.dmg[stats.tlvl.skill]}% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.skill.dmg,
          variant: stats => getTalentStatKeyVariant("skill", stats),
        }, {
          text: "CD",
          value: "12s",
        }]
      }],
    },
    burst: {
      name: "Stellaris Phantasm",
      img: burst,
      document: [{
        text: <span>
          <p className="mb-2">Mona summons the sparkling waves and creates a reflection of the starry sky, applying the Illusory Bubble status to the opponents in a large AoE.</p>
          <p className="mb-2"><b>Illusory Bubble:</b> Traps opponents inside a pocket of destiny and also makes them <span className="text-hydro">Wet</span>. Renders weaker opponents immobile. When an opponent affected by Illusory Bubble sustains DMG, it has the following effects:</p>
          <ul className="mb-2">
            <li>Applies an <b>Omen</b> to the opponent, which gives a DMG Bonus, also increasing the DMG of the attack that causes it.</li>
            <li>Removes the Illusory Bubble, dealing <span className="text-hydro">Hydro DMG</span> in the process.</li>
          </ul>
          <p className="mb-2"><b>Omen:</b> During its duration, increases DMG taken by opponents.</p>
        </span>,
        fields: [{
          text: "Illusory Bubble Duration",
          value: "8s",
        }, {
          text: "Illusory Bubble Explosion DMG",
          formulaText: stats => <span>{data.burst.bubble_explosion[stats.tlvl.burst]}% {Stat.printStat(getTalentStatKey("burst", stats), stats)}</span>,
          formula: formula.burst.bubble_explosion,
          variant: stats => getTalentStatKeyVariant("burst", stats),
        }, {
          text: "CD",
          value: "15s",
        }, {
          text: "Energy Cost",
          value: 60,
        }],
        conditional: stats => {
          const c1 = stats.constellation >= 1 ? {
            electrocharged_dmg_: 15,
            vaporize_dmg_: 15,
            swirl_dmg_: 15
          } : {}
          return {
            type: "character",
            conditionalKey: "StellarisPhantasm",
            condition: "Stellaris Phantasm",
            sourceKey: "mona",
            maxStack: 1,
            stats: {
              dmg_: data.burst.dmg_[stats.tlvl.burst],
              ...c1,
              //TODO frozen duration as a stat 
            },
            fields: [stats => stats.constellation >= 1 && {
              text: <span><span className="text-cryo">Frozen</span> Duration Increase</span>,
              value: "15%",
              variant: "cryo",
            }, {
              text: "Omen Duration",
              value: stats => `${data.burst.omen_duration[stats.tlvl.burst]}s`,
            }]
          }
        },
      }],
    },
    sprint: {
      name: "Illusory Torrent",
      img: sprint,
      document: [{
        text: <span>
          <p className="mb-2">Mona cloaks herself within the water's flow, consuming stamina to move rapidly.</p>
          <p className="mb-2">When under the effect of Illusory Torrent, Mona can move at high speed on water. Applies the <span className="text-hydro">Wet</span> status to nearby opponents when she reappears.</p>
        </span>,
        fields: [{
          text: "Activation Stamina Consumption",
          value: 10,
        }, {
          text: "Stamina Drain",
          value: "15/s",
        }]
      }],
    },
    passive1: {
      name: "Come 'n' Get Me, Hag!",
      img: passive1,
      document: [{
        text: <span>
          <p className="mb-2">After she has used <b>Illusory Torrent</b> for 2s, if there are any opponents nearby, Mona will automatically create a Phantom.</p>
          <p className="mb-2">A Phantom created in this manner lasts for 2s, and its explosion DMG is equal to 50% of <b>Mirror Reflection of Doom</b>.</p>
        </span>,
        fields: [stats => stats.ascension >= 1 && {
          text: "Explosion DMG",
          formulaText: stats => <span>{data.skill.dmg[stats.tlvl.skill]}% * 50% {Stat.printStat(getTalentStatKey("skill", stats), stats)}</span>,
          formula: formula.passive1.hit,
          variant: stats => getTalentStatKeyVariant("skill", stats),
        }, stats => stats.ascension >= 1 && {
          text: "Phantom Duration",
          value: "2s"
        }]
      }],
    },
    passive2: {
      name: "Waterborne Destiny",
      img: passive2,
      document: [{ text: <span>Increases Mona's <span className="text-hydro">Hydro DMG Bonus</span> by a degree equivalent to 20% of her Energy Recharge rate.</span>, }],
      stats: stats => stats.ascension >= 4 && {
        modifiers: { hydro_dmg_: { enerRech_: 0.2 } },
      }
    },
    passive3: {
      name: "Principium of Astrology",
      img: passive3,
      document: [{ text: <span>When Mona crafts Weapon Ascension Materials, she has a 25% chance to refund one count of one material out of all the crafting materials used.</span> }],
    },
    constellation1: {
      name: "Prophecy of Submersion",
      img: c1,
      document: [{
        text: <span>
          <p className="mb-2">The effects of <span className="text-hydro">Hydro-related Elemental Reactions</span> are enhanced for 8s after any of your characters in the party hit an opponent affected by an <b>Omen</b>:</p>
          <ul className="mb-2">
            <li><span className="text-electrocharged">Electro-Charged DMG</span> is increased by 15%.</li>
            <li><span className="text-vaporize">Vaporize DMG</span> is increased by 15%.</li>
            <li><span className="text-hydro">Hydro</span> <span className="text-swirl">Swirl DMG</span> is increased by 15%.</li>
            <li>The duration for which enemies are <span className="text-cryo">Frozen</span> is increased by 15%.</li>
          </ul>
        </span>
      }],
    },
    constellation2: {
      name: "Lunar Chain",
      img: c2,
      document: [{ text: <span>When a <b>Normal Attack</b> hits, there is a 20% chance that it will be automatically followed by a <b>Charged Attack</b>. This effect can only occur once every 5s.</span> }],
    },
    constellation3: {
      name: "Restless Revolution",
      img: c3,
      document: [{ text: <span>Increases the Level of <b>Stellaris Phantasm</b> by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { burst: 3 }
    },
    constellation4: {
      name: "Prophecy of Oblivion",
      img: c4,
      document: [{
        text: <span>When any character in the party attacks an opponent affected by the Omen status effect, their CRIT Rate is increased by 15%.</span>,
        conditional: stats => stats.constellation >= 4 && {//TODO party conditional
          type: "character",
          conditionalKey: "ProphecyOfOblivion",
          condition: "Prophecy of Oblivion",
          sourceKey: "mona",
          maxStack: 1,
          stats: {
            critRate_: 15,
          },
        },
      }],
    },
    constellation5: {
      name: "Mockery of Fortuna",
      img: c5,
      document: [{ text: <span>Increase the Level of <b>Mirror Reflection of Doom</b> by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { skill: 3 }
    },
    constellation6: {
      name: "Rhetorics of Calamitas",
      img: c6,
      document: [{
        text: <span>Upon entering <b>Illusory Torrent</b>, Mona gains a 60% increase to the DMG her next Charged Attack per second of movement. A maximum DMG Bonus of 180% can be achieved in this manner. The effect lasts for no more than 8s.</span>,
        conditional: stats => stats.constellation >= 6 && {
          type: "character",
          conditionalKey: "RhetoricsOfCalamitas",
          condition: "Rhetorics of Calamitas",
          sourceKey: "mona",
          maxStack: 3,
          stats: {
            charged_dmg_: 60,
          },
          fields: [{
            text: "Duration",
            value: "8s"
          }]
        },
      }],
    }
  },
};
export default char;
