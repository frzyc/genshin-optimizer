import { IFormulaSheet } from "../../../Types/character"
import { basicDMGFormula } from "../../../Util/FormulaUtil"

export const data = {
  normal: {
    hitArr: [
      [52.46, 56.73, 61, 67.1, 71.37, 76.25, 82.96, 89.67, 96.38, 103.7, 111.02, 118.34, 125.66, 132.98, 140.3],//1
      [51.6, 55.8, 60, 66, 70.2, 75, 81.6, 88.2, 94.8, 102, 109.2, 116.4, 123.6, 130.8, 138],//2
      [31.82, 34.41, 37, 40.7, 43.29, 46.25, 50.32, 54.39, 58.46, 62.9, 67.34, 71.78, 76.22, 80.66, 85.1],//3 x2
      [69.66, 75.33, 81, 89.1, 94.77, 101.25, 110.16, 119.07, 127.98, 137.7, 147.42, 157.14, 166.86, 176.58, 186.3],//4
      [41.62, 45.01, 48.4, 53.24, 56.63, 60.5, 65.82, 71.15, 76.47, 82.28, 88.09, 93.9, 99.7, 105.51, 111.32],//5.1
      [43, 46.5, 50, 55, 58.5, 62.5, 68, 73.5, 79, 85, 91, 97, 103, 109, 115]//5.2
    ],
  },
  charged: {
    dmg: [136.74, 147.87, 159, 174.9, 186.03, 198.75, 216.24, 233.73, 251.22, 270.3, 289.38, 308.46, 327.54, 346.62, 365.7],
  },
  plunging: {
    dmg: [63.93, 69.14, 74.34, 81.77, 86.98, 92.93, 101.1, 109.28, 117.46, 126.38, 135.3, 144.22, 153.14, 162.06, 170.98],
    low: [127.84, 138.24, 148.65, 163.51, 173.92, 185.81, 202.16, 218.51, 234.86, 252.7, 270.54, 288.38, 306.22, 324.05, 341.89],
    high: [159.68, 172.67, 185.67, 204.24, 217.23, 232.09, 252.51, 272.93, 293.36, 315.64, 337.92, 360.2, 382.48, 404.76, 427.04],
  },
  skill: {
    hit1: [58.4, 62.78, 67.16, 73, 77.38, 81.76, 87.6, 93.44, 99.28, 105.12, 110.96, 116.8, 124.1, 131.4, 138.7],
    hit2: [136, 146.2, 156.4, 170, 180.2, 190.4, 204, 217.6, 231.2, 244.8, 258.4, 272, 289, 306, 323]
  },
  burst: {
    hit1: [104, 111.8, 119.6, 130, 137.8, 145.6, 156, 166.4, 176.8, 187.2, 197.6, 208, 221, 234, 247],
    hit2: [152, 163.4, 174.8, 190, 201.4, 212.8, 228, 243.2, 258.4, 273.6, 288.8, 304, 323, 342, 361],
    dot: [132, 141.9, 151.8, 165, 174.9, 184.8, 198, 211.2, 224.4, 237.6, 250.8, 264, 280.5, 297, 313.5],
  }
}
const formula: IFormulaSheet = {
  normal: Object.fromEntries(data.normal.hitArr.map((arr, i) =>
    [i, stats => basicDMGFormula((arr[stats.tlvl.auto]), stats, "normal")])),
  charged: Object.fromEntries(Object.entries(data.charged).map(([name, arr]) =>
    [name, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "charged")])),
  plunging: Object.fromEntries(Object.entries(data.plunging).map(([name, arr]) =>
    [name, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "plunging")])),
  skill: Object.fromEntries(Object.entries(data.skill).map(([name, arr]) =>
    [name, stats => basicDMGFormula(arr[stats.tlvl.skill], stats, "skill")])),
  burst: Object.fromEntries(Object.entries(data.burst).map(([name, arr]) =>
    [name, stats => basicDMGFormula(arr[stats.tlvl.burst], stats, "burst")])),
  passive2: {
    critConv: stats => [s => (s.premod?.critRate_ ?? s.critRate_) * 0.15, ["critRate_"]]
  }
} as const
export default formula