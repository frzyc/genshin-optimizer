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
import Character from '../../../Character/Character'
//import DisplayPercent from '../../../Components/DisplayPercent'

//AUTO

const hitPercent = [
  [37.6, 40.42, 43.24, 47, 49.82, 52.64, 56.4, 60.16, 63.92, 67.68, 71.44, 75.2, 79.9, 84.6, 89.3],
  [36, 38.7, 41.4, 45, 47.7, 50.4, 54, 57.6, 61.2, 64.8, 68.4, 72, 76.5, 81, 85.5],
  [44.8, 48.16, 51.52, 56, 59.36, 62.72, 67.2, 71.68, 76.16, 80.64, 85.12, 89.6, 95.2, 100.8, 106.4],
  [56.16, 60.37, 64.58, 70.2, 74.41, 78.62, 84.24, 89.86, 95.47, 101.09, 106.7, 112.32, 119.34, 126.36, 133.38],
]

const charged_atk = [149.72, 160.95, 172.18, 187.15, 198.38, 209.61, 224.58, 239.55, 254.52, 269.5, 285.07, 305.43, 325.79, 346.15, 366.51]
const plunging_dmg = [56.83, 61.45, 66.08, 72.69, 77.31, 82.6, 89.87, 97.14, 104.41, 112.34, 120.27, 128.2, 136.12, 144.05, 151.98]
const plunging_dmg_low = [113.63, 122.88, 132.13, 145.35, 154.59, 165.17, 179.7, 194.23, 208.77, 224.62, 240.48, 256.34, 272.19, 288.05, 303.9]
const plunging_dmg_high = [141.93, 153.49, 165.04, 181.54, 193.1, 206.3, 224.45, 242.61, 260.76, 280.57, 300.37, 320.18, 339.98, 359.79, 379.59]

//SKILL
const eleSkill = {
  skill_dmg: [132.8, 142.76, 152.72, 166, 175.96, 185.92, 199.2, 212.48, 225.76, 239.04, 252.32, 265.6, 282.2, 298.8, 315.4],
  dot: [32, 34.4, 36.8, 40, 42.4, 44.8, 48, 51.2, 54.4, 57.6, 60.8, 64, 68, 72, 76]
}

//BURST
const eleBurst = {
  bubble_explosion: [442.4, 475.58, 508.76, 553, 586.18, 619.36, 663.6, 707.84, 752.08, 796.32, 840.56, 884.8, 940.1, 995.4, 1050.7],
  dmg_: [42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 60, 60, 60, 60, 60],
  omen_duration: [4, 4, 4, 4.5, 4.5, 4.5, 5, 5, 5, 5, 5, 5, 5, 5, 5]
}

let char = {
  name: "Mona",
  cardImg: card,
  thumbImg: thumb,
  star: 5,
  elementKey: "hydro",
  weaponTypeKey: "catalyst",
  gender: "F",
  constellationName: "Astrolabos",
  titles: ["Astral Reflection", "Enigmatic Astrologer"],
  baseStat: {
    characterHP: [810, 2102, 2797, 4185, 4678, 5383, 6041, 6752, 7246, 7964, 8458, 9184, 9677, 10409],
    characterATK: [22, 58, 77, 115, 129, 148, 167, 186, 200, 220, 233, 253, 267, 287],
    characterDEF: [51, 132, 176, 263, 294, 338, 379, 424, 455, 500, 531, 576, 607, 653]
  },
  specializeStat: {
    key: "enerRech_",
    value: [0, 0, 0, 0, 8, 8, 16, 16, 16, 16, 24, 24, 32, 32]
  },
  talent: {
    auto: {
      name: "Ripple of Fate",
      img: normal,
      infusable: false,
      document: [{
        text: <span><strong>Normal Attack</strong> Perform up to 4 water splash attacks that deal <span className="text-hydro">Hydro DMG</span>.</span>,
        fields: hitPercent.map((percentArr, i) =>
        ({
          text: `${i + 1}-Hit DMG`,
          basicVal: (tlvl, stats, c) => <span>{percentArr[tlvl]}% {Stat.printStat(Character.getTalentStatKey("normal", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (percentArr[tlvl] / 100) * stats[Character.getTalentStatKey("normal", c)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("normal", c)]: percentArr[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("normal", c),
        }))
      }, {
        text: <span><strong>Charged Attack</strong> Consumes a certain amount of Stamina to deal <span className="text-hydro">AoE Hydro DMG</span> after a short casting time.</span>,
        fields: [{
          text: `Charged Attack DMG`,
          basicVal: (tlvl, stats, c) => <span>{charged_atk[tlvl]}% {Stat.printStat(Character.getTalentStatKey("charged", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (charged_atk[tlvl] / 100) * stats[Character.getTalentStatKey("charged", c)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("charged", c)]: charged_atk[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("charged", c),
        }, {
          text: `Stamina Cost`,
          value: 50,
        }]
      }, {
        text: <span><strong>Plunging Attack</strong> Gathering the might of Hydro, Mona plunges towards the ground from mid-air, damaging all opponents in her path. Deals <span className="text-hydro">AoE Hydro DMG</span> upon impact with the ground.</span>,
        fields: [{
          text: `Plunge DMG`,
          basicVal: (tlvl, stats, c) => <span>{plunging_dmg[tlvl]}% {Stat.printStat(Character.getTalentStatKey("plunging", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (plunging_dmg[tlvl] / 100) * stats[Character.getTalentStatKey("plunging", c)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("plunging", c)]: plunging_dmg[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("plunging", c),
        }, {
          text: `Low Plunge DMG`,
          basicVal: (tlvl, stats, c) => <span>{plunging_dmg_low[tlvl]}% {Stat.printStat(Character.getTalentStatKey("plunging", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (plunging_dmg_low[tlvl] / 100) * stats[Character.getTalentStatKey("plunging", c)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("plunging", c)]: plunging_dmg_low[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("plunging", c),
        }, {
          text: `High Plunge DMG`,
          basicVal: (tlvl, stats, c) => <span>{plunging_dmg_high[tlvl]}% {Stat.printStat(Character.getTalentStatKey("plunging", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (plunging_dmg_high[tlvl] / 100) * stats[Character.getTalentStatKey("plunging", c)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("plunging", c)]: plunging_dmg_high[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("plunging", c),
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
          basicVal: (tlvl, stats, c) => <span>{eleSkill.dot[tlvl]}% {Stat.printStat(Character.getTalentStatKey("skill", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (eleSkill.dot[tlvl] / 100) * stats[Character.getTalentStatKey("skill", c)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("skill", c)]: eleSkill.dot[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("skill", c),
        }, {
          text: "Explosion DMG",
          basicVal: (tlvl, stats, c) => <span>{eleSkill.skill_dmg[tlvl]}% {Stat.printStat(Character.getTalentStatKey("skill", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (eleSkill.skill_dmg[tlvl] / 100) * stats[Character.getTalentStatKey("skill", c)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("skill", c)]: eleSkill.skill_dmg[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("skill", c),
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
          basicVal: (tlvl, stats, c) => <span>{eleBurst.bubble_explosion[tlvl]}% {Stat.printStat(Character.getTalentStatKey("burst", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (eleBurst.bubble_explosion[tlvl] / 100) * stats[Character.getTalentStatKey("burst", c)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("burst", c)]: eleBurst.bubble_explosion[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("burst", c),
        }, {
          text: "CD",
          value: "15s",
        }, {
          text: "Energy Cost",
          value: 60,
        }],
        conditional: (tlvl, c, a) => {
          let c1 = c >= 1 ? {
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
              dmg_: eleBurst.dmg_[tlvl],
              ...c1,
              //TODO frozen duration as a stat 
            },
            fields: [(c, a) => c >= 1 && {
              text: <span><span className="text-cryo">Frozen</span> Duration Increase</span>,
              value: "15%",
              variant: "cryo",
            }, {
              text: "Omen Duration",
              value: (tlvl, stats, c) => `${eleBurst.omen_duration[tlvl]}s`,
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
        fields: [(con, a) => a >= 1 && {
          text: "Explosion DMG",
          basicVal: (tlvl, stats, c) => <span>{eleSkill.skill_dmg[Character.getTalentLevelKey(c, "skill")]}% * 50% {Stat.printStat(Character.getTalentStatKey("skill", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (eleSkill.skill_dmg[Character.getTalentLevelKey(c, "skill")] / 200) * stats[Character.getTalentStatKey("skill", c)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("skill", c)]: eleSkill.skill_dmg[Character.getTalentLevelKey(c, "skill")] / 200 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("skill", c),
        }, (c, a) => a >= 1 && {
          text: "Phantom Duration",
          value: "2s"
        }]
      }],
    },
    passive2: {
      name: "Waterborne Destiny",
      img: passive2,
      document: [{ text: <span>Increases Mona's <span className="text-hydro">Hydro DMG Bonus</span> by a degree equivalent to 20% of her Energy Recharge rate.</span>, }],
      stats: (c, a) => a >= 4 && {
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
        conditional: (tlvl, c, a) => c >= 4 && {//TODO party conditional
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
        conditional: (tlvl, c, a) => c >= 6 && {
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
