import { basicDMGFormula } from "../../../Util/FormulaUtil"

const data = {
  baseStat: {
    characterHP: [793, 2038, 2630, 3940, 4361, 5016, 5578, 6233, 6654, 7309, 7730, 8385, 8806, 9461],
    characterATK: [19, 48, 62, 93, 103, 118, 131, 147, 157, 172, 182, 198, 208, 223],
    characterDEF: [50, 129, 167, 250, 277, 318, 354, 396, 423, 464, 491, 532, 559, 601]
  },
  specializeStat: {
    key: "atk_",
    value: [0, 0, 0, 0, 7.5, 7.5, 15, 15, 15, 15, 22.5, 22.5, 30, 30]
  },
  normal: {
    hitArr: [
      [36.12, 39.06, 42, 46.2, 49.14, 52.5, 57.12, 61.74, 66.36, 71.4, 76.44, 81.48, 86.52, 91.56, 96.6],
      [36.12, 39.06, 42, 46.2, 49.14, 52.5, 57.12, 61.74, 66.36, 71.4, 76.44, 81.48, 86.52, 91.56, 96.6],
      [46.44, 50.22, 54, 59.4, 63.18, 67.5, 73.44, 79.38, 85.32, 91.8, 98.28, 104.76, 111.24, 117.72, 124.2],
      [47.3, 51.15, 55, 60.5, 64.35, 68.75, 74.8, 80.85, 86.9, 93.5, 100.1, 106.7, 113.3, 119.9, 126.5],
      [59.34, 64.17, 69, 75.9, 80.73, 86.25, 93.84, 101.43, 109.02, 117.3, 125.58, 133.86, 142.14, 150.42, 158.7],
    ],
  },
  charged: {
    aimedShot: [43.86, 47.43, 51, 56.1, 59.67, 63.75, 69.36, 74.97, 80.58, 86.7, 92.82, 98.94, 105.06, 111.18, 117.3],
    fullAimedShot: [124, 133.3, 142.6, 155, 164.3, 173.6, 186, 198.4, 210.8, 223.2, 235.6, 248, 263.5, 279, 294.5]
  },
  plunging: {
    dmg: [56.83, 61.45, 66.08, 72.69, 77.31, 82.6, 89.87, 97.14, 104.41, 112.34, 120.27, 128.2, 136.12, 144.05, 151.98],
    low: [113.63, 122.88, 132.13, 145.35, 154.59, 165.17, 179.7, 194.23, 208.77, 224.62, 240.48, 256.34, 272.19, 288.05, 303.9],
    high: [141.93, 153.49, 165.04, 181.54, 193.1, 206.3, 224.45, 242.61, 260.76, 280.57, 300.37, 320.18, 339.98, 359.79, 379.59]
  },
  skill: {
    hp: [41.36, 44.46, 47.56, 51.7, 54.8, 57.9, 62.04, 66.18, 70.31, 74.45, 78.58, 82.72, 87.89, 93.06, 98.23],
    dmg: [123.2, 132.44, 141.68, 154, 163.24, 172.48, 184.8, 197.12, 209.44, 221.76, 234.08, 246.4, 261.8, 277.2, 292.6],
  },
  burst: {
    dmgPerWave: [28.08, 30.19, 32.29, 35.1, 37.21, 39.31, 42.12, 44.93, 47.74, 50.54, 53.35, 56.16, 59.67, 63.18, 66.69],
    totDMG: [505.44, 543.35, 581.26, 631.8, 669.71, 707.62, 758.16, 808.7, 859.25, 909.79, 960.34, 1010.88, 1074.06, 1137.24, 1200.42],
  }
}

const formula = {
  normal: Object.fromEntries(data.normal.hitArr.map((percentArr, i) => [i, stats =>
    basicDMGFormula(percentArr[stats.tlvl.auto], stats, "normal")])),
  charged: {
    aimShot: stats => basicDMGFormula(data.charged.aimedShot[stats.tlvl.auto], stats, "charged"),
    fullAimedShot: stats => basicDMGFormula(data.charged.fullAimedShot[stats.tlvl.auto], stats, "charged", true),
  },
  plunging: Object.fromEntries(Object.entries(data.plunging).map(([key, arr]) => [key, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "plunging")])),
  skill: {
    hp: stats => {
      const hp = data.skill.hp[stats.tlvl.skill] / 100
      return [(s) => hp * s.finalHP, ["finalHP"]]
    },
    dmg: stats => basicDMGFormula(data.skill.dmg[stats.tlvl.skill], stats, "skill"),
    detonationDMG: stats => basicDMGFormula(data.skill.dmg[stats.tlvl.skill] + 200, stats, "skill"),
  },
  burst: {
    dmgPerWave: stats => basicDMGFormula(data.burst.dmgPerWave[stats.tlvl.burst], stats, "burst"),
    totDMG: stats => basicDMGFormula(data.burst.totDMG[stats.tlvl.burst], stats, "burst"),
  }
}

export default formula
export {
  data
}