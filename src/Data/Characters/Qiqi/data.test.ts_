import formula from "./data"
import { applyArtifacts, computeAllStats, createProxiedStats } from "../TestUtils"

let setupStats
// Discord ID: 822861794544582686
describe("Test Qiqi's formulas (Camelva#7085)", () => {
  beforeEach(() => {
    setupStats = createProxiedStats({
      characterHP: 10050, characterATK: 580 - 347, characterDEF: 749,
      characterEle: "cryo", characterLevel: 70,
      weaponType: "sword", weaponATK: 347,

      heal_: 16.6,

      enemyLevel: 92, physical_enemyRes_: 70, // Ruin Guard

      tlvl: Object.freeze({ auto: 1 - 1, skill: 5 - 1, burst: 6 - 1 }),
    })
  })

  describe("with artifacts", () => {
    beforeEach(() => applyArtifacts(setupStats, [
      { hp: 3967, critDMG_: 14.0, eleMas: 21, critRate_: 9.3, atk: 19, }, // Flower of Life
      { atk: 311, critRate_: 7.8, def: 53, atk_: 11.7, enerRech_: 4.5 }, // Plume of Death
      { atk_: 38.7, eleMas: 56, def: 42, hp_: 4.7, enerRech_: 6.5, }, // Sands of Eon
      { physical_dmg_: 58.3, enerRech_: 11.0, critRate_: 7.4, eleMas: 40, atk: 53, }, // Goblet of Eonothem
      { hp_: 7, atk_: 5.3, critDMG_: 7.0, enerRech_: 5.2, atk: 18, }, // Circlet of Logos
      { atk_: 18 }, // 2 Gladiator's Finale
    ]))

    test("overall stats", () => {
      const stats = computeAllStats(setupStats)
      expect(stats.finalHP).toApproximate(15188)
      expect(stats.finalATK).toApproximate(1407)
      expect(stats.finalDEF).toApproximate(844)
      expect(stats.eleMas).toApproximate(117)
      expect(stats.critRate_).toApproximate(29.5)
      expect(stats.critDMG_).toApproximate(71.0)
      expect(stats.heal_).toApproximate(16.6)
      expect(stats.physical_dmg_).toApproximate(58.3)
    })

    describe("no crit", () => {
      beforeEach(() => setupStats.hitMode = "hit")

      test("hits", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(118)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(121)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(75 * 2)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(77 * 2)
        expect(formula.normal[4](stats)[0](stats)).toApproximate(197)
        expect(formula.charged.dmg(stats)[0](stats)).toApproximate(201)
        expect(formula.skill.hit(stats)[0](stats)).toApproximate(756)
        expect(formula.skill.herald(stats)[0](stats)).toApproximate(283)
        expect(formula.skill.hitregen(stats)[0](stats)).toApproximate(343)
        expect(formula.skill.continuousregen(stats)[0](stats)).toApproximate(2275)
        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(2371)
        expect(formula.burst.healing(stats)[0](stats)).toApproximate(3133)
      })
    })

    describe("crit", () => {
      beforeEach(() => setupStats.hitMode = "critHit")

      test("hits", () => {
        const stats = computeAllStats(setupStats), { skill } = stats.tlvl
        expect(formula.normal[0](stats)[0](stats)).toApproximate(202)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(208)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(129 * 2)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(132 * 2)
        expect(formula.normal[4](stats)[0](stats)).toApproximate(338)
        expect(formula.charged.dmg(stats)[0](stats)).toApproximate(345)
        expect(formula.skill.hit(stats)[0](stats)).toApproximate(1293)
        expect(formula.skill.herald(stats)[0](stats)).toApproximate(485)
      })
    })
  })
})

// Discord ID: 822576356146544691
describe("Test Qiqi's formulas (Arby3#1371)", () => {
  beforeEach(() => {
    setupStats = createProxiedStats({
      characterHP: 10050, characterATK: 233, characterDEF: 749,
      characterEle: "cryo", characterLevel: 70,
      weaponType: "sword", weaponATK: 401,

      healing_: 16.6, enerRech_: 100 + 55.9,

      enemyLevel: 85, physical_enemyRes_: 70, // Ruin Guard

      tlvl: Object.freeze({ auto: 6 - 1, skill: 6 - 1, burst: 9 - 1 }),
    })
  })

  describe("with artifacts", () => {
    beforeEach(() => applyArtifacts(setupStats, [
      { hp: 4780, enerRech_: 5.2, critRate_: 3.1, def_: 22.6, atk_: 13.4 }, // Flower of Life
      { atk: 311, critRate_: 6.6, critDMG_: 17.1, def_: 5.8, atk_: 11.7 }, // Plume of Death
      { atk_: 46.6, hp: 627, critDMG_: 14, atk: 35, critRate_: 3.1 }, // Sands of Eon
      { cryo_dmg_: 46.6, critDMG_: 15.5, eleMas: 19, atk: 47, critRate_: 7.4 }, // Goblet of Eonothem
      { critRate_: 31.1, def: 42, def_: 20.4, critDMG_: 17.9, atk_: 5.3 }, // Circlet of Logos
      { pyro_dmg_: 15 }, // 2 Crimson Witch of Flames
    ]))

    test("overall stats", () => {
      const stats = computeAllStats(setupStats)
      expect(stats.finalHP).toApproximate(15457)
      expect(stats.finalATK).toApproximate(1514)
      expect(stats.finalDEF).toApproximate(1157)
      expect(stats.eleMas).toApproximate(19)
      expect(stats.critRate_).toApproximate(56.3)
      expect(stats.critDMG_).toApproximate(114.5)
      expect(stats.healing_).toApproximate(16.6)
    })

    describe("no crit", () => {
      beforeEach(() => setupStats.hitMode = "hit")

      test("hits", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(119)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(122)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(76 * 2)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(78 * 2)
        expect(formula.normal[4](stats)[0](stats)).toApproximate(199)
        expect(formula.charged.dmg(stats)[0](stats)).toApproximate(203)
        expect(formula.skill.hit(stats)[0](stats)).toApproximate(1285)
        expect(formula.skill.herald(stats)[0](stats)).toApproximate(482)
      })
    })

    describe("crit", () => {
      beforeEach(() => setupStats.hitMode = "critHit")

      test("hits", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(256)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(263)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(163 * 2)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(167 * 2)
        expect(formula.normal[4](stats)[0](stats)).toApproximate(427)
        expect(formula.charged.dmg(stats)[0](stats)).toApproximate(436)
        expect(formula.skill.hit(stats)[0](stats)).toApproximate(2757)
        expect(formula.skill.herald(stats)[0](stats)).toApproximate(1034)
      })
    })

    describe("C2", () => {
      beforeEach(() => {
        setupStats.normal_dmg_ += 15
        setupStats.charged_dmg_ += 15
      })

      describe("no crit", () => {
        beforeEach(() => setupStats.hitMode = "hit")

        test("hits", () => {
          const stats = computeAllStats(setupStats)
          expect(formula.normal[0](stats)[0](stats)).toApproximate(137)
          expect(formula.normal[1](stats)[0](stats)).toApproximate(141)
          expect(formula.normal[2](stats)[0](stats)).toApproximate(87 * 2)
          expect(formula.normal[3](stats)[0](stats)).toApproximate(89 * 2)
          expect(formula.normal[4](stats)[0](stats)).toApproximate(229)
          expect(formula.charged.dmg(stats)[0](stats)).toApproximate(233)
          expect(formula.skill.hit(stats)[0](stats)).toApproximate(1285)
          expect(formula.skill.herald(stats)[0](stats)).toApproximate(482)
        })
      })

      describe("crit", () => {
        beforeEach(() => setupStats.hitMode = "critHit")

        test("hits", () => {
          const stats = computeAllStats(setupStats)
          expect(formula.normal[0](stats)[0](stats)).toApproximate(294)
          expect(formula.normal[1](stats)[0](stats)).toApproximate(303)
          expect(formula.normal[2](stats)[0](stats)).toApproximate(188 * 2)
          expect(formula.normal[3](stats)[0](stats)).toApproximate(192 * 2)
          expect(formula.normal[4](stats)[0](stats)).toApproximate(491)
          expect(formula.charged.dmg(stats)[0](stats)).toApproximate(501)
          expect(formula.skill.hit(stats)[0](stats)).toApproximate(2757)
          expect(formula.skill.herald(stats)[0](stats)).toApproximate(1034)
          expect(formula.burst.dmg(stats)[0](stats)).toApproximate(9934)
        })
      })
    })
  })
})
