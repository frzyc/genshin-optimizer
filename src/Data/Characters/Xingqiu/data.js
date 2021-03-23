import { basicDMGFormula } from "../../../Util/FormulaUtil"

const data = {
  baseStat: {
    characterHP: [857, 2202, 2842, 4257, 4712, 5420, 6027, 6735, 7190, 7897, 8352, 9060, 9515, 10222],
    characterATK: [17, 43, 56, 84, 93, 107, 119, 133, 142, 156, 165, 179, 188, 202],
    characterDEF: [64, 163, 211, 316, 349, 402, 447, 499, 533, 585, 619, 671, 705, 758]
  },
  specializeStat: {
    key: "atk_",
    value: [0, 0, 0, 0, 6, 6, 12, 12, 12, 12, 18, 18, 24, 24]
  },
  normal: {
    hitArr: [
      [46.61, 50.41, 54.2, 59.62, 63.41, 67.75, 73.71, 79.67, 85.64, 92.14, 99.59, 108.36, 117.12, 125.88, 135.45],//1
      [47.64, 51.52, 55.4, 60.94, 64.82, 69.25, 75.34, 81.44, 87.53, 94.18, 101.8, 110.76, 119.71, 128.67, 138.44],//2
      [28.55, 30.88, 33.2, 36.52, 38.84, 41.5, 45.15, 48.8, 52.46, 56.44, 61.01, 66.37, 71.74, 77.11, 82.97],//3 x2
      [55.99, 60.54, 65.1, 71.61, 76.17, 81.38, 88.54, 95.7, 102.86, 110.67, 119.62, 130.15, 140.67, 151.2, 162.68],//4
      [35.86, 38.78, 41.7, 45.87, 48.79, 52.13, 56.71, 61.3, 65.89, 70.89, 76.62, 83.37, 90.11, 96.85, 104.21],//5
    ]
  },
  charged: {
    hit1: [47.3, 51.15, 55, 60.5, 64.35, 68.75, 74.8, 80.85, 86.9, 93.5, 101.06, 109.96, 118.85, 127.74, 137.45],
    hit2: [56.16, 60.73, 65.3, 71.83, 76.4, 81.63, 88.81, 95.99, 103.17, 111.01, 119.99, 130.55, 141.11, 151.67, 163.18]
  },
  plunging: {
    dmg: [63.93, 69.14, 74.34, 81.77, 86.98, 92.93, 101.1, 109.28, 117.46, 126.38, 135.3, 144.22, 153.14, 162.06, 170.98],
    low: [127.84, 138.24, 148.65, 163.51, 173.92, 185.81, 202.16, 218.51, 234.86, 252.7, 270.54, 288.38, 306.22, 324.05, 341.89],
    high: [159.68, 172.67, 185.67, 204.24, 217.23, 232.09, 252.51, 272.93, 293.36, 315.64, 337.92, 360.2, 382.48, 404.76, 427.04],
  },
  skill: {
    hit1: [168, 180.6, 193.2, 210, 222.6, 235.2, 252, 268.8, 285.6, 302.4, 319.2, 336, 357, 378, 399],
    hit2: [191.2, 205.54, 219.88, 239, 253.34, 267.68, 286.8, 305.92, 325.04, 344.16, 363.28, 382.4, 406.3, 430.2, 454.1],
    dmgRed: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 29, 29, 29, 29, 29],
  },
  burst: {
    dmg: [54.27, 58.34, 62.41, 67.84, 71.91, 75.98, 81.41, 86.84, 92.26, 97.69, 103.12, 108.54, 115.33, 122.11, 128.9],
  },
}

const formula = {
  normal: Object.fromEntries(data.normal.hitArr.map((percentArr, i) =>
    [i, stats => basicDMGFormula((i === 2 ? 2 : 1) * (percentArr[stats.tlvl.auto]), stats,"normal")])),
  charged: Object.fromEntries(Object.entries(data.charged).map(([name, arr]) =>
    [name, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "charged")])),
  plunging: Object.fromEntries(Object.entries(data.plunging).map(([name, arr]) =>
    [name, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "plunging")])),
  skill: Object.fromEntries([
    ...Object.entries(data.skill).filter(([name]) => name !== "dmgRed").map(([name, arr]) =>
      [name, stats => basicDMGFormula(arr[stats.tlvl.skill], stats, "skill")]),
    ...Object.entries(data.skill).filter(([name]) => name !== "dmgRed").map(([name, arr]) =>
      [`${name}RainCutter`, stats => basicDMGFormula(1.5 * arr[stats.tlvl.skill], stats, "skill")]),
    ["dmgRed", stats => {
      const flat = data.skill.dmgRed[stats.tlvl.skill]
      return [s => (flat + Math.min(24, 0.2 * s.hydro_dmg_)), ["hydro_dmg_"]]
    }],
  ]),
  burst: Object.fromEntries(Object.entries(data.burst).map(([name, arr]) =>
    [name, stats => basicDMGFormula(arr[stats.tlvl.burst], stats, "burst")])),
}

export default formula
export {
  data
}