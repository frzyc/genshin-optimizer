import card from './Character_Venti_Card.jpg'
import thumb from './Character_Venti_Thumb.png'
import c1 from './Constellation_Splitting_Gales.png'
import c2 from './Constellation_Breeze_of_Reminiscence.png'
import c3 from './Constellation_Ode_to_Thousand_Winds.png'
import c4 from './Constellation_Hurricane_of_Freedom.png'
import c5 from './Constellation_Concerto_dal_Cielo.png'
import c6 from './Constellation_Storm_of_Defiance.png'
import normal from './Talent_Divine_Marksmanship.png'
import skill from './Talent_Skyward_Sonnet.png'
import burst from './Talent_Wind\'s_Grand_Ode.png'
import passive1 from './Talent_Embrace_of_Winds.png'
import passive2 from './Talent_Stormeye.png'
import passive3 from './Talent_Windrider.png'
import ElementalData from '../../ElementalData'
import Character from '../../../Character/Character'
import Stat from '../../../Stat'

//AUTO

const hitPercent = [
  [20.38, 22.04, 23.7, 26.07, 27.73, 29.63, 32.23, 34.84, 37.45, 40.29, 43.55, 47.38, 51.21, 55.05, 59.23],//1
  [44.38, 47.99, 51.6, 56.76, 60.37, 64.5, 70.18, 75.85, 81.53, 87.72, 94.82, 103.16, 111.5, 119.85, 128.95],//2
  [52.37, 56.64, 60.9, 66.99, 71.25, 76.13, 82.82, 89.52, 96.22, 103.53, 111.9, 121.75, 131.6, 141.45, 152.19],//3
  [26.06, 28.18, 30.3, 33.33, 35.45, 37.87, 41.21, 44.54, 47.87, 51.51, 55.68, 60.58, 65.48, 70.37, 75.72],//4
  [50.65, 54.78, 58.9, 64.79, 68.91, 73.63, 80.1, 86.58, 93.06, 100.13, 108.23, 117.75, 127.28, 136.8, 147.19],//5
  [70.95, 76.73, 82.5, 90.75, 96.53, 103.13, 112.2, 121.28, 130.35, 140.25, 151.59, 164.93, 178.27, 191.61, 206.17],//6
]

const aimed = [43.86, 47.43, 51, 56.1, 59.67, 63.75, 69.36, 74.97, 80.58, 86.7, 93.71, 101.96, 110.21, 118.45, 127.45]
const aimed_full = [124, 133.3, 142.6, 155, 164.3, 173.6, 186, 198.4, 210.8, 223.2, 236.1, 252.96, 269.82, 286.69, 303.55]
const plunging_dmg = [56.83, 61.45, 66.08, 72.69, 77.31, 82.6, 89.87, 97.14, 104.41, 112.34, 120.27, 128.2, 136.12, 144.05, 151.98]
const plunging_dmg_low = [113.63, 122.88, 132.13, 145.35, 154.59, 165.17, 179.7, 194.23, 208.77, 224.62, 240.48, 256.34, 272.19, 288.05, 303.9]
const plunging_dmg_high = [141.93, 153.49, 165.04, 181.54, 193.1, 206.3, 224.45, 242.61, 260.76, 280.57, 300.37, 320.18, 339.98, 359.79, 379.59]

//SKILL
const sonnet = {
  press_dmg: [276, 296.7, 317.4, 345, 365.7, 386.4, 414, 441.6, 469.2, 496.8, 524.4, 552, 586.5, 621, 655.5],
  hold_dmg: [380, 408.5, 437, 475, 503.5, 532, 570, 608, 646, 684, 722, 760, 807.5, 855, 902.5],
}

//BURST
const ode = {
  dot: [37.6, 40.42, 43.24, 47, 49.82, 52.64, 56.4, 60.16, 63.92, 67.68, 71.44, 75.2, 79.9, 84.6, 89.3],
}

let char = {
  name: "Venti",
  cardImg: card,
  thumbImg: thumb,
  star: 5,
  elementKey: "anemo",
  weaponTypeKey: "bow",
  gender: "M",
  constellationName: "Carmen Dei",
  titles: ["Windborne Bard", "Tone-Deaf Bard"],
  baseStat: {
    characterHP: [820, 2127, 2830, 4234, 4734, 5446, 6112, 6832, 7331, 8058, 8557, 9292, 9791, 10531],
    characterATK: [20, 53, 71, 106, 118, 136, 153, 171, 183, 201, 214, 232, 245, 263],
    characterDEF: [52, 135, 180, 269, 301, 346, 388, 434, 465, 512, 543, 590, 622, 669]
  },
  specializeStat: {
    key: "enerRech_",
    value: [0, 0, 0, 0, 8, 8, 16, 16, 16, 16, 24, 24, 32, 32]
  },
  talent: {
    auto: {
      name: "Divine Marksmanship",
      img: normal,
      infusable: false,
      document: [{
        text: <span><strong>Normal Attack</strong> Perform up to 6 consecutive shots with a bow. <small><i>Note: the 1st and 4th attack hits twice.</i></small></span>,
        fields: hitPercent.map((percentArr, i) =>
        ({
          text: `${i + 1}-Hit DMG`,
          basicVal: (tlvl, stats, c) => <span>{percentArr[tlvl]}% {Stat.printStat(Character.getTalentStatKey("normal", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (percentArr[tlvl] / 100) * stats[Character.getTalentStatKey("normal", c)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("normal", c)]: percentArr[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("normal", c),
        }))
      }, {
        text: <span><strong>Charged Attack</strong> Perform a more precise Aimed Shot with increased DMG. While aiming, favorable winds will accumulate on the arrowhead. A fully charged wind arrow will deal <span className="text-anemo">Anemo DMG</span>.</span>,
        fields: [{
          text: `Aimed Shot DMG`,
          basicVal: (tlvl, stats, c) => <span>{aimed[tlvl]}% {Stat.printStat(Character.getTalentStatKey("charged", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (aimed[tlvl] / 100) * stats[Character.getTalentStatKey("charged", c)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("charged", c)]: aimed[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("charged", c),
        }, {
          text: <span>Fully-Charged Aimed Shot DMG</span>,
          basicVal: (tlvl, stats, c) => <span>{aimed_full[tlvl]}% {Stat.printStat(Character.getTalentStatKey("charged", c, true), stats)}</span>,
          finalVal: (tlvl, stats, c) => (aimed_full[tlvl] / 100) * stats[Character.getTalentStatKey("charged", c, true)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("charged", c, true)]: aimed_full[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("charged", c, true),
        },]
      }, (c) => c >= 1 && {
        text: <span><strong>Splitting Gales: </strong> Fires 2 additional split arrows per Aimed Shot</span>,
        fields: [{
          text: `Additional Aimed Shot DMG`,
          basicVal: (tlvl, stats, c) => <span>{(aimed[tlvl] * 0.33)?.toFixed(2)}% {Stat.printStat(Character.getTalentStatKey("charged", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (aimed[tlvl] * 0.33 / 100) * stats[Character.getTalentStatKey("charged", c)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("charged", c)]: aimed[tlvl] * 0.33 / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("charged", c),
        }, {
          text: `Additional Full-Charged Aimed Shot DMG`,
          basicVal: (tlvl, stats, c) => <span>{(aimed_full[tlvl] * 0.33)?.toFixed(2)}% {Stat.printStat(Character.getTalentStatKey("charged", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (aimed_full[tlvl] * 0.33 / 100) * stats[Character.getTalentStatKey("charged", c)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("charged", c)]: aimed_full[tlvl] * 0.33 / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("charged", c),
        }]
      }, {
        text: <span><strong>Plunging Attack</strong> Fires off a shower of arrows in mid-air before falling and striking the ground, dealing AoE DMG upon impact.</span>,
        fields: [{
          text: `Plunge DMG`,
          basicVal: (tlvl, stats, c) => <span>{plunging_dmg[tlvl]}% {Stat.printStat(Character.getTalentStatKey("plunging", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (plunging_dmg[tlvl] / 100) * stats[Character.getTalentStatKey("plunging", c)],
          formula: (tlvl, stats, c) => ({ [Character.getTalentStatKey("plunging", c)]: plunging_dmg[tlvl] / 100 }),
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
      name: "Skyward Sonnet",
      img: skill,
      document: [{
        text: <span>
          <p className="mb-2">
            O wind upon which all hymns and songs fly, bear these earth-walkers up into the sky!
          </p>
          <p className="mb-2">
            <strong>Press:</strong> Summons a Wind Domain at the opponent's location, dealing AoE Anemo DMG and launching opponents into the air.
          </p>
          <p className="mb-2">
            <strong>Hold:</strong> Summons an even larger Wind Domain with Venti as the epicenter, dealing AoE Anemo DMG and launching affected opponents into the air. After unleashing the Hold version of this ability, Venti rides the wind into the air.
            Opponents hit by Skyward Sonnet will fall to the ground slowly.
            Generate 3/4 elemental particles for press/hold when it hit at least 1 target.
          </p>
        </span>,
        fields: [{
          text: "Press DMG",
          basicVal: (tlvl, stats, c) => <span>{sonnet.press_dmg[tlvl]}% {Stat.printStat(Character.getTalentStatKey("skill", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (sonnet.press_dmg[tlvl] / 100) * stats[Character.getTalentStatKey("skill", c)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("skill", c)]: sonnet.press_dmg[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("skill", c),
        }, {
          text: "Press CD",
          value: "6s",
        }, {
          text: "Hold DMG",
          basicVal: (tlvl, stats, c) => <span>{sonnet.hold_dmg[tlvl]}% {Stat.printStat(Character.getTalentStatKey("skill", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (sonnet.hold_dmg[tlvl] / 100) * stats[Character.getTalentStatKey("skill", c)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("skill", c)]: sonnet.hold_dmg[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("skill", c),
        }, {
          text: "Hold CD",
          value: "15s",
        }, (c, a) => a >= 1 && {
          text: "Upcurrent Duration",
          value: "20s",
        }],
        conditional: (tlvl, c, a) => c >= 2 && [{
          type: "character",
          conditionalKey: "HurricaneOfFreedom",
          condition: "Breeze of Reminiscence",
          sourceKey: "venti",
          maxStack: 1,
          stats: {
            anemo_enemyRes_: -12,
          },
        }, {
          type: "character",
          conditionalKey: "HurricaneOfFreedom",
          condition: "Breeze of Reminiscence Launch",
          sourceKey: "venti",
          maxStack: 1,
          stats: {
            anemo_enemyRes_: -24,
            physical_enemyRes_: -12
          },
        }]
      }],
    },
    burst: {
      name: "Wind's Grand Ode",
      img: burst,
      document: [{
        text: <span>
          <p className="mb-2">
            Fires off an arrow made of countless coalesced winds, creating a huge Stormeye that sucks in objects and opponents along its path, dealing 18 times <span className="text-anemo">Anemo DMG</span> in 8 seconds.
          </p>
          <p className="mb-2">
            <strong>Elemental Absorption:</strong> If the Stormeye comes into contact with <span className="text-hydro">Hydro</span>/<span className="text-pyro">Pyro</span>/<span className="text-cryo">Cryo</span>/<span className="text-electro">Electro</span> elements, it will deal 50% additional elemental DMG of that type. Elemental Absorption may only occur once per use.
          </p>
        </span>,
        fields: [{
          text: "DoT",
          basicVal: (tlvl, stats, c) => <span>{ode.dot[tlvl]}% {Stat.printStat(Character.getTalentStatKey("burst", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (ode.dot[tlvl] / 100) * stats[Character.getTalentStatKey("burst", c)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("burst", c)]: ode.dot[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("burst", c),
        }, {
          text: "Duration",
          value: "8s",
        }, {
          text: "CD",
          value: "15s",
        }, {
          text: "Energy Cost",
          value: 60,
        }, (c, a) => a >= 4 && {
          text: <span>Regen 15 Energy to Venti after effect ends.</span>,
        }, (c, a) => c >= 6 && {
          text: <span>Enemy <span className="text-anemo">Anemo RES</span> decrease</span>,
          value: "20%"
        }],
        conditional: (["hydro", "pyro", "cryo", "electro"]).map(eleKey => ({
          type: "character",
          conditionalKey: "Absorption",
          condition: <span><span className={`text-${eleKey}`}><b>{ElementalData[eleKey].name}</b></span> Absorption</span>,
          sourceKey: "venti",
          maxStack: 1,
          fields: [{
            text: "Dot",
            basicVal: (tlvl, stats, c) => <span>{(ode.dot[tlvl] / 2)?.toFixed(2)}% {Stat.printStat(`${eleKey}_burst_${c.hitMode}`, stats)}</span>,
            finalVal: (tlvl, stats, c) => (ode.dot[tlvl] / 2 / 100) * stats[`${eleKey}_burst_${c.hitMode}`],
            formula: (tlvl, _, c) => ({ [`${eleKey}_burst_${c.hitMode}`]: ode.dot[tlvl] / 2 / 100 }),
          }, (c, a) => a >= 4 && {
            text: <span>Regen 15 Energy to all <span className={`text-${eleKey}`}>{ElementalData[eleKey].name}</span> characters.</span>,
          }, (c, a) => c >= 6 && {
            text: <span>Enemy <span className={`text-${eleKey}`}>{ElementalData[eleKey].name} RES</span> decrease</span>,
            value: "20%"
          }]
        }))
      }],
    },
    passive1: {
      name: "Embrace of Winds",
      img: passive1,
      document: [{ text: <span>Holding <b>Skyward Sonnet</b> creates an upcurrent that lasts for 20s.</span> }],
    },
    passive2: {
      name: "Stormeye",
      img: passive2,
      document: [{ text: <span>Regenerates 15 Energy for Venti after the effects of <b>Wind's Grand Ode</b> end. If an Elemental Absorption occurred, this also restores 15 Energy to all characters of that corresponding element.</span> }],
    },
    passive3: {
      name: "Windrider",
      img: passive3,
      document: [{
        text: <span>
          Decreases gliding Stamina consumption for your own party members by 20%.
          Not stackable with Passive Talents that provide the exact same effects.
      </span>
      }],
      stats: {
        staminaGlidingDec_: 20,
      }
    },
    constellation1: {
      name: "Splitting Gales",
      img: c1,
      document: [{ text: <span>Fires 2 additional split arrows per Aimed Shot, each dealing 33% of the original arrow's DMG.</span> }],
    },
    constellation2: {
      name: "Breeze of Reminiscence",
      img: c2,
      document: [{ text: <span>Skyward Sonnet decreases enemy <span className="text-anemo">Anemo RES</span> by 12% for 10s. Enemies launched by Skyward Sonnet suffer an additional 12% <span className="text-anemo">Anemo RES</span> and <span className="text-physical">Physical RES</span> penalty when airborne.</span> }],
    },
    constellation3: {
      name: "Ode to Thousand Winds",
      img: c3,
      document: [{ text: <span>Increases the level of <b>Wind's Grand Ode</b> by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { burst: 3 }
    },
    constellation4: {
      name: "Hurricane of Freedom",
      img: c4,
      document: [{
        text: <span>When Venti picks up an Elemental Orb or Particle, he receives a 25% Anemo DMG Bonus for 10s.</span>,
        conditional: (tlvl, c, a) => c >= 4 && {
          type: "character",
          conditionalKey: "HurricaneOfFreedom",
          condition: "Hurricane of Freedom",
          sourceKey: "venti",
          maxStack: 1,
          stats: {
            anemo_dmg_: 15,
          },
          fields: [{
            text: "Duration",
            value: "10s",
          }]
        }
      }],
    },
    constellation5: {
      name: "Concerto dal Cielo",
      img: c5,
      document: [{ text: <span>Increases the level of <b>Skyward Sonnet</b> by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { skill: 3 }
    },
    constellation6: {
      name: "Storm of Defiance",
      img: c6,
      document: [{ text: <span>Targets who take DMG from Wind's Grand Ode have their <span className="text-anemo">Anemo RES</span> decreased by 20%. If an Elemental Absorption occurred, then their RES towards the corresponding Element is also decreased by 20%.</span> }],
    }
  },
};
export default char;
