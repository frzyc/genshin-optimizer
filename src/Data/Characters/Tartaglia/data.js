import { basicDMGFormula } from "../../../Util/FormulaUtil"

export const data = {
  baseStat: {
    characterHP: [1020, 2646, 3521, 5268, 5889, 6776, 7604, 8500, 9121, 10025, 10647, 11561, 12182, 13103],
    characterATK: [23, 61, 81, 121, 135, 156, 175, 195, 210, 231, 245, 266, 280, 301],
    characterDEF: [63, 165, 219, 328, 366, 421, 473, 528, 567, 623, 662, 719, 757, 815]
  },
  specializeStat: {
    key: "hydro_dmg_",
    value: [0, 0, 0, 0, 7.2, 7.2, 14.4, 14.4, 14.4, 14.4, 21.6, 21.6, 28.8, 28.8]
  },
  normal: {
    hitArr: [
      [41.28, 44.64, 48, 52.8, 56.16, 60, 65.28, 70.56, 75.84, 81.6, 87.36, 93.12, 98.88, 104.64, 110.4],//1
      [46.27, 50.03, 53.8, 59.18, 62.95, 67.25, 73.17, 79.09, 85, 91.46, 97.92, 104.37, 110.83, 117.28, 123.74],//2
      [55.38, 59.89, 64.4, 70.84, 75.35, 80.5, 87.58, 94.67, 101.75, 109.48, 117.21, 124.94, 132.66, 140.39, 148.12],//3
      [57.02, 61.66, 66.3, 72.93, 77.57, 82.88, 90.17, 97.46, 104.75, 112.71, 120.67, 128.62, 136.58, 144.53, 152.49],//4
      [60.89, 65.84, 70.8, 77.88, 82.84, 88.5, 96.29, 104.08, 111.86, 120.36, 128.86, 137.35, 145.85, 154.34, 162.84],//5
      [72.76, 78.68, 84.6, 93.06, 98.98, 105.75, 115.06, 124.36, 133.67, 143.82, 153.97, 164.12, 174.28, 184.43, 194.58],//6
    ],
  },
  charged: {
    aimedShot: [43.86, 47.43, 51, 56.1, 59.67, 63.75, 69.36, 74.97, 80.58, 86.7, 92.82, 98.94, 105.06, 111.18, 117.3],
    fullAimedShot: [124, 133.3, 142.6, 155, 164.3, 173.6, 186, 198.4, 210.8, 223.2, 235.6, 248, 263.5, 279, 294.5],
  },
  plunging: {
    dmg: [63.93, 69.14, 74.34, 81.77, 86.98, 92.93, 101.1, 109.28, 117.46, 126.38, 135.3, 144.22, 153.14, 162.06, 170.98],
    low: [127.84, 138.24, 148.65, 163.51, 173.92, 185.81, 202.16, 218.51, 234.86, 252.7, 270.54, 288.38, 306.22, 324.05, 341.89],
    high: [159.68, 172.67, 185.67, 204.24, 217.23, 232.09, 252.51, 272.93, 293.36, 315.64, 337.92, 360.2, 382.48, 404.76, 427.04],
  },
  skill: {
    hitArr: [
      [38.87, 42.04, 45.2, 49.72, 52.88, 56.5, 61.47, 66.44, 71.42, 76.84, 82.26, 87.69, 93.11, 98.54, 103.96],//1
      [41.62, 45.01, 48.4, 53.24, 56.63, 60.5, 65.82, 71.15, 76.47, 82.28, 88.09, 93.9, 99.7, 105.51, 111.32],//2
      [56.33, 60.92, 65.5, 72.05, 76.64, 81.88, 89.08, 96.29, 103.49, 111.35, 119.21, 127.07, 134.93, 142.79, 150.65],//3
      [59.94, 64.82, 69.7, 76.67, 81.55, 87.13, 94.79, 102.46, 110.13, 118.49, 126.85, 135.22, 143.58, 151.95, 160.31],//4
      [55.3, 59.8, 64.3, 70.73, 75.23, 80.38, 87.45, 94.52, 101.59, 109.31, 117.03, 124.74, 132.46, 140.17, 147.89],//5
      [35.43, 38.32, 41.2, 45.32, 48.2, 51.5, 56.03, 60.56, 65.1, 70.04, 74.98, 79.93, 84.87, 89.82, 94.76],//6.1 (1st hit)
      [37.67, 40.73, 43.8, 48.18, 51.25, 54.75, 59.57, 64.39, 69.2, 74.46, 79.72, 84.97, 90.23, 95.48, 100.74],//6.2 (2nd hit)
    ],
    skillDmg: [72, 77.4, 82.8, 90, 95.4, 100.8, 108, 115.2, 122.4, 129.6, 136.8, 144, 153, 162, 171],
    charged1: [60.2, 65.1, 70, 77, 81.9, 87.5, 95.2, 102.9, 110.6, 119, 127.4, 135.8, 144.2, 152.6, 161],//1st hit
    charged2: [71.98, 77.84, 83.7, 92.07, 97.93, 104.62, 113.83, 123.04, 132.25, 142.29, 152.33, 162.38, 172.42, 182.47, 192.51],//2nd hit
  },
  burst: {
    melee: [464, 498.8, 533.6, 580, 614.8, 649.6, 696, 742.4, 788.8, 835.2, 881.6, 928, 986, 1044, 1102],
    ranged: [378.4, 406.78, 435.16, 473, 501.38, 529.76, 567.6, 605.44, 643.28, 681.12, 718.96, 756.8, 804.1, 851.4, 898.7],
  },
  riptide: {
    flash: [12.4, 13.33, 14.26, 15.5, 16.43, 17.36, 18.6, 19.84, 21.08, 22.32, 23.56, 24.8, 26.35, 27.9, 29.45],//x3, fully charged
    burst: [62, 66.65, 71.3, 77.5, 82.15, 86.8, 93, 99.2, 105.4, 111.6, 117.8, 124, 131.75, 139.5, 147.25],//death
    slash: [60.2, 65.1, 70, 77, 81.9, 87.5, 95.2, 102.9, 110.6, 119, 127.4, 135.8, 144.2, 152.6, 161],//melee
    blast: [120, 129, 138, 150, 159, 168, 180, 192, 204, 216, 228, 240, 255, 270, 285],//burst
  }
}

const formula = {
  normal: {
    ...Object.fromEntries(data.normal.hitArr.map((percentArr, i) => [i, stats =>
      basicDMGFormula(percentArr[stats.tlvl.auto], stats, "normal")])),
    flash: stats => basicDMGFormula(data.riptide.flash[stats.tlvl.auto], stats, "normal", true),
    burst: stats => basicDMGFormula(data.riptide.burst[stats.tlvl.auto], stats, "normal", true),
  },
  charged: {
    aimedShot: stats => basicDMGFormula(data.charged.aimedShot[stats.tlvl.auto], stats, "charged"),
    fullAimedShot: stats => basicDMGFormula(data.charged.fullAimedShot[stats.tlvl.auto], stats, "charged", true),
  },
  plunging: Object.fromEntries(Object.entries(data.plunging).map(([key, arr]) => [key, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "plunging")])),
  skill: {
    ...Object.fromEntries(data.skill.hitArr.map((percentArr, i) => [i, stats =>
      basicDMGFormula(percentArr[stats.tlvl.skill], stats, "normal", true)])),
    skillDmg: stats => basicDMGFormula(data.skill.skillDmg[stats.tlvl.skill], stats, "skill"),
    charged1: stats => basicDMGFormula(data.skill.charged1[stats.tlvl.skill], stats, "charged", true),
    charged2: stats => basicDMGFormula(data.skill.charged2[stats.tlvl.skill], stats, "charged", true),
    slash: stats => basicDMGFormula(data.riptide.slash[stats.tlvl.skill], stats, "skill", true),
  },
  burst: {
    melee: stats => basicDMGFormula(data.burst.melee[stats.tlvl.burst], stats, "burst"),
    ranged: stats => basicDMGFormula(data.burst.ranged[stats.tlvl.burst], stats, "burst"),
    blast: stats => basicDMGFormula(data.riptide.blast[stats.tlvl.burst], stats, "burst", true),
  },
}
export default formula
