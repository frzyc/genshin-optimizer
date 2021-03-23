import { basicDMGFormula } from "../../../Util/FormulaUtil"

export const data = {
  baseStat: {
    characterHP: [821, 2108, 2721, 4076, 4512, 5189, 5770, 6448, 6884, 7561, 7996, 8674, 9110, 9787],
    characterATK: [18, 46, 59, 89, 98, 113, 125, 140, 150, 164, 174, 188, 198, 212],
    characterDEF: [48, 123, 159, 239, 264, 304, 338, 378, 403, 443, 468, 508, 533, 573]
  },
  specializeStat: {
    key: "geo_dmg_",
    value: [0, 0, 0, 0, 6, 6, 12, 12, 12, 12, 18, 18, 24, 24]
  },
  normal: {
    hit: [28, 30.1, 32.2, 35, 37.1, 39.2, 42, 44.8, 47.6, 50.4, 53.31, 57.12, 60.93, 64.74, 68.54]
  },
  charged: {
    dmg: [174.08, 187.14, 200.19, 217.6, 230.66, 243.71, 261.12, 278.53, 295.94, 313.34, 331.45, 355.12, 378.8, 402.47, 426.15],
    jade: [49.6, 53.32, 57.04, 62, 65.72, 69.44, 74.4, 79.36, 84.32, 89.28, 94.44, 101.18, 107.93, 114.68, 121.42],
  },
  plunging: {
    dmg: [56.83, 61.45, 66.08, 72.69, 77.31, 82.6, 89.87, 97.14, 104.41, 112.34, 120.27, 128.2, 136.12, 144.05, 151.98],
    low: [113.63, 122.88, 132.13, 145.35, 154.59, 165.17, 179.7, 194.23, 208.77, 224.62, 240.48, 256.34, 272.19, 288.05, 303.9],
    high: [141.93, 153.49, 165.04, 181.54, 193.1, 206.3, 224.45, 242.61, 260.76, 280.57, 300.37, 320.18, 339.98, 359.79, 379.59]
  },
  skill: {
    inheri_hp: [50.1, 53.1, 56.1, 60, 63, 66, 69.9, 73.8, 77.7, 81.6, 85.5, 89.4, 93.3, 97.2, 101.1],
    dmg: [230.4, 247.68, 264.96, 288, 305.28, 322.56, 345.6, 368.64, 391.68, 414.72, 437.76, 460.8, 489.6, 518.4, 547.2],
  },
  burst: {
    dmg_per_gem: [86.96, 93.48, 100, 108.7, 115.22, 121.74, 130.44, 139.14, 147.83, 156.53, 165.22, 173.92, 184.79, 195.66, 206.53],
  }
}
const formula = {
  normal: {
    hit: stats => basicDMGFormula(data.normal.hit[stats.tlvl.auto], stats, "normal")
  },
  charged: Object.fromEntries(Object.entries(data.charged).map(([name, arr]) =>
    [name, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "charged")])),
  plunging: Object.fromEntries(Object.entries(data.plunging).map(([name, arr]) =>
    [name, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "plunging")])),
  skill: {
    inheri_hp: stats => {
      const val = data.skill.inheri_hp[stats.tlvl.skill] / 100
      return [s => val * s.finalHP, ["finalHP"]]
    },
    dmg: stats => basicDMGFormula(data.skill.dmg[stats.tlvl.skill], stats, "skill")
  },
  burst: {
    dmg_per_gem: stats => basicDMGFormula(data.burst.dmg_per_gem[stats.tlvl.burst], stats, "burst"),
  },
}
export default formula