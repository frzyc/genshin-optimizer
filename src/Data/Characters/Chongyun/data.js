import { basicDMGFormula } from "../../../Util/FormulaUtil"

const data = {
  baseStat: {
    characterHP: [921, 2366, 3054, 4574, 5063, 5824, 6475, 7236, 7725, 8485, 8974, 9734, 10223, 10984],
    characterATK: [19, 48, 62, 93, 103, 118, 131, 147, 157, 172, 182, 198, 208, 223],
    characterDEF: [54, 140, 180, 270, 299, 344, 382, 427, 456, 501, 530, 575, 603, 648]
  },
  specializeStat: {
    key: "atk_",
    value: [0, 0, 0, 0, 6, 6, 12, 12, 12, 12, 18, 18, 24, 24]
  },
  normal: {
    hitArr: [
      [70, 75.7, 81.4, 89.54, 95.24, 101.75, 110.7, 119.66, 128.61, 138.38, 148.15, 157.92, 167.68, 177.45, 187.22],
      [63.12, 68.26, 73.4, 80.74, 85.88, 91.75, 99.82, 107.9, 115.97, 124.78, 133.59, 142.4, 151.2, 160.01, 168.82],
      [80.32, 86.86, 93.4, 102.74, 109.28, 116.75, 127.02, 137.3, 147.57, 158.78, 169.99, 181.2, 192.4, 203.61, 214.82],
      [101.22, 109.46, 117.7, 129.47, 137.71, 147.13, 160.07, 173.02, 185.97, 200.09, 214.21, 228.34, 242.46, 256.59, 270.71],
    ],
  },
  charged: {
    spinning: [56.29, 60.87, 65.45, 71.99, 76.57, 81.81, 89.01, 96.21, 103.41, 111.26, 119.12, 126.97, 134.82, 142.68, 150.53],
    finalATK: [101.78, 110.07, 118.35, 130.19, 138.47, 147.94, 160.96, 173.97, 186.99, 201.2, 215.4, 229.6, 243.8, 258, 272.21]
  },
  plunging: {
    dmg: [74.59, 80.66, 86.73, 95.40, 101.47, 108.41, 117.95, 127.49, 137.03, 147.44, 157.85, 168.26, 178.66, 189.07, 199.48],
    low: [149.14, 161.28, 173.42, 190.77, 202.91, 216.78, 235.86, 254.93, 274.01, 294.82, 315.63, 336.44, 357.25, 378.06, 398.87],
    high: [186.29, 201.45, 216.62, 238.28, 253.44, 270.77, 294.6, 318.42, 342.25, 368.25, 394.24, 420.23, 446.23, 472.22, 498.21]
  },
  skill: {
    dmg: [172.04, 184.94, 197.85, 215.05, 227.95, 240.86, 258.06, 275.26, 292.47, 309.67, 326.88, 344.08, 365.59, 387.09, 408.60],
    infusionDuration: [2, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3, 3, 3, 3, 3],
  },
  burst: {
    dmg: [142.40, 153.08, 163.76, 178, 188.68, 199.36, 213.60, 227.84, 242.08, 256.32, 270.56, 284.80, 302.60, 320.40, 338.20],
  }
}
const formula = {
    normal: Object.fromEntries(data.normal.hitArr.map((arr, i) =>
      [i, (tlvl, stats) => basicDMGFormula(arr[tlvl], stats, "normal")])), 
    charged: {
      spinning: (tlvl, stats) => basicDMGFormula(data.charged.spinning[tlvl], stats, "charged"),
      finalATK: (tlvl, stats) => basicDMGFormula(data.charged.finalATK[tlvl], stats, "charged"),
     },
    plunging: Object.fromEntries(Object.entries(data.plunging).map(([name, arr]) =>
      [name, (tlvl, stats) => basicDMGFormula(arr[tlvl], stats, "plunging")])),
    skill: {
      dmg: (tlvl, stats) => basicDMGFormula(data.skill.dmg[tlvl], stats, "skill"),
    },
    burst: {
      dmg: (tlvl, stats) => basicDMGFormula(data.burst.dmg[tlvl], stats, "burst"),
    },
    constellation1: {
      dmg: (tlvl, stats) => basicDMGFormula(50, stats, "elemental"),
    },
    passive2: {
      dmg: (tlvl, stats) => basicDMGFormula(data.skill.dmg[tlvl], stats, "elemental"),
    }
  }
  export default formula
  export {
    data
  }