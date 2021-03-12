import { basicDMGFormula } from "../../../Util/FormulaUtil"

export const data = {
  baseStat: {
    characterHP: [1020, 2646, 3521, 5268, 5889, 6776, 7604, 8500, 9121, 10025, 10647, 11561, 12182, 13103],
    characterATK: [25, 65, 87, 130, 145, 167, 187, 209, 225, 247, 262, 285, 300, 323],
    characterDEF: [62, 161, 215, 321, 359, 413, 464, 519, 556, 612, 649, 705, 743, 799]
  },
  specializeStat: {
    key: "critDMG_",
    value: [0, 0, 0, 0, 9.6, 9.6, 19.2, 19.2, 19.2, 19.2, 28.8, 28.8, 38.4, 38.4]
  },
  normal: {
    hitArr: [
      [41.02, 44.36, 47.7, 52.47, 55.81, 59.62, 64.87, 70.12, 75.37, 81.09, 86.81, 92.54, 98.26, 103.99, 109.71],
      [41.02, 44.36, 47.7, 52.47, 55.81, 59.62, 64.87, 70.12, 75.37, 81.09, 86.81, 92.54, 98.26, 103.99, 109.71],
      [54.44, 58.87, 63.3, 69.63, 74.06, 79.13, 86.09, 93.05, 100.01, 107.61, 115.21, 122.8, 130.4, 137.99, 145.59],
      [31.48, 34.04, 36.6, 40.26, 42.82, 45.75, 49.78, 53.8, 57.83, 62.22, 66.61, 71, 75.4, 79.79, 84.18],
      [34.4, 37.2, 40, 44, 46.8, 50, 54.4, 58.8, 63.2, 68, 72.8, 77.6, 82.4, 87.2, 92],
      [66.99, 72.45, 77.9, 85.69, 91.14, 97.38, 105.94, 114.51, 123.08, 132.43, 141.78, 151.13, 160.47, 169.82, 179.17],
    ],
  },
  charged: {
    hit1: [76.8, 83.05, 89.3, 98.23, 104.48, 111.63, 121.45, 131.27, 141.09, 151.81, 162.53, 173.24, 183.96, 194.67, 205.39],
    hit2: [86, 93, 100, 110, 117, 125, 136, 147, 158, 170, 182, 194, 206, 218, 230],
  },
  plunging: {
    dmg: [63.93, 69.14, 74.34, 81.77, 86.98, 92.93, 101.1, 109.28, 117.46, 126.38, 135.3, 144.22, 153.14, 162.06, 170.98],
    low: [127.84, 138.24, 148.65, 163.51, 173.92, 185.81, 202.16, 218.51, 234.86, 252.7, 270.54, 288.38, 306.22, 324.05, 341.89],
    high: [159.68, 172.67, 185.67, 204.24, 217.23, 232.09, 252.51, 272.93, 293.36, 315.64, 337.92, 360.2, 382.48, 404.76, 427.04],
  },
  skill: {
    stilleto: [50.4, 54.18, 57.96, 63, 66.78, 70.56, 75.6, 80.64, 85.68, 90.72, 95.76, 100.8, 107.1, 113.4, 119.7],
    slashing: [168, 180.6, 193.2, 210, 222.6, 235.2, 252, 268.8, 285.6, 302.4, 319.2, 336, 357, 378, 399],
    thunderclasp_slash: [84, 90.3, 96.6, 105, 111.3, 117.6, 126, 134.4, 142.8, 151.2, 159.6, 168, 178.5, 189, 199.5],
  },
  burst: {
    skill: [88, 94.6, 101.2, 110, 116.6, 123.2, 132, 140.8, 149.6, 158.4, 167.2, 176, 187, 198, 209],
    consec_slash: [24, 25.8, 27.6, 30, 31.8, 33.6, 36, 38.4, 40.8, 43.2, 45.6, 48, 51, 54, 57],
    last: [188.8, 202.96, 217.12, 236, 250.16, 264.32, 283.2, 302.08, 320.96, 339.84, 358.72, 377.6, 401.2, 424.8, 448.4],
  }
}
const formula = {
  normal: Object.fromEntries(data.normal.hitArr.map((arr, i) =>
    [i, (tlvl, stats) => basicDMGFormula(arr[tlvl], stats, "normal")])),
  charged: Object.fromEntries(Object.entries(data.charged).map(([name, arr]) =>
    [name, (tlvl, stats) => basicDMGFormula(arr[tlvl], stats, "charged")])),
  plunging: Object.fromEntries(Object.entries(data.plunging).map(([name, arr]) =>
    [name, (tlvl, stats) => basicDMGFormula(arr[tlvl], stats, "plunging")])),
  skill: {
    stilleto: (tlvl, stats) => basicDMGFormula(data.skill.stilleto[tlvl], stats, "skill"),
    slashing: (tlvl, stats) => basicDMGFormula(data.skill.slashing[tlvl], stats, "skill"),
    thunderclap_slashing: (tlvl, stats) => basicDMGFormula(data.skill.thunderclasp_slash[tlvl] * 2, stats, "skill"),
  },
  burst: {
    skill: (tlvl, stats) => basicDMGFormula(data.burst.skill[tlvl], stats, "burst"),
    consec_slash: (tlvl, stats) => basicDMGFormula(data.burst.consec_slash[tlvl] * 8, stats, "burst"),
    last: (tlvl, stats) => basicDMGFormula(data.burst.last[tlvl], stats, "burst"),
  }
}
export default formula