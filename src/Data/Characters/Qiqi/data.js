import { basicDMGFormula } from "../../../Util/FormulaUtil"

const data = {
  baseStat: {
    characterHP: [963, 2498, 3323, 4973, 5559, 6396, 7178, 8023, 8610, 9463, 10050, 10912, 11499, 12368],
    characterATK: [22, 58, 77, 115, 129, 148, 167, 186, 200, 220, 233, 253, 267, 287],
    characterDEF: [72, 186, 248, 371, 415, 477, 535, 598, 642, 706, 749, 814, 857, 922]
  },
  specializeStat: {
    key: "heal_",
    value: [0, 0, 0, 0, 5.5, 5.5, 11.1, 11.1, 11.1, 11.1, 16.6, 16.6, 22.2, 22.2]
  },
  normal: {
    hitArr: [
      [37.75, 40.83, 43.9, 48.29, 51.36, 54.88, 59.7, 64.53, 69.36, 74.63, 79.9, 85.17, 90.43, 95.7, 100.97],//1
      [38.87, 42.04, 45.2, 49.72, 52.88, 56.5, 61.47, 66.44, 71.42, 76.84, 82.26, 87.69, 93.11, 98.54, 103.96],//2
      [24.17, 26.13, 28.1, 30.91, 32.88, 35.13, 38.22, 41.31, 44.4, 47.77, 51.14, 54.51, 57.89, 61.26, 64.63],//3 x2
      [24.68, 26.69, 28.7, 31.57, 33.58, 35.88, 39.03, 42.19, 45.35, 48.79, 52.23, 55.68, 59.12, 62.57, 66.01],//4 x2
      [63.04, 68.17, 73.3, 80.63, 85.76, 91.63, 99.69, 107.75, 115.81, 124.61, 133.41, 142.2, 151, 159.79, 168.59],//5
    ],
  },
  charged: {
    hit: [64.33, 69.56, 74.8, 82.28, 87.52, 93.5, 101.73, 109.96, 118.18, 127.16, 136.14, 145.11, 154.09, 163.06, 172.0],
  },
  plunging: {
    dmg: [63.93, 69.14, 74.34, 81.77, 86.98, 92.93, 101.1, 109.28, 117.46, 126.38, 135.3, 144.22, 153.14, 162.06, 170.98],
    low: [127.84, 138.24, 148.65, 163.51, 173.92, 185.81, 202.16, 218.51, 234.86, 252.7, 270.54, 288.38, 306.22, 324.05, 341.89],
    high: [159.68, 172.67, 185.67, 204.24, 217.23, 232.09, 252.51, 272.93, 293.36, 315.64, 337.92, 360.2, 382.48, 404.76, 427.04],
  },

  skill: {
    hit: [96, 103.2, 110.4, 120, 127.2, 134.4, 144, 153.6, 163.2, 172.8, 182.4, 192, 204, 216, 228],
    herald: [36, 38.7, 41.4, 45, 47.7, 50.4, 54, 57.6, 61.2, 64.8, 68.4, 72, 76.5, 81, 85.5],
    hitregen: {
      base: [67, 74, 81, 89, 98, 107, 116, 126, 137, 148, 160, 172, 185, 199, 213],
      atk: [10.56, 11.35, 12.14, 13.2, 13.99, 14.78, 15.84, 16.9, 17.95, 19.01, 20.06, 21.12, 22.44, 23.76, 25.08],
    },
    continuousregen: {
      base: [451, 496, 544, 597, 653, 713, 777, 845, 916, 991, 1070, 1153, 1239, 1329, 1423],
      atk: [69.6, 74.82, 80.04, 87, 92.22, 97.44, 104.4, 111.36, 118.32, 125.28, 132.24, 139.2, 147.9, 156.6, 165.3],
    },
  },
  burst: {
    dmg: [284.8, 306.16, 327.52, 356, 377.36, 398.72, 427.2, 455.68, 484.16, 512.64, 541.12, 569.6, 605.2, 640.8, 676.4],
    healing: {
      base: [577, 635, 698, 765, 837, 914, 996, 1083, 1174, 1270, 1371, 1477, 1588, 1703, 1824],
      atk: [90, 96.75, 103.5, 112.5, 119.25, 126, 135, 144, 153, 162, 171, 180, 191.25, 202.5, 213.75],
    }
  }
}

const formula = {
  normal: Object.fromEntries(data.normal.hitArr.map((arr, i) =>
    [i, (tlvl, stats) => basicDMGFormula(arr[tlvl] * (i === 2 || i === 3 ? 2 : 1), stats, "normal")])),
  charged: Object.fromEntries(Object.entries(data.charged).map(([name, arr]) =>
    [name, (tlvl, stats) => basicDMGFormula(arr[tlvl], stats, "charged")])),
  plunging: Object.fromEntries(Object.entries(data.plunging).map(([key, arr]) => [key, (tlvl, stats) => basicDMGFormula(arr[tlvl], stats, "plunging")])),
  skill: {
    hit: (tlvl, stats) => basicDMGFormula(data.skill.hit[tlvl], stats, "skill"),
    herald: (tlvl, stats) => basicDMGFormula(data.skill.herald[tlvl], stats, "skill"),
    hitregen: (tlvl) => {
      const base = data.skill.hitregen.base[tlvl];
      const atk = data.skill.hitregen.atk[tlvl] / 100;
      return [s => (atk * s.finalATK + base) * s.heal_multi, ["finalATK", "heal_multi"]]
    },
    continuousregen: (tlvl) => {
      const base = data.skill.continuousregen.base[tlvl];
      const atk = data.skill.continuousregen.atk[tlvl] / 100;
      return [s => (atk * s.finalATK + base) * s.heal_multi, ["finalATK", "heal_multi"]]
    },
  },
  burst: {
    dmg: (tlvl, stats) => basicDMGFormula(data.burst.dmg[tlvl], stats, "burst"),
    healing: (tlvl) => {
      const base = data.burst.healing.base[tlvl];
      const atk = data.burst.healing.atk[tlvl] / 100;
      return [s => (atk * s.finalATK + base) * s.heal_multi, ["finalATK", "heal_multi"]]
    },
  },
}

export default formula
export {
  data
}