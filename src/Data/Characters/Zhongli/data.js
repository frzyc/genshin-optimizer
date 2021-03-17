import { getTalentStatKey } from "../../../Build/Build"
import { basicDMGFormula } from "../../../Util/FormulaUtil"

const data = {
  baseStat: {
    characterHP: [1144, 2967, 3948, 5908, 6605, 7599, 8528, 9533, 10230, 11243, 11940, 12965, 13662, 14695],
    characterATK: [20, 51, 67, 101, 113, 130, 146, 163, 175, 192, 204, 222, 233, 251],
    characterDEF: [57, 149, 198, 297, 332, 382, 428, 479, 514, 564, 699, 651, 686, 738]
  },
  specializeStat: {
    key: "geo_dmg_",
    value: [0, 0, 0, 0, 7.2, 7.2, 14.4, 14.4, 14.4, 14.4, 21.6, 21.6, 28.8, 28.8]
  },
  normal: {
    hitArr: [
      [30.77, 33.27, 35.78, 39.36, 41.86, 44.72, 48.66, 52.59, 56.53, 60.82, 65.74, 71.53, 77.31, 83.1, 89.41],//1
      [31.15, 33.69, 36.22, 39.85, 42.38, 45.28, 49.26, 53.25, 57.23, 61.58, 66.56, 72.42, 78.27, 84.13, 90.52],//2
      [38.58, 41.72, 44.86, 49.34, 52.48, 56.07, 61, 65.94, 70.87, 76.26, 82.42, 89.68, 96.93, 104.18, 112.1],//3
      [42.94, 46.43, 49.93, 54.92, 58.42, 62.41, 67.9, 73.4, 78.89, 84.88, 91.74, 99.82, 107.89, 115.97, 124.77],//4
      [10.75, 11.63, 12.5, 13.75, 14.63, 15.63, 17, 18.38, 19.75, 21.25, 22.97, 24.99, 27.01, 29.03, 31.24],//5 ×4
      [54.5, 58.93, 63.37, 69.7, 74.14, 79.21, 86.18, 93.15, 100.12, 107.73, 116.44, 126.69, 136.93, 147.18, 158.36]
    ]
  },
  charged: {
    dmg: [111.03, 120.06, 129.1, 142.01, 151.05, 161.38, 175.58, 189.78, 203.98, 219.47, 237.22, 258.1, 278.97, 299.85, 322.62],
  },
  plunging: {
    dmg: [63.93, 69.14, 74.34, 81.77, 86.98, 92.93, 101.1, 109.28, 117.46, 126.38, 135.3, 144.22, 153.14, 162.06, 170.98],
    low: [127.84, 138.24, 148.65, 163.51, 173.92, 185.81, 202.16, 218.51, 234.86, 252.7, 270.54, 288.38, 306.22, 324.05, 341.89],
    high: [159.68, 172.67, 185.67, 204.24, 217.23, 232.09, 252.51, 272.93, 293.36, 315.64, 337.92, 360.2, 382.48, 404.76, 427.04]
  },
  skill: {
    steeleDMG: [16, 17.2, 18.4, 20, 21.2, 22.4, 24, 25.6, 27.2, 28.8, 30.4, 32, 34, 36, 38],
    resonanceDMG: [32, 34.4, 36.8, 40, 42.4, 44.8, 48, 51.2, 54.4, 57.6, 60.8, 64, 68, 72, 76],
    holdDMG: [80, 86, 92, 100, 106, 112, 120, 128, 136, 144, 152, 160, 170, 180, 190],
    shieldBase: [1232, 1356, 1489, 1633, 1787, 1951, 2126, 2311, 2506, 2712, 2927, 3153, 3389, 3636, 3893],
    shieldMaxHP: [12.8, 13.76, 14.72, 16, 16.96, 17.92, 19.2, 20.48, 21.76, 23.04, 24.32, 25.6, 27.2, 28.8, 30.4]
  },
  burst: {
    dmg: [401.08, 444.44, 487.8, 542, 590.78, 639.56, 704.6, 769.64, 834.68, 899.72, 964.76, 1029.8, 1084, 1138.2, 1192.4],
    petriDur: [3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 4, 4, 4, 4, 4, 4]
  }
}
function zliDMG(percent, hpMulti, stats, skillKey, elemental = false) {
  const val = percent / 100
  const statKey = getTalentStatKey(skillKey, stats, elemental) + "_multi"
  return [s => (val * s.finalATK + hpMulti * s.finalHP) * s[statKey], ["finalATK", "finalHP", statKey]]
}
const formula = {
  normal: {
    ...Object.fromEntries(data.normal.hitArr.map((percentArr, i) => [i, (tlvl, stats) =>
      basicDMGFormula(percentArr[tlvl] * (i === 4 ? 4 : 1), stats, "normal")])),
    ...Object.fromEntries(data.normal.hitArr.map((percentArr, i) => [`${i}HP`, (tlvl, stats) => {
      const val = percentArr[tlvl] / 100
      const statKey = getTalentStatKey("normal", stats) + "_multi"
      const multi = i === 4 ? 4 : 1
      return [s => (val * s.finalATK + 0.0139 * s.finalHP) * s[statKey] * multi, ["finalATK", "finalHP", statKey]]
    }])),
  },
  charged: {
    dmg: (tlvl, stats) => basicDMGFormula(data.charged.dmg[tlvl], stats, "charged"),
    dmgHP: (tlvl, stats) => zliDMG(data.charged.dmg[tlvl], 0.0139, stats, "charged")
  },
  plunging: {
    dmg: (tlvl, stats) => basicDMGFormula(data.plunging.dmg[tlvl], stats, "plunging"),
    dmgHP: (tlvl, stats) => zliDMG(data.plunging.dmg[tlvl], 0.0139, stats, "plunging"),
    low: (tlvl, stats) => basicDMGFormula(data.plunging.low[tlvl], stats, "plunging"),
    lowHP: (tlvl, stats) => zliDMG(data.plunging.low[tlvl], 0.0139, stats, "plunging"),
    high: (tlvl, stats) => basicDMGFormula(data.plunging.high[tlvl], stats, "plunging"),
    highHP: (tlvl, stats) => zliDMG(data.plunging.high[tlvl], 0.0139, stats, "plunging"),
  },
  skill: {
    steeleDMG: (tlvl, stats) => basicDMGFormula(data.skill.steeleDMG[tlvl], stats, "skill"),
    steeleDMGHP: (tlvl, stats) => zliDMG(data.skill.steeleDMG[tlvl], 0.019, stats, "skill"),
    resonanceDMG: (tlvl, stats) => basicDMGFormula(data.skill.resonanceDMG[tlvl], stats, "skill"),
    resonanceDMGHP: (tlvl, stats) => zliDMG(data.skill.resonanceDMG[tlvl], 0.019, stats, "skill"),
    holdDMG: (tlvl, stats) => basicDMGFormula(data.skill.holdDMG[tlvl], stats, "skill"),
    holdDMGHP: (tlvl, stats) => zliDMG(data.skill.holdDMG[tlvl], 0.019, stats, "skill"),
    shield: (tlvl, stats) => {
      const base = data.skill.shieldBase[tlvl]
      const hpMulti = data.skill.shieldMaxHP[tlvl] / 100
      return [s => hpMulti * s.finalHP + base, ["finalHP"]]
    }
  },
  burst: {
    dmg: (tlvl, stats) => basicDMGFormula(data.burst.dmg[tlvl], stats, "burst"),
    dmgHP: (tlvl, stats) => zliDMG(data.burst.dmg[tlvl], 0.33, stats, "burst"),
  }
}

export default formula
export {
  data
}