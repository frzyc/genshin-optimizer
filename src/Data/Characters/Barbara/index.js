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
import Character from '../../../Character/Character'

//AUTO
const hitPercent = [
  [37.84, 40.68, 43.52, 47.3, 50.14, 52.98, 56.76, 60.54, 64.33, 68.11, 72.05, 77.19, 82.34, 87.49, 92.63],
  [35.52, 38.18, 40.85, 44.4, 47.06, 49.73, 53.28, 56.83, 60.38, 63.94, 67.63, 72.46, 77.29, 82.12, 86.95],
  [41.04, 44.12, 47.2, 51.3, 54.38, 57.46, 61.56, 65.66, 69.77, 73.87, 78.14, 83.72, 89.3, 94.88, 100.47],
  [55.2, 59.34, 63.48, 69, 73.14, 77.28, 82.8, 88.32, 93.84, 99.36, 105.1, 112.61, 120.12, 127.62, 135.13],
]

const charged_atk_dmg = [166.24, 178.71, 191.18, 207.8, 220.27, 232.74, 249.36, 265.98, 282.61, 299.23, 316.52, 339.13, 361.74, 384.35, 406.96]
const plunging_dmg = [56.83, 61.45, 66.08, 72.69, 77.31, 82.6, 89.87, 97.14, 104.41, 112.34, 120.27, 128.2, 136.12, 144.05, 151.98]
const plunging_dmg_low = [113.63, 122.88, 132.13, 145.35, 154.59, 165.17, 179.7, 194.23, 208.77, 224.62, 240.48, 256.34, 272.19, 288.05, 303.9]
const plunging_dmg_high = [141.93, 153.49, 165.04, 181.54, 193.1, 206.3, 224.45, 242.61, 260.76, 280.57, 300.37, 320.18, 339.98, 359.79, 379.59]

//SKILL
const letShowStats = {
  hp: [0.75, 0.81, 0.86, 0.94, 0.99, 1.05, 1.13, 1.2, 1.27, 1.35, 1.43, 1.5, 1.59, 1.69, 1.78],
  hp_flat: [72, 79, 87, 96, 105, 114, 125, 135, 147, 159, 172, 185, 199, 213, 228],
  cont_hp: [4, 4.3, 4.6, 5, 5.3, 5.6, 6, 6.4, 6.8, 7.2, 7.6, 8, 8.5, 9, 9.5],
  cont_hp_flat: [385, 424, 465, 510, 559, 610, 664, 722, 783, 847, 915, 986, 1059, 1136, 1217],
  droplet_dmg: [58.4, 62.78, 67.16, 73, 77.38, 81.76, 87.6, 93.44, 99.28, 105.12, 110.96, 116.8, 124.1, 131.4, 138.7],
}
const shiningMiracle = {
  hp: [17.6, 18.92, 20.24, 22, 23.32, 24.64, 26.4, 28.16, 29.92, 31.68, 33.44, 35.2, 37.4, 39.6, 41.8],
  flat: [1694, 1864, 2047, 2245, 2457, 2683, 2923, 3177, 3445, 3728, 4024, 4335, 4660, 4999, 5352],
}

let char = {
  name: "Barbara",
  cardImg: card,
  thumbImg: thumb,
  star: 4,
  elementKey: "hydro",
  weaponTypeKey: "catalyst",
  gender: "F",
  constellationName: "Crater",
  titles: ["Shining Idol", "Deaconess"],
  baseStat: {
    characterHP: [821, 2108, 2721, 4076, 4512, 5189, 5770, 6448, 6884, 7561, 7996, 8674, 9110, 9787],
    characterATK: [13, 34, 44, 66, 73, 84, 94, 105, 112, 123, 130, 141, 148, 159],
    characterDEF: [56, 144, 186, 279, 308, 355, 394, 441, 470, 517, 546, 593, 623, 669]
  },
  specializeStat: {
    key: "hp_",
    value: [0, 0, 0, 0, 6, 6, 12, 12, 12, 12, 18, 18, 24, 24]
  },
  talent: {
    auto: {
      name: "Whisper of Water",
      img: normal,
      document: [{
        text: <span><strong>Normal Attack</strong> Perform up to 4 water splash attacks that deal <span className="text-hydro">Hydro DMG</span>.</span>,
        fields: hitPercent.map((percentArr, i) =>
        ({
          text: `${i + 1}-Hit DMG`,
          basicVal: (tlvl, stats, c) => <span>{percentArr[tlvl]}% {Stat.printStat(Character.getTalentStatKey("normal", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (percentArr[tlvl] / 100) * stats[Character.getTalentStatKey("normal", c)],
          formula: (tlvl, stats, c) => ({ [Character.getTalentStatKey("normal", c)]: percentArr[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("normal", c),
        }))
      }, {
        text: <span><strong>Charged Attack</strong> Consumes a certain amount of Stamina to deal <span className="text-hydro">AoE Hydro DMG</span> after a short casting time.</span>,
        fields: [{
          text: `Charged Attack DMG`,
          basicVal: (tlvl, stats, c) => <span>{charged_atk_dmg[tlvl]}% {Stat.printStat(Character.getTalentStatKey("charged", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (charged_atk_dmg[tlvl] / 100) * stats[Character.getTalentStatKey("charged", c)],
          formula: (tlvl, stats, c) => ({ [Character.getTalentStatKey("charged", c)]: charged_atk_dmg[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("charged", c),
        }, {
          text: `Stamina Cost`,
          value: `50`,
        }]
      }, {
        text: <span><strong>Plunging Attack</strong> Gathering the might of Hydro, Barbara plunges towards the ground from mid-air, damaging all enemies in her path. Deals <span className="text-hydro">AoE Hydro DMG</span> upon impact with the ground.</span>,
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
          formula: (tlvl, stats, c) => ({ [Character.getTalentStatKey("plunging", c)]: plunging_dmg_low[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("plunging", c),
        }, {
          text: `High Plunge DMG`,
          basicVal: (tlvl, stats, c) => <span>{plunging_dmg_high[tlvl]}% {Stat.printStat(Character.getTalentStatKey("plunging", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (plunging_dmg_high[tlvl] / 100) * stats[Character.getTalentStatKey("plunging", c)],
          formula: (tlvl, stats, c) => ({ [Character.getTalentStatKey("plunging", c)]: plunging_dmg_high[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("plunging", c),
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
          basicVal: (tlvl, stats, c) => <span>( {letShowStats.hp[tlvl]}% {Stat.printStat("finalHP", stats)} + {letShowStats.hp_flat[tlvl]} ) * {Stat.printStat("heal_multi", stats)}</span>,
          finalVal: (tlvl, stats, c) => ((letShowStats.hp[tlvl] / 100) * stats.finalHP + letShowStats.hp_flat[tlvl]) * stats.heal_multi,
          formula: (tlvl) => ({ heal_multi: { finalHP: letShowStats.hp[tlvl] / 100, flat: letShowStats.hp_flat[tlvl] } }),
          variant: "success"
        }, {
          text: "Continuous Regeneration",
          basicVal: (tlvl, stats, c) => <span>( {letShowStats.cont_hp[tlvl]}% {Stat.printStat("finalHP", stats)} + {letShowStats.cont_hp_flat[tlvl]} ) * {Stat.printStat("heal_multi", stats)}</span>,
          finalVal: (tlvl, stats, c) => ((letShowStats.cont_hp[tlvl] / 100) * stats.finalHP + letShowStats.cont_hp_flat[tlvl]) * stats.heal_multi,
          formula: (tlvl) => ({ heal_multi: { finalHP: letShowStats.cont_hp[tlvl] / 100, flat: letShowStats.cont_hp_flat[tlvl] } }),
          variant: "success"
        }, {
          text: "Droplet DMG",
          basicVal: (tlvl, stats, c) => <span>{letShowStats.droplet_dmg[tlvl]}% {Stat.printStat(Character.getTalentStatKey("skill", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (letShowStats.droplet_dmg[tlvl] / 100) * stats[Character.getTalentStatKey("skill", c)],
          formula: (tlvl, stats, c) => ({ [Character.getTalentStatKey("skill", c)]: letShowStats.droplet_dmg[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("skill", c),
        }, (c, a) => ({
          text: "Duration",
          value: "15s" + (a >= 4 ? " +1s when your active character gains an Elemental Orb/Particle, up to 5s" : ""),
        }), (c) => ({
          text: "CD",
          value: "32s" + (c >= 2 ? " -15%" : ""),
        })]
      }, {
        //TODO party conditional
        conditional: (tlvl, c, a) => a >= 1 && {
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
        conditional: (tlvl, c, a) => c >= 2 && {
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
          basicVal: (tlvl, stats, c) => <span>{shiningMiracle.hp[tlvl]}% {Stat.printStat("finalHP", stats)} + {shiningMiracle.flat[tlvl]}</span>,
          finalVal: (tlvl, stats, c) => (shiningMiracle.hp[tlvl] / 100) * stats.finalHP + shiningMiracle.flat[tlvl],
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
          When Barbara is not on the field, and one of your characters in the party falls:
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
