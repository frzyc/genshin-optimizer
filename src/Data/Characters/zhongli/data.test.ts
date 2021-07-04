import { applyArtifacts, computeAllStats, createProxiedStats } from "../TestUtils";
import formula from "./data";

let setupStats

// Discord ID: 249928411441659905
describe("Testing Zhongli's Formulas (ZyrenLe#5042)", () => {
  beforeEach(() => {
    setupStats = createProxiedStats({
      characterHP: 14695, characterATK: 251, characterDEF: 738, critRate_: 5,
      characterLevel: 90, characterEle: "geo",
      weaponATK: 23, weaponType: "polearm",
      enemyLevel: 93,

      geo_dmg_: 28.8, burst_dmg_: 20,

      tlvl: Object.freeze({ auto: 6 - 1, skill: 7 - 1, burst: 8 - 1, }),
    })
  })

  describe("with artifacts", () => {
    beforeEach(() => applyArtifacts(setupStats, [
      { hp: 4780, def: 39, enerRech_: 14.9, critDMG_: 7.0, critRate_: 6.2 }, // Flower of Life
      { atk: 311, def: 39, enerRech_: 5.8, critRate_: 3.5, critDMG_: 35.7 }, // Plume of Death
      { atk_: 46.6, enerRech_: 12.3, critRate_: 6.2, hp_: 8.2, hp: 538 }, // Sand of Eon
      { hp_: 46.6, enerRech_: 23.3, atk_: 4.7, atk: 31, def: 23 }, // Goblet of Eonothem
      { critRate_: 31.1, hp: 209, critDMG_: 14, atk_: 12.8, hp_: 9.3 }, // Circlet of Logos
    ]))

    test("overall stats", () => {
      const stats = computeAllStats(setupStats)
      expect(stats.finalHP).toApproximate(14695 + 14945)
      expect(stats.finalATK).toApproximate(274 + 518)
      expect(stats.finalDEF).toApproximate(738 + 102)
      expect(stats.eleMas).toApproximate(0)
      expect(stats.critRate_).toApproximate(52.0)
      expect(stats.critDMG_).toApproximate(106.7)
      expect(stats.enerRech_).toApproximate(156.4)
      expect(stats.geo_dmg_).toApproximate(28.8)
    })

    describe("no crit", () => {
      beforeEach(() => setupStats.hitMode = "hit")

      test("hits", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal["0HP"](stats)[0](stats)).toApproximate(342)
        expect(formula.normal["1HP"](stats)[0](stats)).toApproximate(344)
        expect(formula.normal["2HP"](stats)[0](stats)).toApproximate(382)
        expect(formula.normal["3HP"](stats)[0](stats)).toApproximate(404)
        expect(formula.normal["4HP"](stats)[0](stats)).toApproximate(239)
        expect(formula.normal["5HP"](stats)[0](stats)).toApproximate(464)
        expect(formula.charged.dmgHP(stats)[0](stats)).toApproximate(754)
        expect(formula.plunging.highHP(stats)[0](stats)).toApproximate(1004)
        expect(formula.skill.steeleDMGHP(stats)[0](stats)).toApproximate(433)
        expect(formula.skill.resonanceDMGHP(stats)[0](stats)).toApproximate(542)
        expect(formula.skill.holdDMGHP(stats)[0](stats)).toApproximate(870)
      })

      describe("with jade shield", () => {
        beforeEach(() => {
          setupStats.geo_enemyRes_ -= 20
          setupStats.physical_enemyRes_ -= 20
        })

        test("hits", () => {
          const stats = computeAllStats(setupStats)
          expect(formula.burst.dmgHP(stats)[0](stats)).toApproximate(12635)
        })
      })
    })
    describe("with crit", () => {
      beforeEach(() => setupStats.hitMode = "critHit")

      test("hits", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal["0HP"](stats)[0](stats)).toApproximate(707)
        expect(formula.normal["1HP"](stats)[0](stats)).toApproximate(711)
        expect(formula.normal["2HP"](stats)[0](stats)).toApproximate(790)
        expect(formula.normal["3HP"](stats)[0](stats)).toApproximate(836)
        expect(formula.normal["4HP"](stats)[0](stats)).toApproximate(494)
        expect(formula.normal["5HP"](stats)[0](stats)).toApproximate(959)
        expect(formula.charged.dmgHP(stats)[0](stats)).toApproximate(1560)
        expect(formula.plunging.highHP(stats)[0](stats)).toApproximate(2077)
        expect(formula.skill.steeleDMGHP(stats)[0](stats)).toApproximate(895)
        expect(formula.skill.resonanceDMGHP(stats)[0](stats)).toApproximate(1121)
        expect(formula.skill.holdDMGHP(stats)[0](stats)).toApproximate(1799)
      })

      describe("with jade shield", () => {
        beforeEach(() => {
          setupStats.geo_enemyRes_ -= 20
          setupStats.physical_enemyRes_ -= 20
        })

        test("hits", () => {
          const stats = computeAllStats(setupStats)
          expect(formula.burst.dmgHP(stats)[0](stats)).toApproximate(26118)
        })
      })
    })
  })

  describe("without artifacts", () => {
    describe("no crit", () => {
      beforeEach(() => setupStats.hitMode = "hit")

      test("hits", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal["0HP"](stats)[0](stats)).toApproximate(145)
        expect(formula.normal["1HP"](stats)[0](stats)).toApproximate(146)
        expect(formula.normal["2HP"](stats)[0](stats)).toApproximate(159)
        expect(formula.normal["3HP"](stats)[0](stats)).toApproximate(167)
        expect(formula.normal["4HP"](stats)[0](stats)).toApproximate(110)
        expect(formula.normal["5HP"](stats)[0](stats)).toApproximate(188)
        expect(formula.charged.dmgHP(stats)[0](stats)).toApproximate(288)
        expect(formula.plunging.highHP(stats)[0](stats)).toApproximate(375)
        expect(formula.skill.steeleDMGHP(stats)[0](stats)).toApproximate(198)
        expect(formula.skill.resonanceDMGHP(stats)[0](stats)).toApproximate(236)
        expect(formula.skill.holdDMGHP(stats)[0](stats)).toApproximate(349)
        expect(formula.burst.dmgHP(stats)[0](stats)).toApproximate(4670)
      })

      describe("with jade shield", () => {
        beforeEach(() => {
          setupStats.geo_enemyRes_ -= 20
          setupStats.physical_enemyRes_ -= 20
        })

        test("hits", () => {
          const stats = computeAllStats(setupStats)
          expect(formula.normal["0HP"](stats)[0](stats)).toApproximate(170)
          expect(formula.normal["1HP"](stats)[0](stats)).toApproximate(171)
          expect(formula.normal["2HP"](stats)[0](stats)).toApproximate(186)
          expect(formula.normal["3HP"](stats)[0](stats)).toApproximate(195)
          expect(formula.normal["4HP"](stats)[0](stats)).toApproximate(128)
          expect(formula.normal["5HP"](stats)[0](stats)).toApproximate(219)
          expect(formula.charged.dmgHP(stats)[0](stats)).toApproximate(337)
          expect(formula.plunging.highHP(stats)[0](stats)).toApproximate(438)
          expect(formula.skill.steeleDMGHP(stats)[0](stats)).toApproximate(231)
          expect(formula.skill.resonanceDMGHP(stats)[0](stats)).toApproximate(275)
          expect(formula.skill.holdDMGHP(stats)[0](stats)).toApproximate(408)
        })
      })
    })
    describe("with crit", () => {
      beforeEach(() => setupStats.hitMode = "critHit")

      test("hits", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal["2HP"](stats)[0](stats)).toApproximate(239)
        expect(formula.charged.dmgHP(stats)[0](stats)).toApproximate(433)
      })

      describe("with jade shield", () => {
        beforeEach(() => {
          setupStats.geo_enemyRes_ -= 20
          setupStats.physical_enemyRes_ -= 20
        })

        test("hits", () => {
          const stats = computeAllStats(setupStats)
          expect(formula.normal["3HP"](stats)[0](stats)).toApproximate(293)
          expect(formula.normal["2HP"](stats)[0](stats)).toApproximate(279)
          expect(formula.charged.dmgHP(stats)[0](stats)).toApproximate(505)
        })
      })
    })
  })
})
