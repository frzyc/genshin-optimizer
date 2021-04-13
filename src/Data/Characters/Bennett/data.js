import { basicDMGFormula } from "../../../Util/FormulaUtil"

const data = {
  baseStat: {
    characterHP: [1039, 2670, 3447, 5163, 5715, 6573, 7309, 8168, 8719, 9577, 10129, 10987, 11539, 12397],
    characterATK: [16, 41, 53, 80, 88, 101, 113, 126, 134, 148, 156, 169, 178, 191],
    characterDEF: [65, 166, 214, 321, 356, 409, 455, 508, 542, 596, 630, 684, 718, 771]
  },
  specializeStat: {
    key: "enerRech_",
    value: [0, 0, 0, 0, 6.7, 6.7, 13.3, 13.3, 13.3, 13.3, 20, 20, 26.7, 26.7]
  },
  normal: {
    hitArr: [
      [44.55, 48.17, 51.8, 56.98, 60.61, 64.75, 70.45, 76.15, 81.84, 88.06, 94.28, 100.49, 106.71, 112.92, 119.14],
      [42.74, 46.22, 49.7, 54.67, 58.15, 62.13, 67.59, 73.06, 78.53, 84.49, 90.45, 96.42, 102.38, 108.35, 114.31],
      [54.61, 59.06, 63.5, 69.85, 74.3, 79.38, 86.36, 93.35, 100.33, 107.95, 115.57, 123.19, 130.81, 138.43, 146.05],
      [59.68, 64.54, 69.4, 76.34, 81.2, 86.75, 94.38, 102.02, 109.65, 117.98, 126.31, 134.64, 142.96, 151.29, 159.62],
      [71.9, 77.75, 83.6, 91.96, 97.81, 104.5, 113.7, 122.89, 132.09, 142.12, 152.15, 162.18, 172.22, 182.25, 192.28]
    ],
  },
  charged: {
    atk1: [55.9, 60.45, 65, 71.5, 76.05, 81.25, 88.4, 95.55, 102.7, 110.5, 118.3, 126.1, 133.9, 141.7, 149.5],
    atk2: [60.72, 65.66, 70.6, 77.66, 82.6, 88.25, 96.02, 103.78, 111.55, 120.02, 128.49, 136.96, 145.44, 153.91, 162.38],
  },
  plunging: {
    dmg: [63.93, 69.14, 74.34, 81.77, 86.98, 92.93, 101.1, 109.28, 117.46, 126.38, 135.3, 144.22, 153.14, 162.06, 170.98],
    low: [127.84, 138.24, 148.65, 163.51, 173.92, 185.81, 202.16, 218.51, 234.86, 252.7, 270.54, 288.38, 306.22, 324.05, 341.89],
    high: [159.68, 172.67, 185.67, 204.24, 217.23, 232.09, 252.51, 272.93, 293.36, 315.64, 337.92, 360.2, 382.48, 404.76, 427.04]
  },
  skill: {
    press: [137.6, 147.92, 158.24, 172, 182.32, 192.64, 206.4, 220.16, 233.92, 247.68, 261.44, 275.2, 292.4, 309.6, 326.8],
    lvl1hit1: [84, 90.3, 96.6, 105, 111.3, 117.6, 126, 134.4, 142.8, 151.2, 159.6, 168, 178.5, 189, 199.5],
    lvl1hit2: [92, 98.9, 105.8, 115, 121.9, 128.8, 138, 147.2, 156.4, 165.6, 174.8, 184, 195.5, 207, 218.5],
    lvl2hit1: [88, 94.6, 101.2, 110, 116.6, 123.2, 132, 140.8, 149.6, 158.4, 167.2, 176, 187, 198, 209],
    lvl2hit2: [96, 103.2, 110.4, 120, 127.2, 134.4, 144, 153.6, 163.2, 172.8, 182.4, 192, 204, 216, 228],
    explosion: [132, 141.9, 151.8, 165, 174.9, 184.8, 198, 211.2, 224.4, 237.6, 250.8, 264, 280.5, 297, 313.5]
  },
  burst: {
    dmg: [232.8, 250.26, 267.72, 291, 308.46, 325.92, 349.2, 372.48, 395.76, 419.04, 442.32, 465.6, 494.7, 523.8, 552.9],
    healHP: [6, 6.45, 6.9, 7.5, 7.95, 8.4, 9, 9.6, 10.2, 10.8, 11.4, 12, 12.75, 13.5, 14.25],
    healHPFlat: [577, 635, 698, 765, 837, 914, 996, 1083, 1174, 1270, 1371, 1477, 1588, 1703, 1824],
    atkRatio: [56, 60.2, 64.4, 70, 74.2, 78.4, 84, 89.6, 95.2, 100.8, 106.4, 112, 119, 126, 133]
  }
}

const formula = {
  normal: Object.fromEntries(data.normal.hitArr.map((percentArr, i) => [i, stats =>
    basicDMGFormula(percentArr[stats.tlvl.auto], stats, "normal")])),
  charged: {
    atk1: stats => basicDMGFormula(data.charged.atk1[stats.tlvl.auto], stats, "charged"),
    atk2: stats => basicDMGFormula(data.charged.atk2[stats.tlvl.auto], stats, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(data.plunging).map(([key, arr]) => [key, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "plunging")])),
  skill: Object.fromEntries(Object.entries(data.skill).map(([key, arr]) => [key, stats => basicDMGFormula(arr[stats.tlvl.skill], stats, "skill")])),
  burst: {
    dmg: stats => basicDMGFormula(data.burst.dmg[stats.tlvl.burst], stats, "burst"),
    regen: stats => {
      const hp = data.burst.healHP[stats.tlvl.burst] / 100
      const flat = data.burst.healHPFlat[stats.tlvl.burst]
      return [s => (hp * s.finalHP + flat) * s.heal_multi, ["finalHP", "heal_multi"]]
    },
    atkBonus: stats => {
      const { constellation } = stats
      const percent = (data.burst.atkRatio[stats.tlvl.burst] + (constellation < 1 ? 0 : 20)) / 100
      return [s => percent * s.baseATK, ["baseATK"]]
    }
  }
}

export default formula
export {
  data
}