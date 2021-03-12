import { basicDMGFormula } from "../../../Util/FormulaUtil"

const data = {
  baseStat: {
    characterHP: [1003, 2577, 3326, 4982, 5514, 6343, 7052, 7881, 8413, 9241, 9773, 10602, 11134, 11962],
    characterATK: [20, 50, 65, 97, 108, 124, 138, 154, 164, 180, 191, 207, 217, 234],
    characterDEF: [61, 158, 211, 315, 352, 405, 455, 509, 546, 600, 637, 692, 729, 784]
  },
  specializeStat: {
    key: "physical_dmg_",
    value: [0, 0, 0, 0, 7.5, 7.5, 15, 15, 15, 15, 22.5, 22.5, 30, 30]
  },
  normal: {
    hitArr: [
      [95.92, 102.46, 109, 117.72, 124.26, 131.89, 141.7, 151.51, 161.32, 171.13, 180.94, 190.75, 200.56, 210.37, 220.18],
      [82.63, 88.27, 93.9, 101.41, 107.05, 113.62, 122.07, 130.52, 138.97, 147.42, 155.87, 164.33, 172.78, 181.23, 189.68],
      [103.31, 110.36, 117.4, 126.79, 133.84, 142.05, 152.62, 163.19, 173.75, 184.32, 194.88, 205.45, 216.02, 226.58, 237.15],
      [136.05, 145.32, 154.6, 166.97, 176.24, 187.07, 200.98, 214.89, 228.81, 242.72, 256.64, 270.55, 284.46, 298.38, 312.29],
    ]
  },
  charged: {
    spinning: [62.54, 67.63, 72.72, 79.99, 85.08, 90.9, 98.9, 106.9, 114.9, 123.62, 132.35, 141.08, 149.8, 158.53, 167.26],
    final: [113.09, 122.3, 131.5, 144.65, 153.86, 164.38, 178.84, 193.31, 207.77, 223.55, 239.33, 255.11, 270.89, 286.67, 302.45]
  },
  plunging: {
    dmg: [82.05, 88.72, 95.4, 104.94, 111.62, 119.25, 129.75, 140.24, 150.74, 162.19, 173.63, 185.08, 196.53, 207.98, 219.43],
    low: [164.06, 177.41, 190.77, 209.84, 223.2, 238.46, 259.44, 280.43, 301.41, 324.3, 347.19, 370.09, 392.98, 415.87, 438.76],
    high: [204.92, 221.6, 238.28, 262.1, 278.78, 297.85, 324.06, 350.27, 376.48, 405.07, 433.66, 462.26, 490.85, 519.44, 548.04]
  },
  skill: {
    press: [199.2, 214.14, 229.08, 249, 263.94, 278.88, 298.8, 318.72, 338.64, 358.56, 378.48, 398.4, 423.3, 448.2, 473.1],
    hold: [295.2, 317.34, 339.48, 369, 391.14, 413.28, 442.8, 472.32, 501.84, 531.36, 560.88, 590.4, 627.3, 664.2, 701.1],
    cd: {
      a1: 0.82, // 100% - 18%
      press: 6,
      hold: 10,
    }
  },
  burst: {
    summon: [160, 172, 184, 200, 212, 224, 240, 256, 272, 288, 304, 320, 340, 360, 380],
    dmg: [24, 25.8, 27.6, 30, 31.8, 33.6, 36, 38.4, 40.8, 43.2, 45.6, 48, 51, 54, 57],
    atkspd: [26, 28, 30, 32, 34, 36, 37, 38, 39, 40, 40, 40, 40, 40, 40],
  },
  c6: {
    dmg: 100,
    cd: 10,
    sigils: 1,
  }
}

const formula = {
  normal: Object.fromEntries(data.normal.hitArr.map((percentArr, i) => [i, (tlvl, stats) =>
    basicDMGFormula(percentArr[tlvl], stats, "normal")])),
  charged: Object.fromEntries(Object.entries(data.charged).map(([name, arr]) =>
    [name, (tlvl, stats) => basicDMGFormula(arr[tlvl], stats, "charged")])),
  plunging: {
    dmg: (tlvl, stats) => basicDMGFormula(data.plunging.dmg[tlvl], stats, "plunging"),
    low: (tlvl, stats) => basicDMGFormula(data.plunging.low[tlvl], stats, "plunging"),
    high: (tlvl, stats) => basicDMGFormula(data.plunging.high[tlvl], stats, "plunging"),
  },
  skill: {
    press: (tlvl, stats) => basicDMGFormula(data.skill.press[tlvl], stats, "skill"),
    hold: (tlvl, stats) => basicDMGFormula(data.skill.hold[tlvl], stats, "skill"),
    cd: {
      press: () => {
        const f = (stats) => data.skill.cd.press * (stats.ascension >= 1 ? data.skill.cd.a1 : 1);
        const d = ['ascension'];
        return [f, d];
      },
      hold: () => {
        const f = (stats) => data.skill.cd.hold * (stats.ascension >= 1 ? data.skill.cd.a1 : 1);
        const d = ['ascension'];
        return [f, d];
      }
    }
  },
  burst: {
    summon: (tlvl, stats) => basicDMGFormula(data.burst.summon[tlvl], stats, "burst"),
    dmg: (tlvl, stats) => basicDMGFormula(data.burst.dmg[tlvl], stats, "burst"),
    atkspd: (tlvl, stats) => [() => data.burst.atkspd[tlvl], [""]],
  },
  c6: {
    dmg: () => {
      const f = (stats) => {
        const multi = (1 + (stats.dmg_ + stats.electro_dmg_) / 100);
        return stats.characterATK * (data.c6.dmg / 100) * multi;
      };
      const d = ['characterATK'];
      return [f, d];
    }
  }
}

export default formula
export {
  data
}