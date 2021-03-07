import card from './Character_Bennett_Card.jpg'
import thumb from './Character_Bennett_Thumb.png'
import c1 from './Constellation_Grand_Expectation.png'
import c2 from './Constellation_Impasse_Conqueror.png'
import c3 from './Constellation_Unstoppable_Fervor.png'
import c4 from './Constellation_Unexpected_Odyssey.png'
import c5 from './Constellation_True_Explorer.png'
import c6 from './Constellation_Fire_Ventures_with_Me.png'
import normal from './Talent_Strike_of_Fortune.png'
import skill from './Talent_Passion_Overload.png'
import burst from './Talent_Fantastic_Voyage.png'
import passive1 from './Talent_Rekindle.png'
import passive2 from './Talent_Fearnaught.png'
import passive3 from './Talent_It_Should_Be_Safe....png'
import Stat from '../../../Stat'
import Character from '../../../Character/Character'
//import DisplayPercent from '../../../Components/DisplayPercent'

//AUTO
const hitPercent = [
  [44.55, 48.17, 51.8, 56.98, 60.61, 64.75, 70.45, 76.15, 81.84, 88.06, 94.28, 100.49, 106.71, 112.92, 119.14],
  [42.74, 46.22, 49.7, 54.67, 58.15, 62.13, 67.59, 73.06, 78.53, 84.49, 90.45, 96.42, 102.38, 108.35, 114.31],
  [54.61, 59.06, 63.5, 69.85, 74.3, 79.38, 86.36, 93.35, 100.33, 107.95, 115.57, 123.19, 130.81, 138.43, 146.05],
  [59.68, 64.54, 69.4, 76.34, 81.2, 86.75, 94.38, 102.02, 109.65, 117.98, 126.31, 134.64, 142.96, 151.29, 159.62],
  [71.9, 77.75, 83.6, 91.96, 97.81, 104.5, 113.7, 122.89, 132.09, 142.12, 152.15, 162.18, 172.22, 182.25, 192.28]
]

const charged_atk_1 = [55.9, 60.45, 65, 71.5, 76.05, 81.25, 88.4, 95.55, 102.7, 110.5, 118.3, 126.1, 133.9, 141.7, 149.5]
const charged_atk_2 = [60.72, 65.66, 70.6, 77.66, 82.6, 88.25, 96.02, 103.78, 111.55, 120.02, 128.49, 136.96, 145.44, 153.91, 162.38]
const plunging_dmg = [63.93, 69.14, 74.34, 81.77, 86.98, 92.93, 101.1, 109.28, 117.46, 126.38, 135.3, 144.22, 153.14, 162.06, 170.98]
const plunging_dmg_low = [127.84, 138.24, 148.65, 163.51, 173.92, 185.81, 202.16, 218.51, 234.86, 252.7, 270.54, 288.38, 306.22, 324.05, 341.89]
const plunging_dmg_high = [159.68, 172.67, 185.67, 204.24, 217.23, 232.09, 252.51, 272.93, 293.36, 315.64, 337.92, 360.2, 382.48, 404.76, 427.04]

//SKILL
const eleSkill = {
  press: [137.6, 147.92, 158.24, 172, 182.32, 192.64, 206.4, 220.16, 233.92, 247.68, 261.44, 275.2, 292.4, 309.6, 326.8],
  lvl1hit1: [84, 90.3, 96.6, 105, 111.3, 117.6, 126, 134.4, 142.8, 151.2, 159.6, 168, 178.5, 189, 199.5],
  lvl1hit2: [92, 98.9, 105.8, 115, 121.9, 128.8, 138, 147.2, 156.4, 165.6, 174.8, 184, 195.5, 207, 218.5],
  lvl2hit1: [88, 94.6, 101.2, 110, 116.6, 123.2, 132, 140.8, 149.6, 158.4, 167.2, 176, 187, 198, 209],
  lvl2hit2: [96, 103.2, 110.4, 120, 127.2, 134.4, 144, 153.6, 163.2, 172.8, 182.4, 192, 204, 216, 228],
  explosion: [132, 141.9, 151.8, 165, 174.9, 184.8, 198, 211.2, 224.4, 237.6, 250.8, 264, 280.5, 297, 313.5]
}

//BURST
const eleBurst = {
  burst_dmg: [232.8, 250.26, 267.72, 291, 308.46, 325.92, 349.2, 372.48, 395.76, 419.04, 442.32, 465.6, 494.7, 523.8, 552.9],
  heal_hp: [6, 6.45, 6.9, 7.5, 7.95, 8.4, 9, 9.6, 10.2, 10.8, 11.4, 12, 12.75, 13.5, 14.25],
  heal_flat: [577, 635, 698, 765, 837, 914, 996, 1083, 1174, 1270, 1371, 1477, 1588, 1703, 1824],
  atk_ratio: [56, 60.2, 64.4, 70, 74.2, 78.4, 84, 89.6, 95.2, 100.8, 106.4, 112, 119, 126, 133]
}

let char = {
  name: "Bennett",
  cardImg: card,
  thumbImg: thumb,
  star: 4,
  elementKey: "pyro",
  weaponTypeKey: "sword",
  gender: "M",
  constellationName: "Rota Calamitas",
  titles: ["Trial by Fire", "Leader of Benny's Adventure Team"],
  baseStat: {
    characterHP: [1039, 2670, 3447, 5163, 5715, 6573, 7309, 8168, 8719, 9577, 10129, 10987, 11539, 12397],
    characterATK: [16, 41, 53, 80, 88, 101, 113, 126, 134, 148, 156, 169, 178, 191],
    characterDEF: [65, 166, 214, 321, 356, 409, 455, 508, 542, 596, 630, 684, 718, 771]
  },
  specializeStat: {
    key: "enerRech_",
    value: [0, 0, 0, 0, 6.7, 6.7, 13.3, 13.3, 13.3, 13.3, 20, 20, 26.7, 26.7]
  },
  talent: {
    auto: {
      name: "Strike of Fortune",
      img: normal,
      infusable: true,
      document: [{
        text: <span><strong>Normal Attack</strong> Performs up to 5 rapid strikes.</span>,
        fields: hitPercent.map((percentArr, i) =>
        ({
          text: `${i + 1}-Hit DMG`,
          basicVal: (tlvl, stats, c) => <span>{percentArr[tlvl]}% {Stat.printStat(Character.getTalentStatKey("normal", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (percentArr[tlvl] / 100) * stats[Character.getTalentStatKey("normal", c)],
          formula: (tlvl, stats, c) => ({ [Character.getTalentStatKey("normal", c)]: percentArr[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("normal", c),
        }))
      }, {
        text: <span><strong>Charged Attack</strong> Consumes a certain amount of Stamina to unleash 2 rapid sword swings.</span>,
        fields: [{
          text: `First Hit DMG`,
          basicVal: (tlvl, stats, c) => <span>{charged_atk_1[tlvl]}% {Stat.printStat(Character.getTalentStatKey("charged", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (charged_atk_1[tlvl] / 100) * stats[Character.getTalentStatKey("charged", c)],
          formula: (tlvl, stats, c) => ({ [Character.getTalentStatKey("charged", c)]: charged_atk_1[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("charged", c),
        }, {
          text: `Second Hit DMG`,
          basicVal: (tlvl, stats, c) => <span>{charged_atk_2[tlvl]}% {Stat.printStat(Character.getTalentStatKey("charged", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (charged_atk_2[tlvl] / 100) * stats[Character.getTalentStatKey("charged", c)],
          formula: (tlvl, stats, c) => ({ [Character.getTalentStatKey("charged", c)]: charged_atk_2[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("charged", c),
        }, {
          text: `Stamina Cost`,
          value: 20,
        }]
      }, {
        text: <span><strong>Plunging Attack</strong> Plunges from mid-air to strike the ground below, damaging opponents along the path and dealing AoE DMG upon impact.</span>,
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
      name: "Passion Overload",
      img: skill,
      document: [{
        text: <span>
          <p className="mb-2">Bennett concentrates the spirit of Adventure and <span className="text-pyro">Pyro</span> into his blade. Depending on how long he charges for, different effects occur.</p>
          <p className="mb-2"><b>Tap:</b> A single, swift flame strike that deals <span className="text-pyro">Pyro DMG</span>.</p>
          <p className="mb-2"><b>Hold (Short):</b> Charges up, resulting in different effects when unleashed based on the Charge Level</p>
          <ul className="mb-2">
            <li>Level 1: Strikes twice, dealing Pyro DMG and launching opponents.</li>
            <li>Level 2: Unleashes 3 consecutive attacks that deal impressive <span className="text-pyro">Pyro DMG</span>, but the last attack triggers an explosion that launches both Bennett and the enemy. Bennett takes no damage from being launched, but can take fall damage if he falls down a cliff.</li>
          </ul>
        </span>,
        fields: [{
          text: "Press DMG",
          basicVal: (tlvl, stats, c) => <span>{eleSkill.press[tlvl]}% {Stat.printStat(Character.getTalentStatKey("skill", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (eleSkill.press[tlvl] / 100) * stats[Character.getTalentStatKey("skill", c)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("skill", c)]: eleSkill.press[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("skill", c),
        }, {
          text: "Lvl 1 1st Hit DMG",
          basicVal: (tlvl, stats, c) => <span>{eleSkill.lvl1hit1[tlvl]}% {Stat.printStat(Character.getTalentStatKey("skill", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (eleSkill.lvl1hit1[tlvl] / 100) * stats[Character.getTalentStatKey("skill", c)],
          formula: (tlvl, _, c) => ({ [Character.getTalentStatKey("skill", c)]: eleSkill.lvl1hit1[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("skill", c),
        }, {
          text: "Lvl 1 2nd Hit DMG",
          basicVal: (tlvl, stats, c) => <span>{eleSkill.lvl1hit2[tlvl]}% {Stat.printStat(Character.getTalentStatKey("skill", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (eleSkill.lvl1hit2[tlvl] / 100) * stats[Character.getTalentStatKey("skill", c)],
          formula: (tlvl, stats, c) => ({ [Character.getTalentStatKey("skill", c)]: eleSkill.lvl1hit2[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("skill", c),
        }, {
          text: "Lvl 2 1st Hit DMG",
          basicVal: (tlvl, stats, c) => <span>{eleSkill.lvl2hit1[tlvl]}% {Stat.printStat(Character.getTalentStatKey("skill", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (eleSkill.lvl2hit1[tlvl] / 100) * stats[Character.getTalentStatKey("skill", c)],
          formula: (tlvl, stats, c) => ({ [Character.getTalentStatKey("skill", c)]: eleSkill.lvl2hit1[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("skill", c),
        }, {
          text: "Lvl 2 2nd Hit DMG",
          basicVal: (tlvl, stats, c) => <span>{eleSkill.lvl2hit2[tlvl]}% {Stat.printStat(Character.getTalentStatKey("skill", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (eleSkill.lvl2hit2[tlvl] / 100) * stats[Character.getTalentStatKey("skill", c)],
          formula: (tlvl, stats, c) => ({ [Character.getTalentStatKey("skill", c)]: eleSkill.lvl2hit2[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("skill", c),
        }, {
          text: "Explosion DMG",
          basicVal: (tlvl, stats, c) => <span>{eleSkill.explosion[tlvl]}% {Stat.printStat(Character.getTalentStatKey("skill", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (eleSkill.explosion[tlvl] / 100) * stats[Character.getTalentStatKey("skill", c)],
          formula: (tlvl, stats, c) => ({ [Character.getTalentStatKey("skill", c)]: eleSkill.explosion[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("skill", c),
        }, (c, a) => ({
          text: "CD",
          value: a >= 1 ? "4s / 6s/ 8s" : "5s / 7.5s/ 10s",
        }), (c, a) => ({
          text: <span>CD in <b>Fantastic Voyage</b>'s circle</span>,
          value: "2s / 3s/ 4s",
        })]
      }],
    },
    burst: {
      name: "Fantastic Voyage",
      img: burst,
      document: [{
        text: <span>
          <p className="mb-2">Bennett performs a jumping attack that deals <span className="text-pyro">Pyro DMG</span>, creating an Inspiration Field for 12 seconds.</p>
          <p className="mb-2"><b>Inspiration Field:</b></p>
          <ul className="mb-2">
            <li>If the health of a character within the AoE is equal to or falls below 70%, their health will regenerate each second. The amount of HP restores scales off Bennett's Max HP.</li>
            <li>If the health of a character within the AoE is higher than 70%, they gain an ATK Bonus that scales based on Bennett's Base ATK.</li>
            <li>Imbues characters within the AoE with <span className="text-pyro">Pyro</span>.</li>
          </ul>
        </span>,
        fields: [{
          text: "Skill DMG",
          basicVal: (tlvl, stats, c) => <span>{eleBurst.burst_dmg[tlvl]}% {Stat.printStat(Character.getTalentStatKey("burst", c), stats)}</span>,
          finalVal: (tlvl, stats, c) => (eleBurst.burst_dmg[tlvl] / 100) * stats[Character.getTalentStatKey("burst", c)],
          formula: (tlvl, stats, c) => ({ [Character.getTalentStatKey("burst", c)]: eleBurst.burst_dmg[tlvl] / 100 }),
          variant: (tlvl, stats, c) => Character.getTalentStatKeyVariant("burst", c),
        }, {
          text: "Continuous Regeneration Per Sec",
          basicVal: (tlvl, stats, c) => <span>( {eleBurst.heal_hp[tlvl]}% Max HP + {eleBurst.heal_flat[tlvl]} ) * {Stat.printStat("heal_multi", stats)}</span>,
          finalVal: (tlvl, stats, c) => ((eleBurst.heal_hp[tlvl] / 100) * stats.finalHP + eleBurst.heal_flat[tlvl]) * stats.heal_multi,
          formula: (tlvl) => ({ heal_multi: { finalHP: eleBurst.heal_hp[tlvl] / 100, flat: eleBurst.heal_flat[tlvl] } }),
          variant: "success",
        }, (con, a) => ({
          text: "ATK Bonus Ratio",
          basicVal: (tlvl, stats, c) => <span>{con < 1 ? eleBurst.atk_ratio[tlvl] : `(${eleBurst.atk_ratio[tlvl]} + 20)`}% {Stat.printStat("baseATK", stats)}</span>,
          finalVal: (tlvl, stats, c) => ((con < 1 ? eleBurst.atk_ratio[tlvl] : eleBurst.atk_ratio[tlvl] + 20) / 100) * stats.baseATK,
          formula: (tlvl) => ({ baseATK: (con < 1 ? eleBurst.atk_ratio[tlvl] : eleBurst.atk_ratio[tlvl] + 20) / 100 }),
        }), {
          text: "Duration",
          value: "12s",
        }, {
          text: "CD",
          value: "15s",
        }, {
          text: "Energy Cost",
          value: 60,
        }],
        conditional: (tlvl, c, a) => ({
          type: "character",
          conditionalKey: "FantasticVoyage",
          condition: "Fantastic Voyage",
          sourceKey: "bennett",
          maxStack: 1,
          stats: {
            modifiers: { finalATK: { baseATK: (c < 1 ? eleBurst.atk_ratio[tlvl] : eleBurst.atk_ratio[tlvl] + 20) / 100, } },
          },
        })
      }],
    },
    passive1: {
      name: "Rekindle",
      img: passive1,
      document: [{ text: <span>Decreases <b>Passion Overload</b>'s CD by 20%.</span> }],
    },
    passive2: {
      name: "Fearnaught",
      img: passive2,
      document: [{ text: <span>When inside <b>Fantastic Voyage</b>'s circle, Passion Overload's CD is decreased by 50% and Bennett cannot be launched by this skill's explosion.</span> }],
    },
    passive3: {
      name: "It Should Be Safe...",
      img: passive3,
      document: [{ text: <span>When dispatched on an expedition in <b>Mondstadt</b>, time consumed is reduced by 25%.</span> }],
    },
    constellation1: {
      name: "Grand Expectation",
      img: c1,
      document: [{ text: <span><b>Fantastic Voyage</b>'s ATK increase no longer has an HP restriction, and gains an additional 20% of Bennett's Base ATK. (Additive increase)</span> }],
    },
    constellation2: {
      name: "Impasse Conqueror",
      img: c2,
      document: [{
        text: <span>When HP falls below 70%, increases Energy Recharge by 30%.</span>,
        conditional: (tlvl, c, a) => c >= 2 && {
          type: "character",
          conditionalKey: "ImpasseConqueror",
          condition: "Impasse Conqueror",
          sourceKey: "bennett",
          maxStack: 1,
          stats: {
            enerRech_: 30,
          }
        }
      }],
    },
    constellation3: {
      name: "Unstoppable Fervor",
      img: c3,
      document: [{ text: <span>Increases <b>Passion Overload</b>'s skill level by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { skill: 3 }
    },
    constellation4: {
      name: "Unexpected Odyssey",
      img: c4,
      document: [{ text: <span>Short hold to release <b>Passion Overload</b> as a two-stage attack. Press the attack button to perform an additional falling attack.</span> }],
    },
    constellation5: {
      name: "True Explorer",
      img: c5,
      document: [{ text: <span>Increases <b>Fantastic Voyage</b>'s skill level by 3. Maximum upgrade level is 15.</span> }],
      talentBoost: { burst: 3 }
    },
    constellation6: {
      name: "Fire Ventures with Me",
      img: c6,
      document: [{
        text: <span>Sword, Claymore, or Polearm-wielding characters inside Fantastic Voyage's radius gain a 15% Pyro DMG Bonus and their weapons are infused with <span className="text-pyro">Pyro</span>.</span>
      }],
    }
  },
};
export default char;
