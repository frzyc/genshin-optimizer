import { IFormulaSheet } from "../../../Types/character"
import { basicDMGFormula } from "../../../Util/FormulaUtil"

export const data = {
  baseStat: {
    characterHP: [784, 2014, 2600, 3895, 4311, 4959, 5514, 6161, 6578, 7225, 7641, 8289, 8705, 9352],
    characterATK: [20, 52, 67, 100, 111, 127, 141, 158, 169, 185, 196, 213, 223, 240],
    characterDEF: [49, 126, 163, 244, 271, 311, 346, 387, 413, 453, 480, 520, 546, 587]
  },
  specializeStat: {
    key: "pyro_dmg_",
    value: [0, 0, 0, 0, 6, 6, 12, 12, 12, 12, 18, 18, 24, 24]
  },
  normal: {
    hitArr: [
      [58.34, 62.72, 67.09, 72.93, 77.3, 81.68, 87.51, 93.35, 99.18, 105.01, 110.85, 116.68, 123.98, 131.27, 138.56],
      [52.13, 56.04, 59.94, 65.16, 69.07, 72.98, 78.19, 83.4, 88.61, 93.83, 99.04, 104.25, 110.77, 117.28, 123.8],
      [76.01, 81.71, 87.41, 95.02, 100.72, 106.42, 114.02, 121.62, 129.22, 136.82, 144.42, 152.03, 161.53, 171.03, 180.53]
    ],
  },
  charged: {
    hitArr: [
      [98.23, 104.11, 109.99, 117.64, 123.52, 129.4, 137.05, 144.7, 152.34, 159.99, 167.64, 175.28, 182.93, 190.58, 198.22],
      [115.56, 122.48, 129.4, 138.4, 145.32, 152.24, 161.24, 170.23, 179.23, 188.22, 197.22, 206.22, 215.21, 224.21, 233.2],
      [132.9, 140.86, 148.81, 159.16, 167.12, 175.08, 185.42, 195.77, 206.11, 216.46, 226.8, 237.15, 247.49, 257.84, 268.18],
      [150.23, 159.23, 168.23, 179.92, 188.92, 197.91, 209.61, 221.3, 233, 244.69, 256.39, 268.08, 279.78, 291.47, 303.17],
      [167.57, 177.6, 187.64, 200.68, 210.71, 220.75, 233.79, 246.84, 259.88, 272.92, 285.97, 299.01, 312.06, 325.1, 338.15],
    ],
  },
  plunging: {
    dmg: [56.83, 61.45, 66.08, 72.69, 77.31, 82.6, 89.87, 97.14, 104.41, 112.34, 120.27, 128.2, 136.12, 144.05, 151.98],
    low: [113.63, 122.88, 132.13, 145.35, 154.59, 165.17, 179.7, 194.23, 208.77, 224.62, 240.48, 256.34, 272.19, 288.05, 303.9],
    high: [141.93, 153.49, 165.04, 181.54, 193.1, 206.3, 224.45, 242.61, 260.76, 280.57, 300.37, 320.18, 339.98, 359.79, 379.59]
  },
  skill: {
    dmg: [169.6, 182.32, 195.04, 212, 224.72, 237.44, 254.4, 271.36, 288.32, 305.28, 322.24, 339.2, 360.4, 381.6, 402.8],
  },
  burst: {
    dmg: [182.4, 196.08, 209.76, 228, 241.68, 255.36, 273.6, 291.84, 310.08, 328.32, 346.56, 364.8, 387.6, 410.4, 433.2],
    dmg_: [33.4, 35.4, 37.4, 40, 42, 44, 46.6, 49.2, 51.8, 54.4, 57, 59.6, 62.2, 64.8, 67.4]
  }
}
const formula: IFormulaSheet = {
  normal: Object.fromEntries(data.normal.hitArr.map((percentArr, i) => [i, stats =>
    basicDMGFormula(percentArr[stats.tlvl.auto], stats, "normal")])),
  charged: Object.fromEntries(data.charged.hitArr.map((percentArr, i) => [i, stats =>
    basicDMGFormula(percentArr[stats.tlvl.auto], stats, "charged")])),
  plunging: Object.fromEntries(Object.entries(data.plunging).map(([name, arr]) =>
    [name, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "plunging")])),
  skill: {
    dmg: stats => basicDMGFormula(data.skill.dmg[stats.tlvl.skill], stats, "skill")
  },
  burst: {
    dmg: stats => basicDMGFormula(data.burst.dmg[stats.tlvl.burst], stats, "burst"),
  },
  passive2: {
    dmg: stats => basicDMGFormula(80, stats, "charged"),
  },
  constellation4: {
    shield: stats => [s => 0.45 * s.finalHP * (1 + s.powShield_ / 100), ["finalHP", "powShield_"]],
    shieldCryo: stats => [s => 0.45 * s.finalHP * (1 + s.powShield_ / 100) * 2.5, ["finalHP", "powShield_"]],
  },
}
export default formula