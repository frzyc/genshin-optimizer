import { applyArtifacts, computeAllStats, createProxiedStats } from "../TestUtils"
import formula from "./data"

let setupStats

describe("Traveler Anemo", () => {
  beforeEach(() => {
    setupStats = createProxiedStats({
      characterHP: 10875, characterATK: 212, characterDEF: 683,
      characterEle: "anemo", characterLevel: 90,
      weaponType: "sword", weaponATK: 429,

      atk_: 24, enerRech_ : 16 + 61.3,
      physical_enemyRes_: 10,
      tlvl: Object.freeze({ auto: 4 - 1, skill: 9 - 1, burst: 9 - 1 }),
    })
  })

  describe("with artifacts", () => {
    beforeEach(() => applyArtifacts(setupStats, [
      { hp: 3967, critRate_: 5.8, critDMG_: 7, def: 39, def_: 14.6 }, // Flower of Life
      { atk: 311, atk_: 16.9, hp_: 10.5, def: 46, enerRech_: 5.8 }, // Plume of Death
      { atk_: 46.6, critRate_: 10.9, critDMG_: 5.4, hp_: 8.7, hp: 508 }, // Sands of Eon
      { anemo_dmg_: 46.6, hp_: 4.7, hp: 807, def_: 5.8, atk: 51 }, // Goblet of Eonothem
      { atk_: 38.7, atk: 53, def: 46, hp_: 4.7, enerRech_: 6.5 }, // Circlet of Logos
      { anemo_dmg_: 15, swirl_dmg_: 60 }, // Viridescent Venerer 4 Pieces Set
    ]))

    test("overall stats", () => {
      const stats = computeAllStats(setupStats)
      expect(stats.finalHP).toApproximate(19262)
      expect(stats.finalATK).toApproximate(1922)
      expect(stats.finalDEF).toApproximate(954)
      expect(stats.eleMas).toApproximate(0)
      expect(stats.critRate_).toApproximate(21.7)
      expect(stats.critDMG_).toApproximate(62.4)
      expect(stats.enerRech_).toApproximate(89.6)
      expect(stats.anemo_dmg_).toApproximate(61.6)
    })

    describe("no crit", () => {
      beforeEach(() => setupStats.hitMode = "hit")

      describe("Electro Hypostasis lvl 93", () => {
        beforeEach(() => setupStats.enemyLevel = 93)

        test("hits", () => {
          const stats = computeAllStats(setupStats)
          expect(formula.normal[0](stats)[0](stats)).toApproximate(488)
          expect(formula.normal[1](stats)[0](stats)).toApproximate(476)
          expect(formula.normal[2](stats)[0](stats)).toApproximate(581)
          expect(formula.normal[3](stats)[0](stats)).toApproximate(640)
          expect(formula.normal[4](stats)[0](stats)).toApproximate(777)
          expect(formula.charged[0](stats)[0](stats)).toApproximate(613)
          expect(formula.charged[1](stats)[0](stats)).toApproximate(793)
          expect(formula.skill.initial_dmg(stats)[0](stats)).toApproximate(282)
          expect(formula.skill.initial_max(stats)[0](stats)).toApproximate(396)
          expect(formula.skill.storm_dmg(stats)[0](stats)).toApproximate(4149)
          expect(formula.skill.storm_max(stats)[0](stats)).toApproximate(4527)
          expect(formula.burst.dmg(stats)[0](stats)).toApproximate(1905)
        })
      })

      describe("Hilichurl lvl 87", () => {
        beforeEach(() => setupStats.enemyLevel = 87)

        test("hits", () => {
          const stats = computeAllStats(setupStats)
          expect(formula.normal[0](stats)[0](stats)).toApproximate(495)
          expect(formula.normal[1](stats)[0](stats)).toApproximate(484)
          expect(formula.normal[2](stats)[0](stats)).toApproximate(590)
          expect(formula.normal[3](stats)[0](stats)).toApproximate(650)
          expect(formula.normal[4](stats)[0](stats)).toApproximate(789)
          expect(formula.charged[0](stats)[0](stats)).toApproximate(623)
          expect(formula.charged[1](stats)[0](stats)).toApproximate(805)
          expect(formula.skill.initial_dmg(stats)[0](stats)).toApproximate(287)
          expect(formula.skill.initial_max(stats)[0](stats)).toApproximate(404)
          expect(formula.skill.storm_dmg(stats)[0](stats)).toApproximate(4215)
          expect(formula.skill.storm_max(stats)[0](stats)).toApproximate(4599)
          expect(formula.burst.dmg(stats)[0](stats)).toApproximate(2258)
        })
      })
    })
  })

  describe("swirl", () => {
    beforeEach(() => {
      setupStats.enemyLevel = 85
      applyArtifacts(setupStats, [{ eleMas: 0 }]) // 4VV
    })

    test("swirl", () => {
      const stats = computeAllStats(setupStats)
      expect(stats.pyro_swirl_hit).toApproximate(649)
    })
  })

  describe("without artifacts", () => {
    test("reaction", () => {
      const stats = computeAllStats(setupStats)
      expect(stats.pyro_swirl_hit).toApproximate()
    })

    describe("no crit", () => {
      beforeEach(() => setupStats.hitMode = "hit")

      describe("Ruin Guard lvl 85", () => {
        beforeEach(() => setupStats.enemyLevel = 85)

        test("hits", () => {
          const stats = computeAllStats(setupStats)
          expect(formula.normal[0](stats)[0](stats)).toApproximate()
          expect(formula.normal[1](stats)[0](stats)).toApproximate()
          expect(formula.normal[2](stats)[0](stats)).toApproximate()
          expect(formula.normal[3](stats)[0](stats)).toApproximate()
          expect(formula.normal[4](stats)[0](stats)).toApproximate()
          expect(formula.charged[0](stats)[0](stats)).toApproximate()
          expect(formula.charged[1](stats)[0](stats)).toApproximate()
          expect(formula.skill.initial_dmg(stats)[0](stats)).toApproximate()
          expect(formula.skill.initial_max(stats)[0](stats)).toApproximate()
          expect(formula.skill.storm_dmg(stats)[0](stats)).toApproximate()
          expect(formula.skill.storm_max(stats)[0](stats)).toApproximate()
          expect(formula.burst.dmg(stats)[0](stats)).toApproximate()
        })
      })
      describe("Electro Hypostasis lvl 93", () => {
        beforeEach(() => setupStats.enemyLevel = 93)

        test("hits", () => {
          const stats = computeAllStats(setupStats)
          expect(formula.normal[0](stats)[0](stats)).toApproximate()
          expect(formula.normal[1](stats)[0](stats)).toApproximate()
          expect(formula.normal[2](stats)[0](stats)).toApproximate()
          expect(formula.normal[3](stats)[0](stats)).toApproximate()
          expect(formula.normal[4](stats)[0](stats)).toApproximate()
          expect(formula.charged[0](stats)[0](stats)).toApproximate()
          expect(formula.charged[1](stats)[0](stats)).toApproximate()
          expect(formula.skill.initial_dmg(stats)[0](stats)).toApproximate()
          expect(formula.skill.initial_max(stats)[0](stats)).toApproximate()
          expect(formula.skill.storm_dmg(stats)[0](stats)).toApproximate()
          expect(formula.skill.storm_max(stats)[0](stats)).toApproximate()
          expect(formula.burst.dmg(stats)[0](stats)).toApproximate()
        })
      })
    })
  })
})
