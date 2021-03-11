import { basicDMGFormula } from "../../../Util/FormulaUtil"

const data = {
  baseStat: {
    characterHP: [1011, 2621, 3488, 5219, 5834, 6712, 7533, 8421, 9036, 9932, 10547, 11453, 12068, 12981],
    characterATK: [26, 68, 90, 135, 151, 173, 194, 217, 233, 256, 272, 295, 311, 335],
    characterDEF: [61, 158, 211, 315, 352, 405, 455, 509, 546, 600, 637, 692, 729, 784]
  },
  specializeStat: {
    key: "critRate_",
    value: [0, 0, 0, 0, 4.8, 4.8, 9.6, 9.6, 9.6, 9.6, 14.4, 14.4, 19.2, 19.2]
  },
  normal: {
    hitArr: [
      [89.7, 97, 104.3, 114.73, 122.03, 130.38, 141.85, 153.32, 164.79, 177.31, 191.65, 208.52, 225.38, 242.25, 260.65],
      [87.63, 94.77, 101.9, 112.09, 119.22, 127.38, 138.58, 149.79, 161, 173.23, 187.24, 203.72, 220.2, 236.67, 254.65],
      [98.81, 106.86, 114.9, 126.39, 134.43, 143.63, 156.26, 168.9, 181.54, 195.33, 211.13, 229.71, 248.29, 266.87, 287.14],
      [133.99, 144.89, 155.8, 171.38, 182.29, 194.75, 211.89, 229.03, 246.16, 264.86, 286.28, 311.48, 336.67, 361.86, 389.34],
    ]
  },
  charged: {
    spinning: [68.8, 74.4, 80, 88, 93.6, 100, 108.8, 117.6, 126.4, 136, 147, 159.94, 172.87, 185.81, 199.92],
    final: [124.7, 134.85, 145, 159.5, 169.65, 181.25, 197.2, 213.15, 229.1, 246.5, 266.44, 289.88, 313.33, 336.78, 362.36]
  },
  plunging: {
    dmg: [89.51, 96.79, 104.08, 114.48, 121.77, 130.1, 141.54, 152.99, 164.44, 176.93, 189.42, 201.91, 214.4, 226.89, 239.37],
    low: [178.97, 193.54, 208.11, 228.92, 243.49, 260.13, 283.03, 305.92, 328.81, 353.78, 378.76, 403.73, 428.7, 453.68, 478.65],
    high: [223.55, 241.74, 259.94, 285.93, 304.13, 324.92, 353.52, 382.11, 410.7, 441.89, 473.09, 504.28, 535.47, 566.66, 597.86]
  },
  skill: {
    hit1: [94.4, 101.48, 108.56, 118, 125.08, 132.16, 141.6, 151.04, 160.48, 169.92, 179.36, 188.8, 200.6, 212.4, 224.2],
    hit2: [97.6, 104.92, 112.24, 122, 129.32, 136.64, 146.4, 156.16, 165.92, 175.68, 185.44, 195.2, 207.4, 219.6, 231.8],
    hit3: [128.8, 138.46, 148.12, 161, 170.66, 180.32, 193.2, 206.08, 218.96, 231.84, 244.72, 257.6, 273.7, 289.8, 305.9],
  },
  burst: {
    slashing: [204, 219.3, 234.6, 255, 270.3, 285.6, 306, 326.4, 346.8, 367.2, 387.6, 408, 433.5, 459, 484.5],
    dot: [60, 64.5, 69, 75, 79.5, 84, 90, 96, 102, 108, 114, 120, 127.5, 135, 142.5],
    explosion: [204, 219.3, 234.6, 255, 270.3, 285.6, 306, 326.4, 346.8, 367.2, 387.6, 408, 433.5, 459, 484.5],
  }
}

const formula = {
  normal: Object.fromEntries(data.normal.hitArr.map((percentArr, i) => [i, (tlvl, stats) =>
    basicDMGFormula(percentArr[tlvl], stats, "normal")])),
  charged: Object.fromEntries(Object.entries(data.charged).map(([name, arr]) =>
    [name, (tlvl, stats) => basicDMGFormula(arr[tlvl], stats, "charged")])),
  plunging: {
    dmg: (tlvl, stats) => basicDMGFormula(data.plunging.dmg[tlvl], stats, "plunging"),
    low: (tlvl, stats) => basicDMGFormula(data.plunging.low[tlvl], stats, "plunging"),
    high: (tlvl, stats) => basicDMGFormula(data.plunging.high[tlvl], stats, "plunging"),
  },
  skill: {
    ...Object.fromEntries(Object.entries(data.skill).map(([name, arr]) =>
      [name, (tlvl, stats) => basicDMGFormula(arr[tlvl], stats, "skill")])),
    hit2b: (tlvl, stats) => basicDMGFormula(data.skill.hit2[tlvl] + 40, stats, "skill"),
    hit3b: (tlvl, stats) => basicDMGFormula(data.skill.hit3[tlvl] + 40, stats, "skill"),
  },
  burst: Object.fromEntries(Object.entries(data.burst).map(([name, arr]) =>
    [name, (tlvl, stats) => basicDMGFormula(arr[tlvl], stats, "burst")])),
}

export default formula
export {
  data
}