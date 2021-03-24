import { basicDMGFormula } from "../../../Util/FormulaUtil"

const data = {
  baseStat: {
    characterHP: [1094, 2811, 3628, 5435, 6015, 6919, 7694, 8597, 9178, 10081, 10662, 11565, 12146, 13050],
    characterATK: [19, 49, 63, 94, 104, 119, 133, 148, 158, 174, 184, 200, 210, 225],
    characterDEF: [54, 140, 180, 270, 299, 344, 382, 427, 456, 501, 530, 575, 603, 648]
  },
  specializeStat: {
    key: "electro_dmg_",
    value: [0, 0, 0, 0, 6, 6, 12, 12, 12, 12, 18, 18, 24, 24]
  },
  normal: {
    hitArr: [
      [71.12, 76.91, 82.7, 90.97, 96.76, 103.38, 112.47, 121.57, 130.67, 140.59, 151.96, 165.33, 178.71, 192.08, 206.67],
      [70.86, 76.63, 82.4, 90.64, 96.41, 103, 112.06, 121.13, 130.19, 140.08, 151.41, 164.73, 178.06, 191.38, 205.92],
      [88.32, 95.51, 102.7, 112.97, 120.16, 128.38, 139.67, 150.97, 162.27, 174.59, 188.71, 205.32, 221.92, 238.53, 256.65],
      [86.52, 93.56, 100.6, 110.66, 117.7, 125.75, 136.82, 147.88, 158.95, 171.02, 184.85, 201.12, 217.39, 233.65, 251.4],
      [112.14, 121.27, 130.4, 143.44, 152.57, 163, 177.34, 191.69, 206.03, 221.68, 239.61, 260.7, 281.78, 302.87, 325.87],
    ],
  },
  charged: {
    spinning: [56.24, 60.82, 65.4, 71.94, 76.52, 81.75, 88.94, 96.14, 103.33, 111.18, 120.17, 130.75, 141.32, 151.9, 163.43],
    finalATK: [101.82, 110.11, 118.4, 130.24, 138.53, 148, 161.02, 174.05, 187.07, 201.28, 217.56, 236.71, 255.85, 275, 295.88]
  },
  plunging: {
    dmg: [74.59, 80.66, 86.73, 95.4, 101.47, 108.41, 117.95, 127.49, 137.03, 147.44, 157.85, 168.26, 178.66, 189.07, 199.48],
    low: [149.14, 161.28, 173.42, 190.77, 202.91, 216.78, 235.86, 254.93, 274.01, 294.82, 315.63, 336.44, 357.25, 378.06, 398.87],
    high: [186.29, 201.45, 216.62, 238.28, 253.44, 270.77, 294.6, 318.42, 342.25, 368.25, 394.24, 420.23, 446.23, 472.22, 498.21]
  },
  skill: {
    hp: [14.4, 15.48, 16.56, 18, 19.08, 20.16, 21.6, 23.04, 24.48, 25.92, 27.36, 28.8, 30.6, 32.4, 34.2],
    flat: [1386, 1525, 1675, 1837, 2010, 2195, 2392, 2600, 2819, 3050, 3293, 3547, 3813, 4090, 4379],
    dmg: [121.6, 130.72, 139.84, 152, 161.12, 170.24, 182.4, 194.56, 206.72, 218.88, 231.04, 243.2, 258.4, 273.6, 288.8],
    onHit: [160, 172, 184, 200, 212, 224, 240, 256, 272, 288, 304, 320, 340, 360, 380],
  },
  burst: {
    dmg: [121.6, 130.72, 139.84, 152, 161.12, 170.24, 182.4, 194.56, 206.72, 218.88, 231.04, 243.2, 258.4, 273.6, 288.8],
    lightningDMG: [96, 103.2, 110.4, 120, 127.2, 134.4, 144, 153.6, 163.2, 172.8, 182.4, 192, 204, 216, 228],
    dmgRed: [20, 21, 22, 24, 25, 26, 28, 30, 32, 34, 35, 36, 37, 38, 39],
  }
}

const formula = {
  normal: {
    ...Object.fromEntries(data.normal.hitArr.map((percentArr, i) => [i, stats =>
      basicDMGFormula(percentArr[stats.tlvl.auto], stats, "normal")])),
    ...Object.fromEntries(data.normal.hitArr.map((percentArr, i) => [`a${i}`, stats =>
      basicDMGFormula(percentArr[stats.tlvl.auto] * 0.2, stats, "normal", true)])),
  },
  charged: {
    spinning: stats => basicDMGFormula(data.charged.spinning[stats.tlvl.auto], stats, "charged"),
    finalATK: stats => basicDMGFormula(data.charged.finalATK[stats.tlvl.auto], stats, "charged"),
  },
  plunging: Object.fromEntries(Object.entries(data.plunging).map(([key, arr]) => [key, stats => basicDMGFormula(arr[stats.tlvl.auto], stats, "plunging")])),
  skill: {
    shield: stats => {
      const hp = data.skill.hp[stats.tlvl.skill] / 100
      const flat = data.skill.flat[stats.tlvl.skill]
      return [(s) => hp * s.finalHP + flat, ["finalHP"]]
    },
    dmg: stats => basicDMGFormula(data.skill.dmg[stats.tlvl.skill], stats, "skill"),
    onHit: stats => basicDMGFormula(data.skill.onHit[stats.tlvl.skill], stats, "skill"),
  },
  burst: {
    dmg: stats => basicDMGFormula(data.burst.dmg[stats.tlvl.burst], stats, "burst"),
    lightningDMG: stats => basicDMGFormula(data.burst.lightningDMG[stats.tlvl.burst], stats, "burst"),
  }
}

export default formula
export {
  data
}