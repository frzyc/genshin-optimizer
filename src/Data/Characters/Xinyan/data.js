import {basicDMGFormula} from "../../../Util/FormulaUtil";
import {getTalentStatKey} from "../../../Build/Build";


export const data = {
    baseStat: {
        characterHP: [939, 2413, 3114, 4665, 5163, 5939, 6604, 7379, 7878, 8653, 9151, 9927, 10425, 11201],
        characterATK: [21, 54, 69, 103, 115, 132, 147, 164, 175, 192, 203, 220, 231, 249],
        characterDEF: [67, 172, 222, 333, 368, 423, 471, 526, 562, 617, 652, 708, 743, 799],
    },
    specializeStat: {
        key: "atk_",
        value: [0, 0, 0, 0, 6, 6, 12, 12, 12, 12, 18, 18, 24, 24],
    },
    normal: {
        hitArr: [
            [76.54, 82.77, 89, 97.9, 104.13, 111.25, 121.04, 130.83, 140.62, 151.3, 161.98, 172.66, 183.34, 194.02, 204.7],//1
            [73.96, 79.98, 86, 94.6, 100.62, 107.5, 116.96, 126.42, 135.88, 146.2, 156.52, 166.84, 177.16, 187.48, 197.8],//2
            [95.46, 103.23, 111, 122.1, 129.87, 138.75, 150.96, 163.17, 175.38, 199.7, 202.02, 215.34, 228.66, 231.98, 255.3],//3
            [115.84, 125.27, 134.7, 148.17, 157.6, 168.38, 183.19, 198.01, 212.83, 228.99, 245.15, 261.32, 277.48, 293.65, 309.81],//4
        ]
    },
    charged: {
        spinning: [62.55, 67.64, 72.73, 80, 85.09, 90.91, 98.91, 106.91, 114.91, 123.64, 132.36, 141.09, 149.82, 158.55, 167.27],
        final: [113.09, 122.3, 131.5, 144.65, 153.86, 164.38, 178.84, 193.31, 207.77, 223.55, 239.33, 255.11, 270.89, 286.67, 302.45],
    },
    plunging: {
        dmg: [74.59, 80.66, 86.73, 95.4, 101.47, 108.41, 117.95, 127.49, 137.03, 147.44, 157.85, 168.26, 178.66, 189.07, 199.48],
        low: [149.14, 161.28, 173.42, 190.77, 202.91, 216.78, 235.86, 254.93, 274.01, 294.82, 315.63, 336.44, 357.25, 378.06, 398.87],
        high: [186.29, 201.45, 216.62, 238.28, 253.44, 270.77, 294.6, 318.42, 342.25, 368.25, 394.24, 420.23, 446.23, 472.22, 498.21],
    },
    skill: {
        dmg: [169.6, 182.32, 195.04, 212, 224.72, 237.44, 254.4, 271.36, 288.32, 305.28, 322.24, 339.2, 360.4, 381.6, 402.8],
        def1: [104.04, 111.84, 119.65, 130.05, 137.85, 145.66, 156.06, 166.46, 176.87, 187.27, 197.68, 208.08, 221.09, 234.09, 247.1],
        flat1: [501, 551, 605, 663, 726, 793, 864, 939, 1018, 1101, 1189, 1281, 1377, 1477, 1581],
        def2: [122.4, 131.58, 140.76, 153, 162.18, 171.36, 183.6, 195.84, 208.08, 220.32, 232.56, 244.8, 260.1, 275.4, 290.7],
        flat2: [589, 648, 712, 780, 854, 932, 1016, 1104, 1197, 1296, 1399, 1507, 1620, 1737, 1860],
        def3: [144, 154.8, 165.6, 180, 190.8, 201.6, 216, 230.4, 244.8, 259.2, 273.6, 288, 306, 324, 342],
        flat3: [693, 762, 837, 918, 1005, 1097, 1195, 1299, 1409, 1524, 1646, 1773, 1905, 2044, 2188],
        dot: [33.6, 36.12, 38.64, 42, 44.52, 47.04, 50.4, 53.76, 57.12, 60.48, 63.84, 67.2, 71.4, 75.6, 79.8],
    },
    burst: {
        dmg: [340.8, 366.36, 391.92, 426, 451.56, 477.12, 511.2, 545.28, 579.36, 613.44, 647.52, 681.6, 724.2, 766.8, 809.4],
        dot: [40, 43, 46, 50, 53, 56, 60, 64, 68, 72, 76, 80, 85, 90, 95],
    }
}
function nyanDMG(percent, defMulti, stats, skillKey = "charged", elemental = false) {
    const val = percent / 100
    const statKey = getTalentStatKey(skillKey, stats, elemental) + "_multi"
    return [s => (val * (s.finalATK + (defMulti * s.finalDEF))) * s[statKey], ["finalATK", "finalDEF", statKey]]
}

const formula = {
    normal: Object.fromEntries(data.normal.hitArr.map((percentArr, i) => [i, (tlvl, stats) =>
        basicDMGFormula(percentArr[tlvl], stats, "normal")])),
    charged: {
        spinning: (tlvl, stats) => basicDMGFormula(data.charged.spinning[tlvl], stats, "charged"),
        spinningDEF: (tlvl, stats) => nyanDMG(data.charged.spinning[tlvl], 0.5, stats),
        final: (tlvl, stats) => basicDMGFormula(data.charged.final[tlvl], stats, "charged"),
        finalDEF: (tlvl, stats) => nyanDMG(data.charged.final[tlvl], 0.5, stats),
    },
    plunging: Object.fromEntries(Object.entries(data.plunging).map(([name, arr]) =>
        [name, (tlvl, stats) => basicDMGFormula(arr[tlvl], stats, "plunging")])),
    skill: {
        dmg: (tlvl, stats) => basicDMGFormula(data.skill.dmg[tlvl], stats, "skill"),
        shield1: (tlvl) => {
            const def = data.skill.def1[tlvl] / 100
            const flat = data.skill.flat1[tlvl]
            return [(s) => def * s.finalDEF + flat, ["finalDEF"]]
        },
        shield2: (tlvl) => {
            const def = data.skill.def2[tlvl] / 100
            const flat = data.skill.flat2[tlvl]
            return [(s) => def * s.finalDEF + flat, ["finalDEF"]]
        },
        shield3: (tlvl) => {
            const def = data.skill.def3[tlvl] / 100
            const flat = data.skill.flat3[tlvl]
            return [(s) => def * s.finalDEF + flat, ["finalDEF"]]
        },
        dot: (tlvl, stats) => basicDMGFormula(data.skill.dot[tlvl], stats, "skill"),
    },
    burst: {
        dmg: (tlvl, stats) => basicDMGFormula(data.burst.dmg[tlvl], stats, "normal", false), //TODO physical burst dmg formula is missing
        dot: (tlvl, stats) => basicDMGFormula(data.burst.dot[tlvl], stats, "burst"),

    },
}
export default formula
