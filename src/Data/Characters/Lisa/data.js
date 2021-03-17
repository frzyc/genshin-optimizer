import { basicDMGFormula } from "../../../Util/FormulaUtil"

export const data = {
    baseStat: {
        characterHP: [802, 2061, 2661, 3985, 4411, 5074, 5642, 6305, 6731, 7393, 7818, 8481, 8907, 9570],
        characterATK: [19, 50, 64, 96, 107, 123, 136, 153, 163, 179, 189, 205, 215, 232],
        characterDEF: [48, 123, 159, 239, 264, 304, 338, 378, 403, 443, 468, 508, 533, 573]
      },
      specializeStat: {
        key: "eleMas",
        value: [0, 0, 0, 0, 24, 24, 48, 48, 48, 48, 72, 72, 96, 96]
      },
  normal: {
    hitArr: [
      [39.6, 42.57, 45.54, 49.5, 52.47, 55.44, 59.4, 63.36, 67.32, 71.28, 75.4, 80.78, 86.17, 91.56, 96.94],
      [35.92, 38.61, 41.31, 44.9, 47.59, 50.29, 53.88, 57.47, 61.06, 64.66, 68.39, 73.28, 78.16, 83.05, 87.93],
      [42.8, 46.01, 49.22, 53.5, 56.71, 59.92, 64.2, 68.48, 72.76, 77.04, 81.49, 87.31, 93.13, 98.95, 104.77],
      [54.96, 59.08, 63.2, 68.7, 72.82, 76.94, 82.44, 87.94, 93.43, 98.93, 104.64, 112.12, 119.59, 127.07, 134.54],
    ],
  },
  charged: {
    hit: [177.12, 190.4, 203.69, 221.4, 234.68, 247.97, 265.68, 283.39, 301.1, 318.82, 337.24, 361.32, 385.41, 409.5,433.59],
  },
  plunging: {
    dmg: [56.83, 61.45, 66.08, 72.69, 77.31, 82.6, 89.87, 97.14, 104.41, 112.34, 120.27, 128.2, 136.12, 144.05, 151.98],
    low: [113.63, 122.88, 132.13, 145.35, 154.59, 165.17, 179.7, 194.23, 208.77, 224.62, 240.48, 256.34, 272.19, 288.05, 303.9],
    high: [141.93, 153.49, 165.04, 181.54, 193.1, 206.3, 224.45, 242.61, 260.76, 280.57, 300.37, 320.18, 339.98, 359.79, 379.59],
  },
  skill: {
    dmg: [80, 86, 92, 100, 106, 112, 120, 128, 136, 144, 152, 160, 170, 180, 190],
    stack0: [320, 344, 368, 400, 424, 448, 480, 512, 544, 576, 608, 640, 680, 720, 760],
    stack1: [368, 395.6, 423.2, 460, 487.6, 515.2, 552, 588.8, 625.6, 662.4, 699.2, 736, 782, 828, 874],  
    stack2: [424, 455.8, 487.6, 530, 561.8, 593.6, 636, 678.4, 720.8, 763.2, 805.6, 848, 901, 954, 1007],  
    stack3: [487.2, 523.74, 560.28, 609, 645.54, 682.08, 730.8, 779.52, 828.24, 876.96, 925.68, 974.4, 1035.3, 1096.2, 1157.1],  

  },
  burst: {
    dmg: [36.56, 39.3, 42.04, 45.7, 48.44, 51.18, 54.84, 58.5, 62.15, 65.81, 69.46, 73.12, 77.69, 82.26, 86.83],
  
  }
}
const formula = {
  normal: Object.fromEntries(data.normal.hitArr.map((arr, i) =>
    [i, (tlvl, stats) => basicDMGFormula(arr[tlvl], stats, "normal")])),
  charged: Object.fromEntries(Object.entries(data.charged).map(([name, arr]) =>
    [name, (tlvl, stats) => basicDMGFormula(arr[tlvl], stats, "charged")])),
  plunging: Object.fromEntries(Object.entries(data.plunging).map(([name, arr]) =>
    [name, (tlvl, stats) => basicDMGFormula(arr[tlvl], stats, "plunging")])),
  skill: Object.fromEntries(Object.entries(data.skill).map(([name, arr]) =>
      [name, (tlvl, stats) => basicDMGFormula(arr[tlvl], stats, "skill")])),
  burst: {
    dmg: (tlvl, stats) => basicDMGFormula(data.burst.dmg[tlvl], stats, "burst")
  },
  passive1: {
    hit: (tlvl, stats) => basicDMGFormula(data.skill.dmg[stats.talentLevelKeys.skill] / 2, stats, "skill"),
  }
}
export default formula