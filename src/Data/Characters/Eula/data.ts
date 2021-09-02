import { FormulaItem, IFormulaSheet } from "../../../Types/character"
import { basicDMGFormula } from "../../../Util/FormulaUtil"

export const data = {
  normal: {
    hitArr: [
      [89.73, 97.04, 104.34, 114.77, 122.08, 130.43, 141.9, 153.38, 164.86, 177.38, 191.72, 208.6, 225.47, 242.34, 260.75],
      [93.55, 101.17, 108.78, 119.66, 127.27, 135.98, 147.94, 159.91, 171.87, 184.93, 199.88, 217.47, 235.06, 252.65, 271.84],
      [56.8, 61.42, 66.05, 72.65, 77.27, 82.56, 89.82, 97.09, 104.35, 112.28, 121.36, 132.04, 142.72, 153.4, 165.05],//x2
      [112.64, 121.81, 130.98, 144.08, 153.25, 163.73, 178.13, 192.54, 206.95, 222.67, 240.68, 261.86, 283.03, 304.21, 327.32],
      [71.83, 77.68, 83.53, 91.88, 97.73, 104.41, 113.6, 122.79, 131.97, 142, 153.48, 166.99, 180.49, 194, 208.74],//x2
    ]
  },
  charged: {
    spinning: [68.8, 74.4, 80, 88, 93.6, 100, 108.8, 117.6, 126.4, 136, 147, 159.94, 172.87, 185.81, 199.92],
    final: [124.4, 134.52, 144.65, 159.12, 169.24, 180.81, 196.72, 212.64, 228.55, 245.91, 265.79, 289.18, 312.57, 335.96, 361.48],
  },
  plunging: {
    dmg: [74.59, 80.66, 86.73, 95.4, 101.47, 108.41, 117.95, 127.49, 137.03, 147.44, 159.37, 173.39, 187.41, 201.44, 216.74],
    low: [149.14, 161.28, 173.42, 190.77, 202.91, 216.78, 235.86, 254.93, 274.01, 294.82, 318.67, 346.71, 374.75, 402.79, 433.38],
    high: [186.29, 201.45, 216.62, 238.28, 253.44, 270.77, 294.6, 318.42, 342.25, 368.25, 398.03, 433.06, 468.08, 503.11, 541.32],
  },
  skill: {
    pressDMG: [146.4, 157.38, 168.36, 183, 193.98, 204.96, 219.6, 234.24, 248.88, 263.52, 278.16, 292.8, 311.1, 329.4, 347.7],
    holdDMG: [245.6, 264.02, 282.44, 307, 325.42, 343.84, 368.4, 392.96, 417.52, 442.08, 466.64, 491.2, 521.9, 552.6, 583.3],
    brandDMG: [96, 103.2, 110.4, 120, 127.2, 134.4, 144, 153.6, 163.2, 172.8, 182.4, 192, 204, 216, 228],
    phyResDec: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 25, 25, 25, 25, 25],
    cyroResDec: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 25, 25, 25, 25, 25]
  },
  burst: {
    dmg: [245.6, 264.02, 282.44, 307, 325.42, 343.84, 368.4, 392.96, 417.52, 442.08, 466.64, 491.2, 521.9, 552.6, 583.3],
    baseDMG: [367.05, 396.92, 426.8, 469.48, 499.36, 533.5, 580.45, 627.4, 674.34, 725.56, 784.25, 853.26, 922.27, 991.29, 1066.57],
    stackDMG: [74.99, 81.1, 87.2, 95.92, 102.02, 109, 118.59, 128.18, 137.78, 148.24, 160.23, 174.33, 188.43, 202.53, 217.91]
  }
}
const physicalBurst25 = (val, stats): FormulaItem => {
  val = val / 100
  const hitModeMultiKey = stats.hitMode === "avgHit" ? "burst_avgHit_base_multi" : stats.hitMode === "critHit" ? "critHit_base_multi" : ""
  return [s => val * s.finalATK * (hitModeMultiKey ? s[hitModeMultiKey] : 1) * (s.physical_burst_hit_base_multi + 0.25) * s.enemyLevel_multi * s.physical_enemyRes_multi, ["finalATK", ...(hitModeMultiKey ? [hitModeMultiKey] : []), "physical_burst_hit_base_multi", "enemyLevel_multi", "physical_enemyRes_multi"]]
}
const formula: IFormulaSheet = {
  normal: Object.fromEntries(data.normal.hitArr.map((arr, i) =>
    [i, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "normal")])),
  charged: Object.fromEntries(Object.entries(data.charged).map(([name, arr]) =>
    [name, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "charged")])),
  plunging: Object.fromEntries(Object.entries(data.plunging).map(([name, arr]) =>
    [name, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "plunging")])),
  skill: {
    pressDMG: stats => basicDMGFormula(data.skill.pressDMG[stats.tlvl.skill], stats, "skill"),
    holdDMG: stats => basicDMGFormula(data.skill.holdDMG[stats.tlvl.skill], stats, "skill"),
    brandDMG: stats => basicDMGFormula(data.skill.brandDMG[stats.tlvl.skill], stats, "skill"),
  },
  burst: {
    dmg: stats => basicDMGFormula(data.burst.dmg[stats.tlvl.burst], stats, "burst"),
    ...Object.fromEntries([...Array(31).keys()].map(i =>
      [i, stats => basicDMGFormula(data.burst.baseDMG[stats.tlvl.burst] + i * data.burst.stackDMG[stats.tlvl.burst], stats, "burst", "physical")])),
    ...Object.fromEntries([...Array(31).keys()].map(i =>
      [`${i}_50`, stats => physicalBurst25(data.burst.baseDMG[stats.tlvl.burst] + i * data.burst.stackDMG[stats.tlvl.burst], stats)]))
  },
  passive1: {
    dmg: stats => basicDMGFormula(data.burst.baseDMG[stats.tlvl.burst] / 2, stats, "burst", "physical"),
    dmg50: stats => physicalBurst25(data.burst.baseDMG[stats.tlvl.burst] / 2, stats)
  },
}
export default formula