import { getTalentStatKey } from "../../../Build/Build"
import { basicDMGFormula } from "../../../Util/FormulaUtil"

const data = {
  baseStat: {
    characterHP: [1030, 2671, 3554, 5317, 5944, 6839, 7675, 8579, 9207, 10119, 10746, 11669, 12296, 13226],
    characterATK: [20, 51, 67, 101, 113, 130, 146, 163, 175, 192, 204, 222, 233, 251],
    characterDEF: [68, 17, 23, 352, 394, 453, 508, 568, 610, 670, 712, 773, 815, 876]
  },

  specializeStat: {
    key: "geo_dmg_",
    value: [0, 0, 0, 0, 7.2, 7.2, 14.4, 14.4, 14.4, 14.4, 21.6, 21.6, 28.8, 28.8]
  },
  normal: {
    hitArr: [
      [36.74, 39.73, 42.72, 46.99, 49.98, 53.4, 58.1, 62.8, 67.5, 72.62, 78.5, 85.41, 92.31, 99.22, 106.76],
      [36.74, 39.73, 42.72, 46.99, 49.98, 53.4, 58.1, 62.8, 67.5, 72.62, 78.5, 85.41, 92.31, 99.22, 106.76],
      [47.45, 51.32, 55.18, 60.7, 64.56, 68.98, 75.04, 81.11, 87.18, 93.81, 101.39, 110.32, 119.24, 128.16, 137.89],
      [49.75, 53.8, 57.85, 63.64, 67.68, 72.31, 78.68, 85.04, 91.4, 98.35, 106.3, 115.65, 125.01, 134.36, 144.57],
      [62.07, 67.13, 72.18, 79.4, 84.45, 90.22, 98.16, 106.1, 114.04, 122.7, 132.63, 144.3, 155.97, 167.64, 180.38]
    ],
  },
  charged: {
    atk1: [47.3, 51.15, 55, 60.5, 64.35, 68.75, 74.8, 80.85, 86.9, 93.5, 101.06, 109.96, 118.85, 127.74, 137.45],
    atk2: [60.2, 65.1, 70, 77, 81.9, 87.5, 95.2, 102.9, 110.6, 119, 128.62, 139.94, 151.26, 162.58, 174.93],
  },
  plunging: {
    dmg: [63.93, 69.14, 74.34, 81.77, 86.98, 92.93, 101.1, 109.28, 117.46, 126.38, 135.3, 144.22, 153.14, 162.06, 170.98],
    low: [127.84, 138.24, 148.65, 163.51, 173.92, 185.81, 202.16, 218.51, 234.86, 252.7, 270.54, 288.38, 306.22, 324.05, 341.89],
    high: [159.68, 172.67, 185.67, 204.24, 217.23, 232.09, 252.51, 272.93, 293.36, 315.64, 337.92, 360.2, 382.48, 404.76, 427.04]
  },
  skill: {
    press: [130.4, 140.18, 149.96, 163, 172.78, 182.56, 195.6, 208.64, 221.68, 234.72, 247.76, 260.8, 277.1, 293.4, 309.7],
    blossom: [133.6, 143.62, 153.64, 167, 177.02, 187.04, 200.4, 213.76, 227.12, 240.48, 253.84, 267.2, 283.9, 300.6, 317.3]
  },
  burst: {
    dmg: [367.2, 394.74, 422.28, 459, 486.54, 514.08, 550.8, 587.52, 624.24, 660.96, 697.68, 734.4, 780.3, 826.2, 872.1],
    blossom: [72, 77.4, 82.8, 90, 95.4, 100.8, 108, 115.2, 122.4, 129.6, 136.8, 144, 153, 162, 171]
  }
}
function burDMG(percent, stats, skillKey, stacks = 0, elemental = false) {
  const val = percent / 100
  const statKey = getTalentStatKey(skillKey, stats, elemental) + "_multi"
  const stacksVal = stacks * 0.3
  return [s => (val * s.finalATK + stacksVal * s.finalDEF) * s[statKey], ["finalATK", "finalDEF", statKey]]
}

const formula = {
  normal: Object.fromEntries(data.normal.hitArr.map((percentArr, i) => [i, (tlvl, stats) =>
    basicDMGFormula(percentArr[tlvl], stats, "normal")
  ])),
  charged: {
    atk1: (tlvl, stats) => basicDMGFormula(data.charged.atk1[tlvl], stats, "charged"),
    atk2: (tlvl, stats) => basicDMGFormula(data.charged.atk2[tlvl], stats, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(data.plunging).map(([key, arr]) => [key, (tlvl, stats) => basicDMGFormula(arr[tlvl], stats, "plunging")])),
  skill: {
    press: (tlvl, stats) => basicDMGFormula(data.skill.press[tlvl], stats, "skill"),
    blossom: (tlvl, stats) => {
      const val = data.skill.blossom[tlvl] / 100
      const statKey = getTalentStatKey("skill", stats) + "_multi"
      return [s => val * s.finalDEF * s[statKey], ["finalDEF", statKey]]
    },
    blossom50: (tlvl, stats) => {
      const val = data.skill.blossom[tlvl] / 100
      const hitModeMultiKey = stats.hitMode === "avgHit" ? "skill_avgHit_base_multi" : stats.hitMode === "critHit" ? "critHit_base_multi" : ""
      return [s => val * s.finalDEF * (hitModeMultiKey ? s[hitModeMultiKey] : 1) * (s.geo_skill_hit_base_multi + 0.25) * s.enemyLevel_multi * s.geo_enemyRes_multi,
      ["finalDEF", ...(hitModeMultiKey ? [hitModeMultiKey] : []), "geo_skill_hit_base_multi", "enemyLevel_multi", "geo_enemyRes_multi"]]
    }
  },
  burst: {
    dmg: (tlvl, stats) => basicDMGFormula(data.burst.dmg[tlvl], stats, "burst"),
    dmg1c2: (tlvl, stats) => burDMG(data.burst.dmg[tlvl], stats, "burst", 1),
    dmg2c2: (tlvl, stats) => burDMG(data.burst.dmg[tlvl], stats, "burst", 2),
    dmg3c2: (tlvl, stats) => burDMG(data.burst.dmg[tlvl], stats, "burst", 3),
    dmg4c2: (tlvl, stats) => burDMG(data.burst.dmg[tlvl], stats, "burst", 4),
    blossom: (tlvl, stats) => basicDMGFormula(data.burst.blossom[tlvl], stats, "burst"),
    blossom1c2: (tlvl, stats) => burDMG(data.burst.blossom[tlvl], stats, "burst", 1),
    blossom2c2: (tlvl, stats) => burDMG(data.burst.blossom[tlvl], stats, "burst", 2),
    blossom3c2: (tlvl, stats) => burDMG(data.burst.blossom[tlvl], stats, "burst", 3),
    blossom4c2: (tlvl, stats) => burDMG(data.burst.blossom[tlvl], stats, "burst", 4),
  }
}

export default formula
export {
  data
}