import { basicDMGFormula } from "../../../Util/FormulaUtil"

const data = {
  baseStat: {
    characterHP: [821, 2108, 2721, 4076, 4512, 5189, 5770, 6448, 6884, 7561, 7996, 8674, 9110, 9787],
    characterATK: [13, 34, 44, 66, 73, 84, 94, 105, 112, 123, 130, 141, 148, 159],
    characterDEF: [56, 144, 186, 279, 308, 355, 394, 441, 470, 517, 546, 593, 623, 669]
  },
  specializeStat: {
    key: "hp_",
    value: [0, 0, 0, 0, 6, 6, 12, 12, 12, 12, 18, 18, 24, 24]
  },
  normal: {
    hitArr: [
      [37.84, 40.68, 43.52, 47.3, 50.14, 52.98, 56.76, 60.54, 64.33, 68.11, 72.05, 77.19, 82.34, 87.49, 92.63],
      [35.52, 38.18, 40.85, 44.4, 47.06, 49.73, 53.28, 56.83, 60.38, 63.94, 67.63, 72.46, 77.29, 82.12, 86.95],
      [41.04, 44.12, 47.2, 51.3, 54.38, 57.46, 61.56, 65.66, 69.77, 73.87, 78.14, 83.72, 89.3, 94.88, 100.47],
      [55.2, 59.34, 63.48, 69, 73.14, 77.28, 82.8, 88.32, 93.84, 99.36, 105.1, 112.61, 120.12, 127.62, 135.13],
    ],
  },
  charged: {
    dmg: [166.24, 178.71, 191.18, 207.8, 220.27, 232.74, 249.36, 265.98, 282.61, 299.23, 316.52, 339.13, 361.74, 384.35, 406.96],
  },
  plunging: {
    dmg: [56.83, 61.45, 66.08, 72.69, 77.31, 82.6, 89.87, 97.14, 104.41, 112.34, 120.27, 128.2, 136.12, 144.05, 151.98],
    low: [113.63, 122.88, 132.13, 145.35, 154.59, 165.17, 179.7, 194.23, 208.77, 224.62, 240.48, 256.34, 272.19, 288.05, 303.9],
    high: [141.93, 153.49, 165.04, 181.54, 193.1, 206.3, 224.45, 242.61, 260.76, 280.57, 300.37, 320.18, 339.98, 359.79, 379.59]
  },
  skill: {
    hp: [0.75, 0.81, 0.86, 0.94, 0.99, 1.05, 1.13, 1.2, 1.27, 1.35, 1.43, 1.5, 1.59, 1.69, 1.78],
    hpFlat: [72, 79, 87, 96, 105, 114, 125, 135, 147, 159, 172, 185, 199, 213, 228],
    contHP: [4, 4.3, 4.6, 5, 5.3, 5.6, 6, 6.4, 6.8, 7.2, 7.6, 8, 8.5, 9, 9.5],
    contHPFlat: [385, 424, 465, 510, 559, 610, 664, 722, 783, 847, 915, 986, 1059, 1136, 1217],
    dmg: [58.4, 62.78, 67.16, 73, 77.38, 81.76, 87.6, 93.44, 99.28, 105.12, 110.96, 116.8, 124.1, 131.4, 138.7],
  },
  burst: {
    hp: [17.6, 18.92, 20.24, 22, 23.32, 24.64, 26.4, 28.16, 29.92, 31.68, 33.44, 35.2, 37.4, 39.6, 41.8],
    flat: [1694, 1864, 2047, 2245, 2457, 2683, 2923, 3177, 3445, 3728, 4024, 4335, 4660, 4999, 5352],
  }
}

const formula = {
  normal: Object.fromEntries(data.normal.hitArr.map((percentArr, i) => [i, stats =>
    basicDMGFormula(percentArr[stats.tlvl.auto], stats, "normal")])),
  charged: {
    dmg: stats => basicDMGFormula(data.charged.dmg[stats.tlvl.auto], stats, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(data.plunging).map(([key, arr]) => [key, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "plunging")])),
  skill: {
    regenPerHit: stats => {
      const hp = data.skill.hp[stats.tlvl.skill] / 100
      const flat = data.skill.hpFlat[stats.tlvl.skill]
      return [s => (hp * s.finalHP + flat) * s.heal_multi, ["finalHP", "heal_multi"]]
    },
    contRegen: stats => {
      const hp = data.skill.contHP[stats.tlvl.skill] / 100
      const flat = data.skill.contHPFlat[stats.tlvl.skill]
      return [s => (hp * s.finalHP + flat) * s.heal_multi, ["finalHP", "heal_multi"]]
    },
    dmg: stats => basicDMGFormula(data.skill.dmg[stats.tlvl.skill], stats, "skill"),
  },
  burst: {
    regen: stats => {
      const hp = data.burst.hp[stats.tlvl.burst] / 100
      const flat = data.burst.flat[stats.tlvl.burst]
      return [s => (hp * s.finalHP + flat) * s.heal_multi, ["finalHP", "heal_multi"]]
    },
  }
}

export default formula
export {
  data
}