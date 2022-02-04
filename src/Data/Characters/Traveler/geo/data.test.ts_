import { applyArtifacts, computeAllStats, createProxiedStats, parseTestFlexObject } from "../../TestUtils"
import formula from "./data"

let setupStats

//aznn8ter#3651 female Traveler
const url = "https://frzyc.github.io/genshin-optimizer/#/flex?v=2&d=565g01046214F05118K195k03148116b25_0921q5k04247Z03z05G09a165k0h347l0aD45I09r0p4g09444t15v06W0aU0o100003L9000000cSkywardBlade3L900101000"
const { artifacts } = parseTestFlexObject(url)

describe("aznn8ter#3651 Traveler Geo", () => {
  beforeEach(() => {
    setupStats = createProxiedStats({
      characterHP: 10875, characterATK: 213, characterDEF: 682,
      characterEle: "geo", characterLevel: 90,
      weaponType: "sword", weaponATK: 608,

      atk_: 24, // Specialize stat
      critRate_: 4, // Skyward Blade
      enerRech_: 55.1, // Skyward Blade 90
      physical_enemyRes_: 70, //Ruin guardian
      geo_enemyRes_: 10,
      enemyLevel: 84,
      tlvl: Object.freeze({ auto: 6 - 1, skill: 9 - 1, burst: 9 - 1 }),
    })
  })

  describe("with artifacts", () => {
    beforeEach(() => applyArtifacts(setupStats, [
      ...artifacts,
    ]))

    test("overall stats", () => {
      const stats = computeAllStats(setupStats)
      //expect(stats.finalHP).toApproximate(14842)
      expect(stats.finalATK).toApproximate(1856)
      //expect(stats.finalDEF).toApproximate(991)
      //expect(stats.eleMas).toApproximate(0)
      expect(stats.critRate_).toApproximate(43.9)
      expect(stats.critDMG_).toApproximate(85.1)
      //expect(stats.enerRech_).toApproximate(89.6)
      expect(stats.geo_dmg_).toApproximate(46.6)
    })

    describe("no crit", () => {
      beforeEach(() => setupStats.hitMode = "hit")

      test("hits", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(182)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(178)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(217)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(239)
        expect(formula.normal[4](stats)[0](stats)).toApproximate(290)
        expect(formula.charged[0](stats)[0](stats)).toApproximate(229)
        expect(formula.charged[2](stats)[0](stats)).toApproximate(296)
        expect(formula.plunging.dmg(stats)[0](stats)).toApproximate(262)
        expect(formula.plunging.low(stats)[0](stats)).toApproximate(525)
        expect(formula.plunging.high(stats)[0](stats)).toApproximate(656)
        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(5243)
        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(3129)
        expect(formula.passive2.geoAuto(stats)[0](stats)).toApproximate(746)
      })
    })
    describe("crit", () => {
      beforeEach(() => setupStats.hitMode = "critHit")

      test("hits", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(338)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(330)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(403)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(443)
        expect(formula.normal[4](stats)[0](stats)).toApproximate(538)
        expect(formula.charged[0](stats)[0](stats)).toApproximate(425)
        expect(formula.charged[2](stats)[0](stats)).toApproximate(549)
        expect(formula.plunging.dmg(stats)[0](stats)).toApproximate(486)
        expect(formula.plunging.low(stats)[0](stats)).toApproximate(972)
        expect(formula.plunging.high(stats)[0](stats)).toApproximate(1215)
        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(9707)
        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(5793)
        expect(formula.passive2.geoAuto(stats)[0](stats)).toApproximate(1381)
      })
    })
  })
})
