import { basicDMGFormula } from "../../../Util/FormulaUtil"

export const data = {
  baseStat: {
    characterHP: [912, 2342, 3024, 4529, 5013, 5766, 6411, 7164, 7648, 8401, 8885, 9638, 10122, 10875],
    characterATK: [19, 49, 63, 94, 104, 119, 133, 149, 159, 174, 184, 200, 210, 225],
    characterDEF: [56, 144, 186, 279, 308, 355, 394, 441, 470, 517, 546, 593, 623, 669]
  },
  specializeStat: {
    key: "eleMas",
    value: [0, 0, 0, 0, 24, 24, 48, 48, 48, 48, 72, 72, 96, 96]
  },
  normal: {
    hitArr: [
      [42.05, 45.48, 48.9, 53.79, 57.21, 61.13, 66.5, 71.88, 77.26, 83.13, 89.85, 97.76, 105.67, 113.58, 122.2],//1
      [42.14, 45.57, 49, 53.9, 57.33, 61.25, 66.64, 72.03, 77.42, 83.3, 90.04, 97.96, 105.88, 113.81, 122.45],//2
      [26.06, 28.18, 30.3, 33.33, 35.45, 37.87, 41.21, 44.54, 47.87, 51.51, 55.68, 60.58, 65.48, 70.37, 75.72],//3 x2
      [14.1, 15.25, 16.4, 18.04, 19.19, 20.5, 22.3, 24.11, 25.91, 27.88, 30.14, 32.79, 35.44, 38.09, 40.98],//4 x4
      [71.04, 76.82, 82.6, 90.86, 96.64, 103.25, 112.34, 121.42, 130.51, 140.42, 151.78, 165.13, 178.49, 191.85, 206.42],//5
    ],
  },
  charged: {
    dmg: [121.69, 131.6, 141.5, 155.65, 165.56, 176.88, 192.44, 208.01, 223.57, 240.55, 260.01, 282.89, 305.77, 328.65, 353.61],
  },
  plunging: {
    dmg: [63.93, 69.14, 74.34, 81.77, 86.98, 92.93, 101.1, 109.28, 117.46, 126.38, 135.3, 144.22, 153.14, 162.06, 170.98],
    low: [127.84, 138.24, 148.65, 163.51, 173.92, 185.81, 202.16, 218.51, 234.86, 252.7, 270.54, 288.38, 306.22, 324.05, 341.89],
    high: [159.68, 172.67, 185.67, 204.24, 217.23, 232.09, 252.51, 272.93, 293.36, 315.64, 337.92, 360.2, 382.48, 404.76, 427.04],
  },
  skill: {
    dmg: [111.28, 119.63, 127.97, 139.1, 147.45, 155.79, 166.92, 178.05, 189.18, 200.3, 211.43, 222.56, 236.47, 250.38, 264.29],
  },
  burst: {
    hit1: [72, 77.4, 82.8, 90, 95.4, 100.8, 108, 115.2, 122.4, 129.6, 136.8, 144, 153, 162, 171],
    hit2: [88, 94.6, 101.2, 110, 116.6, 123.2, 132, 140.8, 149.6, 158.4, 167.2, 176, 187, 198, 209],
    hit3: [109.6, 117.82, 126.04, 137, 145.22, 153.44, 164.4, 175.36, 186.32, 197.28, 208.24, 219.2, 232.9, 246.6, 260.3],
    dmg: [112, 120.4, 128.8, 140, 148.4, 156.8, 168, 179.2, 190.4, 201.6, 212.8, 224, 238, 252, 266],
  }
}
const formula = {
  normal: Object.fromEntries(data.normal.hitArr.map((arr, i) =>
    [i, (tlvl, stats) => basicDMGFormula((i === 2 ? 2 : i === 3 ? 4 : 1) * (arr[tlvl]), stats, "normal")])),
  charged: Object.fromEntries(Object.entries(data.charged).map(([name, arr]) =>
    [name, (tlvl, stats) => basicDMGFormula(arr[tlvl], stats, "charged")])),
  plunging: Object.fromEntries(Object.entries(data.plunging).map(([name, arr]) =>
    [name, (tlvl, stats) => basicDMGFormula(arr[tlvl], stats, "plunging")])),
  skill: {
    dmg: (tlvl, stats) => basicDMGFormula(data.skill.dmg[tlvl], stats, "skill"),
  },
  burst: {
    hit1: (tlvl, stats) => basicDMGFormula(data.burst.hit1[tlvl], stats, "burst"),
    hit2: (tlvl, stats) => basicDMGFormula(data.burst.hit2[tlvl], stats, "burst"),
    hit3: (tlvl, stats) => basicDMGFormula(data.burst.hit3[tlvl], stats, "burst"),
    dmg: (tlvl, stats) => basicDMGFormula(data.burst.dmg[tlvl], stats, "burst"),
  },
  constellation2: {
    dmg: (tlvl, stats) => basicDMGFormula(75, stats, "elemental"),
  }
}
export default formula