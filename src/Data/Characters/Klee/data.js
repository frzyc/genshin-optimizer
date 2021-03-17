import { basicDMGFormula } from "../../../Util/FormulaUtil"

const data = {
  baseStat: {
    characterHP: [801, 2077, 2764, 4136, 4623, 5319, 5970, 6673, 7161, 7870, 8358, 9076, 9563, 10287],
    characterATK: [24, 63, 84, 125, 140, 161, 180, 202, 216, 238, 253, 274, 289, 311],
    characterDEF: [48, 124, 165, 247, 276, 318, 357, 399, 428, 470, 500, 542, 572, 615]
  },
  specializeStat: {
    key: "pyro_dmg_",
    value: [0, 0, 0, 0, 7.2, 7.2, 14.4, 14.4, 14.4, 14.4, 21.6, 21.6, 28.8, 28.8]
  },
  normal: {
    hitArr: [
      [72.16, 77.57, 82.98, 90.2, 95.61, 101.02, 108.24, 115.46, 122.67, 129.89, 137.39, 147.21, 157.02, 166.83, 176.65],
      [62.4, 67.08, 71.76, 78, 82.68, 87.36, 93.6, 99.84, 106.08, 112.32, 118.81, 127.3, 135.78, 144.27, 152.76],
      [89.92, 96.66, 103.41, 112.4, 119.14, 125.89, 134.88, 143.87, 152.86, 161.86, 171.21, 183.44, 195.67, 207.9, 220.12]
    ],
  },
  charged: {
    dmg: [157.36, 169.16, 180.96, 196.7, 208.5, 220.3, 236.04, 251.78, 267.51, 283.25, 299.61, 321.01, 342.42, 363.82, 385.22],
  },
  plunging: {
    dmg: [56.83, 61.45, 66.08, 72.69, 77.31, 82.6, 89.87, 97.14, 104.41, 112.34, 120.27, 128.2, 136.12, 144.05, 151.98],
    low: [113.63, 122.88, 132.13, 145.35, 154.59, 165.17, 179.7, 194.23, 208.77, 224.62, 240.48, 256.34, 272.19, 288.05, 303.9],
    high: [141.93, 153.49, 165.04, 181.54, 193.1, 206.3, 224.45, 242.61, 260.76, 280.57, 300.37, 320.18, 339.98, 359.79, 379.59]
  },
  skill: {
    jumpyDmg: [95.2, 102.34, 109.48, 119, 126.14, 133.28, 142.8, 152.32, 161.84, 171.36, 180.88, 190.4, 202.3, 214.2, 226.1],
    mineDmg: [32.8, 35.26, 37.72, 41, 43.46, 45.92, 49.2, 52.48, 55.76, 59.04, 62.32, 65.6, 69.7, 73.8, 77.9],
  },
  burst: {
    dmg: [42.64, 45.84, 49.04, 53.3, 56.5, 59.7, 63.96, 68.22, 72.49, 76.75, 81.02, 85.28, 90.61, 95.94, 101.27],
  }
}

const formula = {
  normal: Object.fromEntries(data.normal.hitArr.map((percentArr, i) => [i, (tlvl, stats) =>
    basicDMGFormula(percentArr[tlvl], stats, "normal")])),
  charged: {
    dmg: (tlvl, stats) => basicDMGFormula(data.charged.dmg[tlvl], stats, "charged"),
  },
  plunging: {
    dmg: (tlvl, stats) => basicDMGFormula(data.plunging.dmg[tlvl], stats, "plunging"),
    low: (tlvl, stats) => basicDMGFormula(data.plunging.low[tlvl], stats, "plunging"),
    high: (tlvl, stats) => basicDMGFormula(data.plunging.high[tlvl], stats, "plunging"),
  },
  skill: {
    jumpyDmg: (tlvl, stats) => basicDMGFormula(data.skill.jumpyDmg[tlvl], stats, "skill"),
    mineDmg: (tlvl, stats) => basicDMGFormula(data.skill.mineDmg[tlvl], stats, "skill"),
  },
  burst: {
    dmg: (tlvl, stats) => basicDMGFormula(data.burst.dmg[tlvl], stats, "burst"),
    dmgPounding: (tlvl, stats) => basicDMGFormula(data.burst.dmg[tlvl] * 1.5, stats, "burst"),
  },
  constellation1: {
    dmgChained: (tlvl, stats) =>
      basicDMGFormula(data.burst.dmg[stats.talentLevelKeys.burst] * 1.2, stats, "burst"),
  },
  constellation4: {
    dmg: (tlvl, stats) => basicDMGFormula(555, stats, "elemental"),
  }
}

export default formula
export {
  data
}