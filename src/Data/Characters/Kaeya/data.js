import { basicDMGFormula } from "../../../Util/FormulaUtil"

export const data = {
  baseStat: {
    characterHP: [976, 2506, 3235, 4846, 5364, 6170, 6860, 7666, 8184, 8989, 9507, 10312, 10830, 11636],
    characterATK: [19, 48, 62, 93, 103, 118, 131, 147, 157, 172, 182, 198, 208, 223],
    characterDEF: [66, 171, 220, 330, 365, 420, 467, 522, 557, 612, 647, 702, 737, 792]
  },
  specializeStat: {
    key: "enerRech_",
    value: [0, 0, 0, 0, 6.7, 6.7, 13.3, 13.3, 13.3, 13.3, 20, 20, 26.7, 26.7]
  },
  normal: {
    hitArr: [
      [53.75, 58.13, 62.5, 68.75, 73.13, 78.13, 85, 91.88, 98.75, 106.25, 114.84, 124.95, 135.06, 145.16, 156.19],
      [51.69, 55.89, 60.1, 66.11, 70.32, 75.13, 81.74, 88.35, 94.96, 102.17, 110.43, 120.15, 129.87, 139.59, 150.19],
      [65.27, 70.59, 75.9, 83.49, 88.8, 94.88, 103.22, 111.57, 119.92, 129.03, 139.47, 151.74, 164.01, 176.29, 189.67],
      [70.86, 76.63, 82.4, 90.64, 96.41, 103, 112.06, 121.13, 130.19, 140.08, 151.41, 164.73, 178.06, 191.38, 205.92],
      [88.24, 95.42, 102.6, 112.86, 120.04, 128.25, 139.54, 150.82, 162.11, 174.42, 188.53, 205.12, 221.71, 238.3, 256.4]
    ]
  },
  charged: {
    atk1: [55.04, 59.52, 64, 70.4, 74.88, 80, 87.04, 94.08, 101.12, 108.8, 117.6, 127.95, 138.3, 148.65, 159.94,],
    atk2: [73.1, 79.05, 85, 93.5, 99.45, 106.25, 115.6, 124.95, 134.3, 144.5, 156.19, 169.93, 183.68, 197.42, 212.42],
  },
  plunging: {
    dmg: [63.93, 69.14, 74.34, 81.77, 86.98, 92.93, 101.1, 109.28, 117.46, 126.38, 135.3, 144.22, 153.14, 162.06, 170.98],
    low: [127.84, 138.24, 148.65, 163.51, 173.92, 185.81, 202.16, 218.51, 234.86, 252.7, 270.54, 288.38, 306.22, 324.05, 341.89],
    high: [159.68, 172.67, 185.67, 204.24, 217.23, 232.09, 252.51, 272.93, 293.36, 315.64, 337.92, 360.2, 382.48, 404.76, 427.04]
  },
  skill: {
    dmg: [191.2, 205.54, 219.88, 239, 253.34, 267.68, 286.8, 305.92, 325.04, 344.16, 363.28, 382.4, 406.3, 430.2, 454.1],
  },
  burst: {
    dmg: [77.6, 83.42, 89.24, 97, 102.82, 108.64, 116.4, 124.16, 131.92, 139.68, 147.44, 155.2, 164.9, 174.6, 184.3],
  }
}
const formula = {
  normal: Object.fromEntries(data.normal.hitArr.map((arr, i) =>
    [i, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "normal")])),
  charged: Object.fromEntries(Object.entries(data.charged).map(([name, arr]) =>
    [name, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "charged")])),
  plunging: Object.fromEntries(Object.entries(data.plunging).map(([name, arr]) =>
    [name, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "plunging")])),
  skill: {
    dmg: stats => basicDMGFormula(data.skill.dmg[stats.tlvl.skill], stats, "skill"),
  },
  burst: {
    dmg: stats => basicDMGFormula(data.burst.dmg[stats.tlvl.burst], stats, "burst"),
  },
  passive1: {
    heal: stats => [s => 0.15 * s.finalATK * s.heal_multi, ["finalATK", "heal_multi"]],
  }
}
export default formula