import { applyArtifacts, computeAllStats, createProxiedStats, parseTestFlexObject } from "../../TestUtils"
import formula from "./data"

let setupStats

//aznn8ter#3651 data female
const url = "http://localhost:3000/genshin-optimizer/#/flex?v=2&d=5t5g01049W0a615D06i2t5g0424aJ13g05j019ct5k03148W05K02F14F2t5k04443R02L0511811u5k0d342L01Dc6W03P0n000003L9000000gSacrificialSword3L9001010011"
const { artifacts } = parseTestFlexObject(url)

describe("aznn8ter#3651 Traveler Anemo", () => {
  beforeEach(() => {
    setupStats = createProxiedStats({
      characterHP: 10875, characterATK: 213, characterDEF: 682,
      characterEle: "anemo", characterLevel: 90,
      weaponType: "sword", weaponATK: 454,

      atk_: 24, // Specialize stat
      enerRech_: 16 + 61.3, // Sac sword 90 + C2
      physical_enemyRes_: 10,
      tlvl: Object.freeze({ auto: 4 - 1, skill: 9 - 1, burst: 9 - 1 }),
    })
  })

  describe("with artifacts", () => {
    beforeEach(() => applyArtifacts(setupStats, [
      ...artifacts,
      { anemo_dmg_: 15, swirl_dmg_: 60 }, // Viridescent Venerer 4 Pieces Set
    ]))

    test("overall stats", () => {
      const stats = computeAllStats(setupStats)
      expect(stats.finalHP).toApproximate(18581)
      expect(stats.finalATK).toApproximate(1938)
      expect(stats.finalDEF).toApproximate(991)
      expect(stats.eleMas).toApproximate(0)
      expect(stats.critRate_).toApproximate(10.8)
      expect(stats.critDMG_).toApproximate(67.9)
      expect(stats.enerRech_).toApproximate(89.6)
      expect(stats.anemo_dmg_).toApproximate(61.6)
    })

    describe("no crit", () => {
      beforeEach(() => setupStats.hitMode = "hit")

      describe("Electro Hypostasis lvl 93", () => {
        beforeEach(() => setupStats.enemyLevel = 93)

        test("hits", () => {
          const stats = computeAllStats(setupStats)
          expect(formula.normal[0](stats)[0](stats)).toApproximate(492)
          expect(formula.normal[1](stats)[0](stats)).toApproximate(480)
          expect(formula.normal[2](stats)[0](stats)).toApproximate(586)
          expect(formula.normal[3](stats)[0](stats)).toApproximate(654)
          expect(formula.normal[4](stats)[0](stats)).toApproximate(783)
          expect(formula.charged[0](stats)[0](stats)).toApproximate(618)
          expect(formula.charged[2](stats)[0](stats)).toApproximate(799)
          expect(formula.skill.initial_dmg(stats)[0](stats)).toApproximate(285)
          expect(formula.skill.initial_max(stats)[0](stats)).toApproximate(399)
          expect(formula.skill.storm_dmg(stats)[0](stats)).toApproximate(4183)
          expect(formula.skill.storm_max(stats)[0](stats)).toApproximate(4563)
          expect(formula.burst.dmg(stats)[0](stats)).toApproximate(1920)
        })
      })

      describe("Hilichurl lvl 87", () => {
        beforeEach(() => setupStats.enemyLevel = 87)

        test("hits", () => {
          const stats = computeAllStats(setupStats)
          expect(formula.normal[0](stats)[0](stats)).toApproximate(499)
          expect(formula.normal[1](stats)[0](stats)).toApproximate(488)
          expect(formula.normal[2](stats)[0](stats)).toApproximate(595)
          expect(formula.normal[3](stats)[0](stats)).toApproximate(655)
          expect(formula.normal[4](stats)[0](stats)).toApproximate(795)
          expect(formula.charged[0](stats)[0](stats)).toApproximate(628)
          //expect(formula.charged[1](stats)[0](stats)).toApproximate(812) // dmg from female mc, calc using male mc
          expect(formula.skill.initial_dmg(stats)[0](stats)).toApproximate(289)
          expect(formula.skill.initial_max(stats)[0](stats)).toApproximate(405)
          expect(formula.skill.storm_dmg(stats)[0](stats)).toApproximate(4250)
          expect(formula.skill.storm_max(stats)[0](stats)).toApproximate(4636)
          expect(formula.burst.dmg(stats)[0](stats)).toApproximate(1951)
        })
      })
    })
  })
})
