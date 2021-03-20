import { basicDMGFormula } from "../../../Util/FormulaUtil";

export const data = {
  baseStat: {
    characterHP: [775, 1991, 2570, 3850, 4261, 4901, 5450, 6090, 6501, 7141, 7552, 8192, 8604, 9244],
    characterATK: [14, 37, 47, 71, 78, 90, 100, 112, 120, 131, 139, 151, 158, 170],
    characterDEF: [59, 151, 195, 293, 324, 373, 414, 463, 494, 543, 574, 623, 654, 703]
  },
  specializeStat: {
    key: "anemo_dmg_",
    value: [0, 0, 0, 0, 6, 6, 12, 12, 12, 12, 18, 18, 24, 24]
  },
  normal: {
    hitArr: [
      [33.46, 35.97, 38.48, 41.83, 44.34, 46.85, 50.2, 53.54, 56.89, 60.24, 63.58, 66.93, 71.11, 75.29, 79.48], // 1
      [30.62, 32.91, 35.21, 38.27, 40.57, 42.86, 45.92, 48.99, 52.05, 55.11, 58.17, 61.23, 65.06, 68.89, 72.71], // 2
      [38.45, 41.33, 44.22, 48.06, 50.94, 53.83, 57.67, 61.52, 65.36, 69.21, 73.05, 76.9, 81.7, 86.51, 91.31], // 3
      [47.92, 51.51, 55.11, 59.9, 63.49, 67.08, 71.88, 76.67, 81.46, 86.25, 91.04, 95.84, 101.82, 107.81, 113.8], // 4
    ]
  },
  charged: {
    hit: [120.16, 129.17, 138.18, 150.2, 159.21, 168.22, 180.24, 192.26, 204.27, 216.29, 228.3, 240.32, 255.34, 270.36, 285.38],
  },
  plunging: {
    dmg: [56.83, 61.45, 66.08, 72.69, 77.31, 82.6, 89.87, 97.14, 104.41, 112.34, 120.27, 128.2, 136.12, 144.05, 151.98],
    low: [122.88, 132.13, 145.35, 154.59, 165.17, 179.7, 194.23, 208.77, 224.62, 240.48, 256.34, 272.19, 288.05, 303.9],
    high: [153.49, 165.04, 181.54, 193.1, 206.3, 224.45, 242.61, 260.76, 280.57, 300.37, 320.18, 339.98, 359.79, 379.59],
  },
  skill: {
    press: [211.2, 227.04, 242.88, 264, 279.84, 295.68, 316.8, 337.92, 359.04, 380.16, 401.28, 422.4, 448.8, 475.2, 501.6],
  },
  burst: {
    dot: [148, 159.1, 170.2, 185, 196.1, 207.2, 222, 236.8, 251.6, 266.4, 281.2, 296, 314.5, 333, 351.5],
    dmg_: [44, 47.3, 50.6, 55, 58.3, 61.6, 66, 70.4, 74.8, 79.2, 83.6, 88, 93.5, 99, 104.5],
  }
}
const formula = {
  normal: Object.fromEntries(data.normal.hitArr.map((arr, i) =>
    [i, (tlvl, stats) => basicDMGFormula(arr[tlvl], stats, "normal")])),
  charged: {
    hit: (tlvl, stats) => basicDMGFormula(data.charged.hit[tlvl], stats, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(data.plunging).map(([name, arr]) =>
    [name, (tlvl, stats) => basicDMGFormula(arr[tlvl], stats, "plunging")])),
  skill: Object.fromEntries(Object.entries(data.skill).map(([name, arr]) =>
    [name, (tlvl, stats) => basicDMGFormula(arr[tlvl], stats, "skill")])),
  burst: {
    dot: (tlvl, stats) => basicDMGFormula(data.burst.dot[tlvl], stats, "burst"),
    ...Object.fromEntries((["hydro", "pyro", "cryo", "electro"]).map(ele =>
      [`${ele}_dmg_bonus`, (tlvl, stats) => [s => { return (data.burst.dmg_[tlvl] / 100) * s[`${ele}_burst_${stats.hitMode}`] }, [`${ele}_burst_${stats.hitMode}`]]])),//not optimizationTarget, dont need to precompute
  },
}
export default formula
