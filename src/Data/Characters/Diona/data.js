import { basicDMGFormula } from "../../../Util/FormulaUtil"

const data = {
  baseStat: {
    characterHP: [802, 2061, 2661, 3985, 4411, 5074, 5642, 6305, 6731, 7393, 7818, 8481, 8907, 9570],
    characterATK: [18, 46, 59, 88, 98, 113, 125, 140, 149, 164, 174, 188, 198, 212],
    characterDEF: [50, 129, 167, 250, 277, 318, 354, 396, 422, 464, 491, 532, 559, 601]
  },
  specializeStat: {
    key: "cryo_dmg_",
    value: [0, 0, 0, 0, 6, 6, 12, 12, 12, 12, 18, 18, 24, 24]
  },
  normal: {
    hitArr: [
      [36.12, 39.06, 42, 46.2, 49.14, 52.5, 57.12, 61.74, 66.36, 71.4, 77.18, 83.97, 90.76, 97.55, 104.96],
      [33.54, 36.27, 39, 42.9, 45.63, 48.75, 53.04, 57.33, 61.62, 66.3, 71.66, 77.97, 84.28, 90.58, 97.46],
      [45.58, 49.29, 53, 58.3, 62.01, 66.25, 72.08, 77.91, 83.74, 90.1, 97.39, 105.96, 114.53, 123.1, 132.45],
      [43, 46.5, 50, 55, 58.5, 62.5, 68, 73.5, 79, 85, 91.88, 99.96, 108.05, 116.13, 124.95],
      [53.75, 58.13, 62.5, 68.75, 73.13, 78.13, 85, 91.88, 98.75, 106.25, 114.84, 124.95, 135.06, 145.16, 156.19]
    ],
  },
  charged: {
    aimedShot: [43.86, 47.43, 51, 56.1, 59.67, 63.75, 69.36, 74.97, 80.58, 86.7, 93.71, 101.96, 110.21, 118.45, 127.45],
    fullAimedShot: [124, 133.3, 142.6, 155, 164.3, 173.6, 186, 198.4, 210.8, 223.2, 236.1, 252.96, 269.82, 286.69, 303.55]
  },
  plunging: {
    dmg: [56.83, 61.45, 66.08, 72.69, 77.31, 82.6, 89.87, 97.14, 104.41, 112.34, 120.27, 128.2, 136.12, 144.05, 151.98],
    low: [113.63, 122.88, 132.13, 145.35, 154.59, 165.17, 179.7, 194.23, 208.77, 224.62, 240.48, 256.34, 272.19, 288.05, 303.9],
    high: [141.93, 153.49, 165.04, 181.54, 193.1, 206.3, 224.45, 242.61, 260.76, 280.57, 300.37, 320.18, 339.98, 359.79, 379.59]
  },
  skill: {
    dmgPerPaw: [41.92, 45.06, 48.21, 52.4, 55.54, 58.69, 62.88, 67.07, 71.26, 75.46, 79.65, 83.84, 89.08, 94.32, 99.56],
    shieldFlat: [693, 762, 837, 918, 1005, 1097, 1195, 1299, 1409, 1524, 1646, 1773, 1905, 2044, 2188],
    shieldHp: [7.2, 7.74, 8.28, 9, 9.54, 10.08, 10.8, 11.52, 12.24, 12.96, 13.68, 14.4, 15.3, 16.2, 17.1],
    durationPerPaw: [1.8, 1.9, 2, 2.1, 2.2, 2.3, 2.4, 2.4, 2.4, 2.4, 2.4, 2.4, 2.4, 2.4, 2.4]
  },
  burst: {
    dmg: [80, 86, 92, 100, 106, 112, 120, 128, 136, 144, 152, 160, 170, 180, 190],
    continuousDmg: [52.64, 56.59, 60.54, 65.8, 69.75, 73.7, 78.96, 84.22, 89.49, 94.75, 100.02, 105.28, 111.86, 118.44, 125.02],
    hpFlat: [513, 565, 620, 680, 744, 813, 885, 962, 1044, 1129, 1219, 1313, 1411, 1514, 1621],
    hpPercent: [5.34, 5.74, 6.14, 6.67, 7.07, 7.47, 8, 8.54, 9.07, 9.6, 10.14, 10.67, 11.34, 12.01, 12.67]
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
    shield: stats => {
      const hp = data.skill.shieldHp[stats.tlvl.skill] / 100
      const flat = data.skill.shieldFlat[stats.tlvl.skill]
      return [s => ((1 + (stats.constellation >= 2 ? 0.15 : 0)) * (hp * s.finalHP + flat)), ["finalHP"]] //TODO : Add shield strength
    },
    shieldHold: stats => {
      const hp = data.skill.shieldHp[stats.tlvl.skill] / 100
      const flat = data.skill.shieldFlat[stats.tlvl.skill]
      return [s => ((1.75 + (stats.constellation >= 2 ? 0.15 : 0)) * (hp * s.finalHP + flat)), ["finalHP"]] //TODO : Add shield strength
    },
    dmg: stats => basicDMGFormula(data.skill.dmgPerPaw[stats.tlvl.skill], stats, "skill"),
  },
  burst: {
    regen: stats => {
      const hp = data.burst.hpPercent[stats.tlvl.burst] / 100
      const flat = data.burst.hpFlat[stats.tlvl.burst]
      return [s => (hp * s.finalHP + flat) * s.heal_multi, ["finalHP", "heal_multi"]]
    },
    dmg: stats => basicDMGFormula(data.burst.dmg[stats.tlvl.burst], stats, "burst"),
    continuousDmg: stats => basicDMGFormula(data.burst.continuousDmg[stats.tlvl.burst], stats, "burst"),
  }
}

export default formula
export {
  data
}