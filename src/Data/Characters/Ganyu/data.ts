import { IFormulaSheet } from "../../../Types/character"
import { basicDMGFormula } from "../../../Util/FormulaUtil"

const data = {
  normal: {
    hitArr: [
      [31.73, 34.32, 36.9, 40.59, 43.17, 46.13, 50.18, 54.24, 58.3, 62.73, 67.8, 73.77, 79.74, 85.7, 92.21],
      [35.6, 38.5, 41.4, 45.54, 48.44, 51.75, 56.3, 60.86, 65.41, 70.38, 76.07, 82.77, 89.46, 96.16, 103.46],
      [45.49, 49.2, 52.9, 58.19, 61.89, 66.13, 71.94, 77.76, 83.58, 89.93, 97.2, 105.76, 114.31, 122.87, 132.2],
      [45.49, 49.2, 52.9, 58.19, 61.89, 66.13, 71.94, 77.76, 83.58, 89.93, 97.2, 105.76, 114.31, 122.87, 132.2],
      [48.25, 52.17, 56.1, 61.71, 65.64, 70.13, 76.3, 82.47, 88.64, 95.37, 103.08, 112.16, 121.23, 130.3, 140.19],
      [57.62, 62.31, 67, 73.7, 78.39, 83.75, 91.12, 98.49, 105.86, 113.9, 123.11, 133.95, 144.78, 155.61, 167.43],
    ]
  },
  charged: {
    aimedShot: [43.86, 47.43, 51, 56.1, 59.67, 63.75, 69.36, 74.97, 80.58, 86.7, 92.82, 98.94, 105.06, 111.18, 117.3],
    aimShot1: [124, 133.3, 142.6, 155, 164.3, 173.6, 186, 198.4, 210.8, 223.2, 235.6, 248, 263.5, 279, 294.5],
    frostflake: [128, 137.6, 147.2, 160, 169.6, 179.2, 192, 204.8, 217.6, 230.4, 243.2, 256, 272, 288, 304],
    frostflakeBloom: [217.6, 233.92, 250.24, 272, 288.32, 304.64, 326.4, 348.16, 369.92, 391.68, 413.44, 435.2, 462.4, 489.6, 516.8]
  },
  plunging: {
    dmg: [56.83, 61.45, 66.08, 72.69, 77.31, 82.6, 89.87, 97.14, 104.41, 112.34, 120.27, 128.2, 136.12, 144.05, 151.98],
    low: [113.63, 122.88, 132.13, 145.35, 154.59, 165.17, 179.7, 194.23, 208.77, 224.62, 240.48, 256.34, 272.19, 288.05, 303.9],
    high: [141.93, 153.49, 165.04, 181.54, 193.1, 206.3, 224.45, 242.61, 260.76, 280.57, 300.37, 320.18, 339.98, 359.79, 379.59]
  },
  skill: {
    hp: [120, 129, 138, 150, 159, 168, 180, 192, 204, 216, 228, 240, 255, 270, 285],
    dmg: [132, 141.9, 151.8, 165, 174.9, 184.8, 198, 211.2, 224.4, 237.6, 250.8, 264, 280.5, 297, 313.5],
  },
  burst: {
    dmg: [70.27, 75.54, 80.81, 87.84, 93.11, 98.38, 105.41, 112.44, 119.46, 126.49, 133.52, 140.54, 149.33, 158.11, 166.9],
  }
}

const formula: IFormulaSheet = {
  normal: Object.fromEntries(data.normal.hitArr.map((percentArr, i) => [i, stats =>
    basicDMGFormula(percentArr[stats.tlvl.auto], stats, "normal")])),
  charged: {
    aimShot: stats => basicDMGFormula(data.charged.aimedShot[stats.tlvl.auto], stats, "charged"),
    aimShot1: stats => basicDMGFormula(data.charged.aimShot1[stats.tlvl.auto], stats, "charged", "cryo"),
    frostflake: stats => {
      if (stats.hitMode === "avgHit") {
        const [conditionalNum] = stats.conditionalValues?.character?.Ganyu?.a1 ?? []
        if (conditionalNum) {
          const val = data.charged.frostflake[stats.tlvl.auto] / 100
          //cryo_charged_hit or cryo_melt_charged_hit
          const statKey = `cryo${stats.reactionMode === "cryo_melt" ? "_melt" : ""}_charged_hit`
          //cryo charged atk hit * (1 + min(20% + critRate, 100) critDmg_)
          return [s => val * s[statKey] * (1 + Math.min(20 + s.critRate_ + s.charged_critRate_, 100) * s.critDMG_ / 10000), [statKey, "critRate_", "critDMG_", "charged_critRate_"]]
        }
      }
      return basicDMGFormula(data.charged.frostflake[stats.tlvl.auto], stats, "charged", "cryo")
    },
    frostflakeBloom: stats => {
      if (stats.hitMode === "avgHit") {
        const [conditionalNum] = stats.conditionalValues?.character?.Ganyu?.a1 ?? []
        if (conditionalNum) {
          const val = data.charged.frostflakeBloom[stats.tlvl.auto] / 100
          //cryo_charged_hit or cryo_melt_charged_hit
          const statKey = `cryo${stats.reactionMode === "cryo_melt" ? "_melt" : ""}_charged_hit`
          //cryo charged atk hit * (1 + min(20% + critRate, 100) critDmg_)
          return [s => val * s[statKey] * (1 + Math.min(20 + s.critRate_ + s.charged_critRate_, 100) * s.critDMG_ / 10000), [statKey, "critRate_", "critDMG_", "charged_critRate_"]]
        }
      }
      return basicDMGFormula(data.charged.frostflakeBloom[stats.tlvl.auto], stats, "charged", "cryo")
    },
  },
  plunging: {
    dmg: stats => basicDMGFormula(data.plunging.dmg[stats.tlvl.auto], stats, "plunging"),
    low: stats => basicDMGFormula(data.plunging.low[stats.tlvl.auto], stats, "plunging"),
    high: stats => basicDMGFormula(data.plunging.high[stats.tlvl.auto], stats, "plunging"),
  },
  skill: {
    hp: stats => {
      const hp = data.skill.hp[stats.tlvl.skill] / 100
      return [(s) => hp * s.finalHP, ["finalHP"]]
    },
    dmg: stats => basicDMGFormula(data.skill.dmg[stats.tlvl.skill], stats, "skill"),
  },
  burst: {
    dmg: stats => basicDMGFormula(data.burst.dmg[stats.tlvl.burst], stats, "burst"),
  }
}

export default formula
export {
  data
}