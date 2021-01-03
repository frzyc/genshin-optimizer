import card from './Character_Noelle_Card.jpg'
import thumb from './Character_Noelle_Thumb.png'
import c1 from './Constellation_I_Got_Your_Back.png'
import c2 from './Constellation_Combat_Maid.png'
import c3 from './Constellation_Invulnerable_Maid.png'
import c4 from './Constellation_To_Be_Cleaned.png'
import c5 from './Constellation_Favonius_Sweeper_Master.png'
import c6 from './Constellation_Must_Be_Spotless.png'
import normal from './Talent_Favonius_Bladework_-_Maid.png'
import skill from './Talent_Breastplate.png'
import burst from './Talent_Sweeping_Time.png'
import passive1 from './Talent_Devotion.png'
import passive2 from './Talent_Nice_and_Clean.png'
import passive3 from './Talent_Maid\'s_Knighthood.png'
import WeaponPercent from '../../../Components/WeaponPercent'

//AUTO
const hitPercent = [
  [79.12, 85.56, 92, 101.2, 107.64, 115, 125.12, 135.24, 145.36, 156.4, 167.44, 178.48, 189.52, 200.56, 211.6],
  [73.36, 79.33, 85.3, 93.83, 99.8, 106.63, 116.01, 125.39, 134.77, 145.01, 155.25, 165.48, 175.72, 185.95, 196.19],
  [86.26, 93.28, 100.3, 110.33, 117.35, 125.38, 136.41, 147.44, 158.47, 170.51, 182.55, 194.58, 206.62, 218.65, 230.69],
  [113.43, 122.67, 131.9, 145.09, 154.32, 164.88, 179.38, 193.89, 208.4, 224.23, 240.06, 255.89, 271.71, 287.54, 303.37],
]

const charged_atk_spinnning = [50.74, 54.87, 59, 64.9, 69.03, 73.75, 80.24, 86.73, 93.22, 100.3, 107.38, 114.46, 121.54, 128.62, 135.7]
const charged_atk_final = [90.47, 97.84, 105.2, 115.72, 123.08, 131.5, 143.07, 154.64, 166.22, 178.84, 191.46, 204.09, 216.71, 229.34, 241.96]
const plunge_dmg = [74.59, 80.66, 86.73, 95.4, 101.47, 108.41, 117.95, 127.49, 137.03, 147.44, 157.85, 168.26, 178.66, 189.07, 199.48]
const plunge_dng_low = [149.14, 161.28, 173.42, 190.77, 202.91, 216.78, 235.86, 254.93, 274.01, 294.82, 315.63, 336.44, 357.25, 378.06, 398.87]
const plunge_dmg_high = [186.29, 201.45, 216.62, 238.28, 253.44, 270.77, 294.6, 318.42, 342.25, 368.25, 394.24, 420.23, 446.23, 472.22, 498.21]

//SKILL
const breastplateStats = {
  skill_dmg: [120, 129, 138, 150, 159, 168, 180, 192, 204, 216, 228, 240, 255, 270, 285],
  shield_def: [160, 172, 184, 200, 212, 224, 240, 256, 272, 288, 304, 320, 340, 360, 380],
  shield_flat: [770, 847, 930, 1020, 1116, 1219, 1328, 1443, 1565, 1694, 1828, 1970, 2117, 2271, 2431],
  heal_def: [21.28, 22.88, 24.47, 26.6, 28.2, 29.79, 31.92, 34.05, 36.18, 38.3, 40.43, 42.56, 45.22, 47.88, 50.54],
  heal_flat: [103, 113, 124, 136, 149, 163, 177, 193, 209, 226, 244, 263, 282, 303, 324],
  heal_trigger: [50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 59, 60, 60, 60, 60],
}
const sweepingTimeStats = {
  burst_dmg: [67.2, 72.24, 77.28, 84, 89.04, 94.08, 100.8, 107.52, 114.24, 120.96, 127.68, 134.4, 142.8, 151.2, 159.6],
  skill_dmg: [92.8, 99.76, 106.72, 116, 122.96, 129.92, 139.2, 148.48, 157.76, 167.04, 176.32, 185.6, 197.2, 208.8, 220.4],
  atk_bonu: [40, 43, 46, 50, 53, 56, 60, 64, 68, 72, 76, 80, 85, 90, 95],
}

let char = {
  name: "Noelle",
  cardImg: card,
  thumbImg: thumb,
  star: 4,
  elementKey: "geo",
  weaponTypeKey: "claymore",
  gender: "F",
  constellationName: "Parma Cordis",
  titles: ["Chivalric Blossom", "Maid of Favonius"],
  baseStat: {
    hp: [1012, 2600, 3356, 5027, 5564, 6400, 7117, 7953, 8490, 9325, 9862, 10698, 11235, 12071],
    atk: [16, 41, 53, 80, 88, 101, 113, 126, 134, 148, 156, 169, 178, 191],
    def: [67, 172, 222, 333, 368, 423, 471, 526, 562, 617, 652, 708, 743, 799]
  },
  specializeStat: {
    key: "def_",
    value: [0, 0, 0, 0, 7.5, 7.5, 15, 15, 15, 15, 22.5, 22.5, 30, 30]
  },
  talent: {
    auto: {
      name: "Favonius Bladework - Maid",
      img: normal,
      document: [{
        text: <span><strong>Normal Attack</strong> Performs up to 4 consecutive slashes.</span>,
        fields: hitPercent.map((percentArr, i) =>
        ({
          text: `${i + 1}-Hit DMG`,
          basicVal: (tlvl) => percentArr[tlvl] + "%",
          finalVal: (tlvl, stats) => (percentArr[tlvl] / 100) * stats.norm_atk_avg_dmg
        }))
      }, {
        text: <span><strong>Charged Attack</strong> Drains Stamina over time to perform continuous swirling attack on all nearby enemies. At the end of the sequence, performs an additional powerful slash</span>,
        fields: [{
          text: `Spinning DMG`,
          basicVal: (tlvl) => charged_atk_spinnning[tlvl] + "%",
          finalVal: (tlvl, stats) => (charged_atk_spinnning[tlvl] / 100) * stats.char_atk_avg_dmg
        }, {
          text: `Spinning Final DMG`,
          basicVal: (tlvl) => charged_atk_final[tlvl] + "%",
          finalVal: (tlvl, stats) => (charged_atk_final[tlvl] / 100) * stats.char_atk_avg_dmg
        }, {
          text: `Stamina Cost`,
          value: `40/s`,
        }, {
          text: `Max Duration`,
          value: `5s`,
        }]
      }, {
        text: <span><strong>Plunging Attack</strong> Plunges from mid-air to strike the ground below, damaging opponents along the path and dealing AoE DMG upon impact.</span>,
        fields: [{
          text: `Plunge DMG`,
          basicVal: (tlvl) => plunge_dmg[tlvl] + "%",
          finalVal: (tlvl, stats) => (plunge_dmg[tlvl] / 100) * stats.phy_avg_dmg
        }, {
          text: `Low Plunge DMG`,
          basicVal: (tlvl) => plunge_dng_low[tlvl] + "%",
          finalVal: (tlvl, stats) => (plunge_dng_low[tlvl] / 100) * stats.phy_avg_dmg
        }, {
          text: `High Plunge DMG`,
          basicVal: (tlvl) => plunge_dmg_high[tlvl] + "%",
          finalVal: (tlvl, stats) => (plunge_dmg_high[tlvl] / 100) * stats.phy_avg_dmg
        }]
      },],
    },
    skill: {
      name: "Breastplate",
      img: skill,
      document: [{
        text: <span>
          Summons protective stone armor, dealing <span className="text-geo">Geo DMG</span> to surrounding enemies and creating a shield. The shield's DMG Absorption scales based on Noelle's DEF.
          The shield has the following properties:
          <ul>
            <li>When Noelle's Normal and Charged Attacks hit a target, they have a certain chance to regenerate HP for all characters.</li>
            <li>Possesses 250% Absorption Efficiency against <span className="text-geo">Geo DMG</span></li>
          </ul>
          The amount of HP healed when regeneration is triggered scales based on Noelle's DEF.
        </span>,
        fields: [{
          text: "Skill DMG",
          basicVal: (tlvl) => breastplateStats.skill_dmg[tlvl] + "% DEF",
          //basically the calculation for skill_avg_dmg, except using def as the base instead of atk
          finalVal: (tlvl, s) => (breastplateStats.skill_dmg[tlvl] / 100) * s.def * (1 + ((s.crit_rate + s.skill_crit_rate) / 100) * s.crit_dmg / 100) * (1 + s[`${s.char_ele_key}_ele_dmg`] / 100) * (1 + s.skill_dmg / 100) * (1 + s.dmg / 100),
        }, {
          text: "DMG Absorption",
          basicVal: (tlvl) => breastplateStats.shield_def[tlvl] + "% DEF + " + breastplateStats.shield_flat[tlvl],
          finalVal: (tlvl, s) => (breastplateStats.shield_def[tlvl] / 100) * s.def + breastplateStats.shield_flat[tlvl],
        }, {
          text: "Healing",
          basicVal: (tlvl) => breastplateStats.heal_def[tlvl] + "% DEF + " + breastplateStats.heal_flat[tlvl],
          finalVal: (tlvl, s) => (breastplateStats.heal_def[tlvl] / 100) * s.def + breastplateStats.heal_flat[tlvl],
        }, (c) => ({
          text: "Trigger Chance",
          value: (tlvl) => <span>{breastplateStats.heal_trigger[tlvl]}%{c >= 1 ? <span> (100% while <b>Sweeping Time</b> and <b>Breastplate</b> are both in effect)</span> : ""}</span>,
        }), {
          text: "Duration",
          value: "12s",
        }, (c, a) => ({
          text: "CD",
          value: "24s" + (a > 4 ? " -1s Every 4 hits" : ""),
        })],
      }],
    },
    burst: {
      name: "Sweeping Time",
      img: burst,
      document: [{
        text: <span>
          Gathering the strength of stone around her weapon, Noelle strikes the enemies surrounding her within a large AoE, dealing <span className="text-geo">Geo DMG</span>.
        Afterwards, Noelle gains the following effects:
        <ul>
            <li>Larger attack AoE</li>
            <li>Converts attack DMG to <span className="text-geo">Geo DMG</span></li>
            <li>Increased ATK that scales based on her DEF.</li>
          </ul>
        </span>,
        fields: [{
          text: "Burst DMG",
          basicVal: (tlvl) => sweepingTimeStats.burst_dmg[tlvl] + "%",
          finalVal: (tlvl, s) => (sweepingTimeStats.burst_dmg[tlvl] / 100) * s.burst_avg_dmg,
        }, {
          text: "Skill DMG",
          basicVal: (tlvl) => sweepingTimeStats.skill_dmg[tlvl] + "%",
          finalVal: (tlvl, s) => (sweepingTimeStats.skill_dmg[tlvl] / 100) * s.burst_avg_dmg,
        }, (c) => ({
          text: "ATK Bonus",
          basicVal: (tlvl) => `${sweepingTimeStats.atk_bonu[tlvl]}%${c >= 6 ? " +50%" : ""} DEF`,
          finalVal: (tlvl, s) => ((sweepingTimeStats.atk_bonu[tlvl] + (c >= 6 ? 50 : 0)) / 100) * s.def,
        }), (c) => ({
          text: "Duration",
          value: "15s" + (c >= 6 ? " +1s per kill, up to 10s" : ""),
        }), {
          text: "CD",
          value: "15s",
        }, {
          text: "Energy Cost",
          value: 60,
        }]
      }],
      conditional: (tlvl, c) => ({
        type: "character",
        condition: "Sweeping Time",
        sourceKey: "noelle",
        maxStack: 1,
        stats: {
          formulaOverrides: [{
            key: "noelle_burst_atk",
            options: {
              value: sweepingTimeStats.atk_bonu[tlvl] + (c >= 6 ? 50 : 0)
            }
          }],
        },

        fields: [{
          text: "Convert DEF to ATK as above",
        }]
      })
    },
    passive1: {
      name: "Devotion",
      img: passive1,
      document: [{
        text: (stats) => <span>
          When Noelle is in the party but not on the field, this ability triggers automatically when your active character's HP falls below 30%:
          Creates a shield for your active character that lasts for 20s and absorbs DMG equal to 400% of Noelle's DEF{WeaponPercent(400, stats.def, 0)}. This effect can only occur once every 60s.
        </span>
      }],
    },
    passive2: {
      name: "Nice and Clean",
      img: passive2,
      document: [{
        text: <span>
          Every 4 Normal or Charged Attack hits will decrease the CD of <b>Breastplate</b> by 1s.
          Hitting multiple enemies with a single attack is only counted as 1 hit.
        </span>
      }],
    },
    passive3: {
      name: "Maid's Knighthood",
      img: passive3,
      document: [{
        text: <span>When a Perfect Cooking is achieved on a DEF-boosting dish, Noelle has a 12% chance to obtain double the product.</span>
      }]
    },
    constellation1: {
      name: "I Got Your Back",
      img: c1,
      document: [{ text: <span>While <b>Sweeping Time</b> and <b>Breastplate</b> are both in effect, attacks hits have a 100% chance to trigger <b>Breastplate</b>'s healing effects.</span> }]
    },
    constellation2: {
      name: "Combat Maid",
      img: c2,
      document: [{ text: <span>Decreases Noelle's Stamina Consumption of <b>Charged Attacks</b> by 20% and increases <b>Charged Attack</b> DMG by 15%.</span> }],
      stats: {
        char_atk_dmg: 15,
        stamina_charged_dec: 20,
      }
    },
    constellation3: {
      name: "Invulnerable Maid",
      img: c3,
      document: [{ text: <span>Increases <b>Breastplate</b>'s skill level by 3. Max level is 15</span> }]
    },
    constellation4: {
      name: "To Be Cleaned",
      img: c4,
      document: [{ text: (stats) => <span>When <b>Breastplate</b> ends or shatters, it deals 400% of ATK{WeaponPercent(400, stats.atk)} as <span className="text-geo">Geo DMG</span> to surrounding enemies.</span> }]
    },
    constellation5: {
      name: "Favonius Sweeper Master",
      img: c5,
      document: [{ text: <span>Increases <b>Sweeping Time</b>'s skill level by 3. Max level is 15.</span> }]
    },
    constellation6: {
      name: "Must Be Spotless",
      img: c6,
      document: [{ text: (stats) => <span><b>Sweeping Time</b> increases ATK by an additional 50% of Noelle's DEF{WeaponPercent(20, stats.def)}. For the skill's duration, adds 1s duration time per opponent defeated, up to 10s.</span> }]
    }
  }
};
export default char;
