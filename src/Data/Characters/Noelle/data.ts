import { getTalentStatKey } from "../../../Build/Build"
import { IFormulaSheet } from "../../../Types/character"
import { basicDMGFormula } from "../../../Util/FormulaUtil"

export const data = {
  normal: {
    hitArr: [
      [79.12, 85.56, 92, 101.2, 107.64, 115, 125.12, 135.24, 145.36, 156.4, 167.44, 178.48, 189.52, 200.56, 211.6],
      [73.36, 79.33, 85.3, 93.83, 99.8, 106.63, 116.01, 125.39, 134.77, 145.01, 155.25, 165.48, 175.72, 185.95, 196.19],
      [86.26, 93.28, 100.3, 110.33, 117.35, 125.38, 136.41, 147.44, 158.47, 170.51, 182.55, 194.58, 206.62, 218.65, 230.69],
      [113.43, 122.67, 131.9, 145.09, 154.32, 164.88, 179.38, 193.89, 208.4, 224.23, 240.06, 255.89, 271.71, 287.54, 303.37],
    ]
  },
  charged: {
    spinning: [50.74, 54.87, 59, 64.9, 69.03, 73.75, 80.24, 86.73, 93.22, 100.3, 107.38, 114.46, 121.54, 128.62, 135.7],
    final: [90.47, 97.84, 105.2, 115.72, 123.08, 131.5, 143.07, 154.64, 166.22, 178.84, 191.46, 204.09, 216.71, 229.34, 241.96],
  },
  plunging: {
    dmg: [74.59, 80.66, 86.73, 95.4, 101.47, 108.41, 117.95, 127.49, 137.03, 147.44, 157.85, 168.26, 178.66, 189.07, 199.48],
    low: [149.14, 161.28, 173.42, 190.77, 202.91, 216.78, 235.86, 254.93, 274.01, 294.82, 315.63, 336.44, 357.25, 378.06, 398.87],
    high: [186.29, 201.45, 216.62, 238.28, 253.44, 270.77, 294.6, 318.42, 342.25, 368.25, 394.24, 420.23, 446.23, 472.22, 498.21],
  },
  skill: {
    skill_dmg: [120, 129, 138, 150, 159, 168, 180, 192, 204, 216, 228, 240, 255, 270, 285],
    shield_def: [160, 172, 184, 200, 212, 224, 240, 256, 272, 288, 304, 320, 340, 360, 380],
    shield_flat: [770, 847, 930, 1020, 1116, 1219, 1328, 1443, 1565, 1694, 1828, 1970, 2117, 2271, 2431],
    heal_def: [21.28, 22.88, 24.47, 26.6, 28.2, 29.79, 31.92, 34.05, 36.18, 38.3, 40.43, 42.56, 45.22, 47.88, 50.54],
    heal_flat: [103, 113, 124, 136, 149, 163, 177, 193, 209, 226, 244, 263, 282, 303, 324],
    heal_trigger: [50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 59, 60, 60, 60, 60],
  },
  burst: {
    burst_dmg: [67.2, 72.24, 77.28, 84, 89.04, 94.08, 100.8, 107.52, 114.24, 120.96, 127.68, 134.4, 142.8, 151.2, 159.6],
    skill_dmg: [92.8, 99.76, 106.72, 116, 122.96, 129.92, 139.2, 148.48, 157.76, 167.04, 176.32, 185.6, 197.2, 208.8, 220.4],
    bonus: [40, 43, 46, 50, 53, 56, 60, 64, 68, 72, 76, 80, 85, 90, 95],
  }
}
const formula: IFormulaSheet = {
  normal: Object.fromEntries(data.normal.hitArr.map((arr, i) =>
    [i, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "normal")])),
  charged: Object.fromEntries(Object.entries(data.charged).map(([name, arr]) =>
    [name, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "charged")])),
  plunging: Object.fromEntries(Object.entries(data.plunging).map(([name, arr]) =>
    [name, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "plunging")])),
  skill: {
    skill_dmg: stats => {
      const percent = data.skill.skill_dmg[stats.tlvl.skill] / 100, key = getTalentStatKey("skill", stats) + "_multi"
      return [s => percent * s[key] * s.finalDEF, [key, "finalDEF"]]
    },
    shield: stats => {
      const percent = data.skill.shield_def[stats.tlvl.skill] / 100, flat = data.skill.shield_flat[stats.tlvl.skill]
      return [s => (percent * s.finalDEF + flat) * (1 + s.shield_ / 100) * 1.5, ["finalDEF", "shield_"]]
    },
    heal: stats => {
      const percent = data.skill.heal_def[stats.tlvl.skill] / 100, flat = data.skill.heal_flat[stats.tlvl.skill]
      return [s => (percent * s.finalDEF + flat) * s.heal_multi, ["finalDEF", "heal_multi"]]
    },
  },
  burst: {
    burst_dmg: stats => basicDMGFormula(data.burst.burst_dmg[stats.tlvl.burst], stats, "burst"),
    skill_dmg: stats => basicDMGFormula(data.burst.skill_dmg[stats.tlvl.burst], stats, "burst"),
    bonus: stats => {
      const val = (data.burst.bonus[stats.tlvl.burst] + (stats.constellation >= 6 ? 50 : 0)) / 100
      return [s => val * (s.premod?.finalDEF ?? s.finalDEF), ["finalDEF"]]
    }
  },
  constellation4: {
    dmg: stats => basicDMGFormula(400, stats, "elemental"),
  },
  passive1: {
    hp: stats => [s => 4 * s.finalDEF * (1 + s.shield_ / 100) * 1.5, ["finalDEF", "shield_"]],
  }
}
export default formula