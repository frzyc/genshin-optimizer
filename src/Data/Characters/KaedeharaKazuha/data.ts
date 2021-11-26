import { IFormulaSheet } from "../../../Types/character"
import { basicDMGFormula } from "../../../Util/FormulaUtil"
import { absorbableEle } from "../dataUtil"

export const data = {
  normal: {
    hitArr: [
      [44.98, 48.64, 52.3, 57.53, 61.19, 65.38, 71.13, 76.88, 82.63, 88.91, 96.1, 104.56, 113.02, 121.47, 130.7],//1
      [45.24, 48.92, 52.6, 57.86, 61.54, 65.75, 71.54, 77.32, 83.11, 89.42, 96.65, 105.16, 113.66, 122.17, 131.45],//2
      [25.8, 27.9, 30, 33, 35.1, 37.5, 40.8, 44.1, 47.4, 51, 55.13, 59.98, 64.83, 69.68, 74.97],//3.1
      [30.96, 33.48, 36, 39.6, 42.12, 45, 48.96, 52.92, 56.88, 61.2, 66.15, 71.97, 77.79, 83.61, 89.96],//3.2
      [60.72, 65.66, 70.6, 77.66, 82.6, 88.25, 96.02, 103.78, 111.55, 120.02, 129.73, 141.14, 152.56, 163.98, 176.43],//4
      [25.37, 27.44, 29.5, 32.45, 34.52, 36.88, 40.12, 43.37, 46.61, 50.15, 54.21, 58.98, 63.75, 68.52, 73.72],//5x3
    ],
  },
  charged: {
    hit1: [43, 46.5, 50, 55, 58.5, 62.5, 68, 73.5, 79, 85, 91.88, 99.96, 108.05, 116.13, 124.95],
    hit2: [74.65, 80.72, 86.8, 95.48, 101.56, 108.5, 118.05, 127.6, 137.14, 147.56, 159.5, 173.53, 187.57, 201.6, 216.91]
  },
  plunging: {
    dmg: [81.83, 88.49, 95.16, 104.67, 111.33, 118.94, 129.41, 139.88, 150.35, 161.76, 173.18, 184.6, 196.02, 207.44, 218.86],
    low: [163.63, 176.95, 190.27, 209.3, 222.62, 237.84, 258.77, 279.7, 300.63, 323.46, 346.29, 369.12, 391.96, 414.79, 437.62],
    high: [204.39, 221.02, 237.66, 261.42, 278.06, 297.07, 323.21, 349.36, 375.5, 404.02, 432.54, 461.06, 489.57, 518.09, 546.61]
  },
  skill: {
    press: [192, 206.4, 220.8, 240, 254.4, 268.8, 288, 307.2, 326.4, 345.6, 364.8, 384, 408, 432, 456],
    hold: [260.8, 280.36, 299.92, 326, 345.56, 365.12, 391.2, 417.28, 443.36, 469.44, 495.52, 521.6, 554.2, 586.8, 619.4]
  },
  burst: {
    dmg: [262.4, 282.08, 301.76, 328, 347.68, 367.36, 393.6, 419.84, 446.08, 472.32, 498.56, 524.8, 557.6, 590.4, 623.2],
    dot: [120, 129, 138, 150, 159, 168, 180, 192, 204, 216, 228, 240, 255, 270, 285],
    add: [36, 38.7, 41.4, 45, 47.7, 50.4, 54, 57.6, 61.2, 64.8, 68.4, 72, 76.5, 81, 85.5]
  }
}

const formula: IFormulaSheet = {
  normal: Object.fromEntries(data.normal.hitArr.map((percentArr, i) => [i, stats =>
    basicDMGFormula(percentArr[stats.tlvl.auto], stats, "normal")])),
  charged: {
    hit1: stats => basicDMGFormula(data.charged.hit1[stats.tlvl.auto], stats, "charged"),
    hit2: stats => basicDMGFormula(data.charged.hit2[stats.tlvl.auto], stats, "charged"),
  },
  plunging: {
    dmg: stats => basicDMGFormula(data.plunging.dmg[stats.tlvl.auto], stats, "plunging"),
    low: stats => basicDMGFormula(data.plunging.low[stats.tlvl.auto], stats, "plunging"),
    high: stats => basicDMGFormula(data.plunging.high[stats.tlvl.auto], stats, "plunging"),
  },
  skill: {
    press: stats => basicDMGFormula(data.skill.press[stats.tlvl.skill], stats, "skill"),
    hold: stats => basicDMGFormula(data.skill.hold[stats.tlvl.skill], stats, "skill"),
    pdmg: stats => basicDMGFormula(data.plunging.dmg[stats.tlvl.auto], stats, "plunging", "anemo"),
    plow: stats => basicDMGFormula(data.plunging.low[stats.tlvl.auto], stats, "plunging", "anemo"),
    phigh: stats => basicDMGFormula(data.plunging.high[stats.tlvl.auto], stats, "plunging", "anemo"),
  },
  burst: {
    dmg: stats => basicDMGFormula(data.burst.dmg[stats.tlvl.burst], stats, "burst"),
    dot: stats => basicDMGFormula(data.burst.dot[stats.tlvl.burst], stats, "burst"),
    ...Object.fromEntries(absorbableEle.map(eleKey => [eleKey, stats => basicDMGFormula(data.burst.add[stats.tlvl.burst], stats, "burst", eleKey)]))
  },
  passive1: Object.fromEntries(absorbableEle.map(eleKey => [eleKey, stats => basicDMGFormula(200, stats, "plunging", eleKey)])),
  passive2: Object.fromEntries(absorbableEle.map(eleKey => [eleKey, stats => [s => (s.premod?.eleMas ?? s.eleMas) * 0.04, ['eleMas']]])),
  constellation6: {
    bonus: stats => [s => (s.premod?.eleMas ?? s.eleMas) * 0.2, ['eleMas']]
  }
}

export default formula
