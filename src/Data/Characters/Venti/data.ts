import { IFormulaSheet } from "../../../Types/character"
import { basicDMGFormula } from "../../../Util/FormulaUtil"
import { absorbableEle } from "../dataUtil"

export const data = {
  baseStat: {
    characterHP: [820, 2127, 2830, 4234, 4734, 5446, 6112, 6832, 7331, 8058, 8557, 9292, 9791, 10531],
    characterATK: [20, 53, 71, 106, 118, 136, 153, 171, 183, 201, 214, 232, 245, 263],
    characterDEF: [52, 135, 180, 269, 301, 346, 388, 434, 465, 512, 543, 590, 622, 669],
  },
  specializeStat: {
    key: "enerRech_",
    value: [0, 0, 0, 0, 8, 8, 16, 16, 16, 16, 24, 24, 32, 32],
  },
  normal: {
    hitArr: [
      [20.38, 22.04, 23.7, 26.07, 27.73, 29.63, 32.23, 34.84, 37.45, 40.29, 43.55, 47.38, 51.21, 55.05, 59.23],//1
      [44.38, 47.99, 51.6, 56.76, 60.37, 64.5, 70.18, 75.85, 81.53, 87.72, 94.82, 103.16, 111.5, 119.85, 128.95],//2
      [52.37, 56.64, 60.9, 66.99, 71.25, 76.13, 82.82, 89.52, 96.22, 103.53, 111.9, 121.75, 131.6, 141.45, 152.19],//3
      [26.06, 28.18, 30.3, 33.33, 35.45, 37.87, 41.21, 44.54, 47.87, 51.51, 55.68, 60.58, 65.48, 70.37, 75.72],//4
      [50.65, 54.78, 58.9, 64.79, 68.91, 73.63, 80.1, 86.58, 93.06, 100.13, 108.23, 117.75, 127.28, 136.8, 147.19],//5
      [70.95, 76.73, 82.5, 90.75, 96.53, 103.13, 112.2, 121.28, 130.35, 140.25, 151.59, 164.93, 178.27, 191.61, 206.17],//6
    ]
  },
  charged: {
    hit: [43.86, 47.43, 51, 56.1, 59.67, 63.75, 69.36, 74.97, 80.58, 86.7, 93.71, 101.96, 110.21, 118.45, 127.45],
    full: [124, 133.3, 142.6, 155, 164.3, 173.6, 186, 198.4, 210.8, 223.2, 236.1, 252.96, 269.82, 286.69, 303.55],
  },
  plunging: {
    dmg: [56.83, 61.45, 66.08, 72.69, 77.31, 82.6, 89.87, 97.14, 104.41, 112.34, 120.27, 128.2, 136.12, 144.05, 151.98],
    low: [113.63, 122.88, 132.13, 145.35, 154.59, 165.17, 179.7, 194.23, 208.77, 224.62, 240.48, 256.34, 272.19, 288.05, 303.9],
    high: [141.93, 153.49, 165.04, 181.54, 193.1, 206.3, 224.45, 242.61, 260.76, 280.57, 300.37, 320.18, 339.98, 359.79, 379.59],
  },
  skill: {
    press: [276, 296.7, 317.4, 345, 365.7, 386.4, 414, 441.6, 469.2, 496.8, 524.4, 552, 586.5, 621, 655.5],
    hold: [380, 408.5, 437, 475, 503.5, 532, 570, 608, 646, 684, 722, 760, 807.5, 855, 902.5],
  },
  burst: {
    hit: [37.6, 40.42, 43.24, 47, 49.82, 52.64, 56.4, 60.16, 63.92, 67.68, 71.44, 75.2, 79.9, 84.6, 89.3],
  }
}
const formula: IFormulaSheet = {
  normal: Object.fromEntries(data.normal.hitArr.map((arr, i) =>
    [i, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "normal")])),
  charged: {
    hit: stats => basicDMGFormula(data.charged.hit[stats.tlvl.auto], stats, "charged"),
    full: stats => basicDMGFormula(data.charged.full[stats.tlvl.auto], stats, "charged", "anemo"),
    hit_bonus: stats => basicDMGFormula(data.charged.hit[stats.tlvl.auto] * 0.33, stats, "charged"),
    full_bonus: stats => basicDMGFormula(data.charged.full[stats.tlvl.auto] * 0.33, stats, "charged", "anemo"),
  },
  plunging: Object.fromEntries(Object.entries(data.plunging).map(([name, arr]) =>
    [name, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "plunging")])),
  skill: Object.fromEntries(Object.entries(data.skill).map(([name, arr]) =>
    [name, stats => basicDMGFormula(arr[stats.tlvl.skill], stats, "skill")])),
  burst: Object.fromEntries([
    ["hit", stats => basicDMGFormula(data.burst.hit[stats.tlvl.burst], stats, "burst")],
    ...absorbableEle.map(eleKey => [eleKey, stats => basicDMGFormula(data.burst.hit[stats.tlvl.burst] / 2, stats, "burst", eleKey)]),
    ...absorbableEle.flatMap(eleKey => [
      [`${eleKey}_tot_7`, stats => totBurst(stats, eleKey, 7)],
      [`${eleKey}_tot_14`, stats => totBurst(stats, eleKey, 14)],
    ])
  ]),
}
function totBurst(stats, absorptionEle, swirlTicks) {
  const ultTicks = 20
  const absorptionTicks = 15
  const burstStatKey = `anemo_burst_${stats.hitMode}`
  const absorptionStatKey = `${absorptionEle}_burst_${stats.hitMode}`
  const swirlStatKey = `${absorptionEle}_swirl_hit`
  const burstScaling = data.burst.hit[stats.tlvl.burst] / 100
  return [s => ultTicks * burstScaling * s[burstStatKey] + absorptionTicks * 0.5 * burstScaling * s[absorptionStatKey] + swirlTicks * s[swirlStatKey], [burstStatKey, absorptionStatKey, swirlStatKey]]
}
export default formula