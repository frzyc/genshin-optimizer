import { basicDMGFormula } from "../../../Util/FormulaUtil"

const data = {
  baseStat: {
    characterHP: [1144, 2967, 3948, 5908, 6605, 7599, 8528, 9533, 10230, 11243, 11940, 12965, 13662, 14695],
    characterATK: [19, 48, 64, 96, 108, 124, 139, 155, 166, 183, 194, 211, 222, 239],
    characterDEF: [60, 155, 206, 309, 345, 397, 446, 499, 535, 588, 624, 678, 715, 769]
  },
  specializeStat: {
    key: "heal_",
    value: [0, 0, 0, 0, 5.5, 5.5, 11.1, 11.1, 11.1, 11.1, 16.6, 16.6, 22.2, 22.2]
  },
  normal: {
    hitArr: [
      [48.33, 52.27, 56.2, 61.82, 65.75, 70.25, 76.43, 82.61, 88.8, 95.54, 103.27, 112.36, 121.44, 130.53, 140.44],
      [45.58, 49.29, 53, 58.3, 62.01, 66.25, 72.08, 77.91, 83.74, 90.1, 97.39, 105.96, 114.53, 123.1, 132.45],
      [60.29, 65.19, 70.1, 77.11, 82.02, 87.63, 95.34, 103.05, 110.76, 119.17, 128.81, 140.14, 151.48, 162.81, 175.18],
      [65.88, 71.24, 76.6, 84.26, 89.62, 95.75, 104.18, 112.6, 121.03, 130.22, 140.75, 153.14, 165.52, 177.91, 191.42],
      [79.21, 85.65, 92.1, 101.31, 107.76, 115.13, 125.26, 135.39, 145.52, 156.57, 169.23, 184.13, 199.02, 213.91, 230.16],
    ],
  },
  charged: {
    dmg: [162.02, 175.21, 188.4, 207.24, 220.43, 235.5, 256.22, 276.95, 297.67, 320.28, 346.19, 376.65, 407.11, 437.58, 470.81],
  },
  plunging: {
    dmg: [63.93, 69.14, 74.34, 81.77, 86.98, 92.93, 101.1, 109.28, 117.46, 126.38, 135.3, 144.22, 153.14, 162.06, 170.98],
    low: [127.84, 138.24, 148.65, 163.51, 173.92, 185.81, 202.16, 218.51, 234.86, 252.7, 270.54, 288.38, 306.22, 324.05, 341.89],
    high: [159.68, 172.67, 185.67, 204.24, 217.23, 232.09, 252.51, 272.93, 293.36, 315.64, 337.92, 360.2, 382.48, 404.76, 427.04]
  },
  skill: {
    dmg: [292, 313.9, 335.8, 365, 386.9, 408.8, 438, 467.2, 496.4, 525.6, 554.8, 584, 620.5, 657, 693.5],
  },
  burst: {
    skill: [424.8, 456.66, 488.52, 531, 562.86, 594.72, 637.2, 679.68, 722.16, 764.64, 807.12, 849.6, 902.7, 955.8, 1008.9],
    field_dmg: [78.4, 84.28, 90.16, 98, 103.88, 109.76, 117.6, 125.44, 133.28, 141.12, 148.96, 156.8, 166.6, 176.4, 186.2],
    heal_flat: [1540, 1694, 1861, 2041, 2234, 2439, 2657, 2888, 3132, 3389, 3659, 3941, 4236, 4544, 4865],
    heal_atk: [251.2, 270.04, 288.88, 314, 332.84, 351.68, 376.8, 401.92, 427.04, 452.16, 477.28, 502.4, 533.8, 565.2, 596.6],
    regen_flat: [154, 169, 186, 204, 223, 244, 266, 289, 313, 339, 366, 394, 424, 454, 487],
    regen_atk: [25.12, 27, 28.89, 31.4, 33.28, 35.17, 37.68, 40.19, 42.7, 45.22, 47.73, 50.24, 53.38, 56.52, 59.66],
  }
}

const formula = {
  normal: Object.fromEntries(data.normal.hitArr.map((percentArr, i) => [i, (tlvl, stats) =>
    basicDMGFormula(percentArr[tlvl], stats, "normal")])),
  charged: {
    dmg: (tlvl, stats) => basicDMGFormula(data.charged.dmg[tlvl], stats, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(data.plunging).map(([key, arr]) => [key, (tlvl, stats) => basicDMGFormula(arr[tlvl], stats, "plunging")])),
  skill: {
    dmg: (tlvl, stats) => basicDMGFormula(data.skill.dmg[tlvl], stats, "skill"),
    dmg_hold: (tlvl, stats) => basicDMGFormula(data.skill.dmg[tlvl] * 1.4, stats, "skill")
  },
  burst: {
    skill: (tlvl, stats) => basicDMGFormula(data.burst.skill[tlvl], stats, "burst"),
    field_dmg: (tlvl, stats) => basicDMGFormula(data.burst.field_dmg[tlvl], stats, "burst"),
    heal: (tlvl) => {
      const atk = data.burst.heal_atk[tlvl] / 100
      const flat = data.burst.heal_flat[tlvl]
      return [s => (atk * s.finalATK + flat) * s.heal_multi, ["finalATK", "heal_multi"]]
    },
    regen: (tlvl) => {
      const atk = data.burst.regen_atk[tlvl] / 100
      const flat = data.burst.regen_flat[tlvl]
      return [s => (atk * s.finalATK + flat) * s.heal_multi, ["finalATK", "heal_multi"]]
    },
  },
  passive1: {
    heal: (tlvl, stats) => [s => 0.15 * s.finalATK * s.heal_multi, ["finalATK", "heal_multi"]],
  }
}

export default formula
export {
  data
}
