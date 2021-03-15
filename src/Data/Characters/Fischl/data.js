import { basicDMGFormula } from "../../../Util/FormulaUtil"

const data = {
  baseStat: {
    characterHP: [770, 1979, 2555, 3827, 4236, 4872, 5418, 6054, 6463, 7099, 7508, 8144, 8553, 9189],
    characterATK: [20, 53, 68, 102, 113, 130, 144, 161, 172, 189, 200, 216, 227, 244],
    characterDEF: [50, 128, 165, 247, 274, 315, 350, 391, 418, 459, 485, 526, 553, 594]
  },
  specializeStat: {
    key: "atk_",
    value: [0, 0, 0, 0, 6, 6, 12, 12, 12, 12, 18, 18, 24, 24]
  },
  normal: {
    hitArr: [
      [44.12, 47.71, 51.3, 56.43, 60.02, 64.13, 69.77, 75.41, 81.05, 87.21, 93.37, 99.52, 105.68, 111.83, 117.99],
      [46.78, 50.59, 54.4, 59.84, 63.65, 68, 73.98, 79.97, 85.95, 92.48, 99.01, 105.54, 112.06, 118.59, 125.12],
      [58.14, 62.87, 67.6, 74.36, 79.09, 84.5, 91.94, 99.37, 106.81, 114.92, 123.03, 131.14, 139.26, 147.37, 155.48],
      [57.71, 62.4, 67.1, 73.81, 78.51, 83.88, 91.26, 98.64, 106.02, 114.07, 122.12, 130.17, 138.23, 146.28, 154.33],
      [72.07, 77.93, 83.8, 92.18, 98.05, 104.75, 113.97, 123.19, 132.4, 142.46, 152.52, 162.57, 172.63, 182.68, 192.74],
    ]
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
    oz: [88.8, 95.46, 102.12, 111, 117.66, 124.32, 133.2, 142.08, 150.96, 159.84, 168.72, 177.6, 188.7, 199.8, 210.9],
    dmg: [115.44, 124.1, 132.76, 144.3, 152.96, 161.62, 173.16, 184.7, 196.25, 207.79, 219.34, 230.88, 245.31, 259.74, 274.17],
  },
  burst: {
    dmg: [208, 223.6, 239.2, 260, 275.6, 291.2, 312, 332.8, 353.6, 374.4, 395.2, 416, 442, 468, 494],
  }
}

const formula = {
  normal: Object.fromEntries(data.normal.hitArr.map((percentArr, i) => [i, (tlvl, stats) =>
    basicDMGFormula(percentArr[tlvl], stats, "normal")])),
  charged: {
    aimShot: (tlvl, stats) => basicDMGFormula(data.charged.aimedShot[tlvl], stats, "charged"),
    fullAimedShot: (tlvl, stats) => basicDMGFormula(data.charged.fullAimedShot[tlvl], stats, "charged", true),
    fullAimedShotOz: (tlvl, stats) => basicDMGFormula(data.charged.fullAimedShot[tlvl] * (152.7 / 100), stats, "charged", true),
  },
  plunging: {
    dmg: (tlvl, stats) => basicDMGFormula(data.plunging.dmg[tlvl], stats, "plunging"),
    low: (tlvl, stats) => basicDMGFormula(data.plunging.low[tlvl], stats, "plunging"),
    high: (tlvl, stats) => basicDMGFormula(data.plunging.high[tlvl], stats, "plunging"),
  },
  skill: {
    oz: (tlvl, stats) => basicDMGFormula(data.skill.oz[tlvl], stats, "skill"),
    dmg: (tlvl, stats) => basicDMGFormula(data.skill.dmg[tlvl] + (stats.constellation >= 2 ? 200 : 0), stats, "skill"),
    activeChar: (tlvl, stats) => basicDMGFormula(30, stats, "skill"),
  },
  burst: {
    dmg: (tlvl, stats) => basicDMGFormula(data.burst.dmg[tlvl], stats, "burst"),
    addDmg: (tlvl, stats) => basicDMGFormula(222, stats, "burst"),
    regen: (tlvl, stats) => [s => 0.2 * s.finalHP * s.heal_multi, ["finalHP", "heal_multi"]]
  },
  passive2: {
    thunderRetri: (tlvl, stats) => basicDMGFormula(80, stats, "skill"),
  },
  constellation1: {
    jointAttDmg: (tlvl, stats) => basicDMGFormula(22, stats, "normal"),
  }
}

export default formula
export {
  data
}