import { PreprocessFormulas } from "../../../StatData";
import { GetDependencies } from "../../../StatDependency";
import { applyArtifacts, createProxiedStats } from "../TestUtils";
import formula from "./data";

// Discord ID: 249928411441659905
// Discord Handle: ZyrenLe#5042
const baseStats = {
  characterHP: 14695, characterATK: 251, characterDEF: 738, critRate_: 5,
  characterLevel: 90, characterEle: "geo",
  weaponATK: 23, weaponType: "polearm",
  enemyLevel: 93,
  
  geo_dmg_: 28.8, burst_dmg_: 20,
  
  talentLevelKeys: Object.freeze({ auto: 6 - 1, skill: 7 - 1, burst: 8 - 1, }),
}
const artifacts = [
  { hp: 4780, def: 39, enerRech_: 14.9, critDMG_: 7.0, critRate_: 6.2 }, // Flower of Life
  { atk: 311, def: 39, enerRech_: 5.8, critRate_: 3.5, critDMG_: 35.7 }, // Plume of Death
  { atk_: 46.6, enerRech_: 12.3, critRate_: 6.2, hp_: 8.2, hp: 538 }, // Sand of Eon
  { hp_: 46.6, enerRech_: 23.3, atk_: 4.7, atk: 31, def: 23 }, // Goblet of Eonothem
  { critRate_: 31.1, hp: 209, critDMG_: 14, atk_: 12.8, hp_: 9.3 }, // Circlet of Logos
]

let setupStats, stats = {}
describe("Testing Zhongli's Formulas", () => {
  beforeEach(() => {
    stats = { ...setupStats } // This is fine so long as we don't mutate `modifier` or `talentLevelKeys`
    PreprocessFormulas(GetDependencies(stats.modifiers), stats).formula(stats)
  })

  describe("without artifacts", () => {
    beforeAll(() => { setupStats = createProxiedStats(baseStats) })
    afterAll(() => setupStats = undefined)

    // No arti, no crit, no jade shield
    describe("no crit", () => {
      beforeAll(() => setupStats.hitMode = "hit")
      afterAll(() => delete setupStats.hitMode)

      test("hits", () => {
        const { auto, skill, burst } = stats.talentLevelKeys
        expect(formula.normal["0HP"](auto, stats)[0](stats)).toApproximate(145)
        expect(formula.normal["1HP"](auto, stats)[0](stats)).toApproximate(146)
        expect(formula.normal["2HP"](auto, stats)[0](stats)).toApproximate(159)
        expect(formula.normal["3HP"](auto, stats)[0](stats)).toApproximate(167)
        expect(formula.normal["4HP"](auto, stats)[0](stats)).toApproximate(4*110)
        expect(formula.normal["5HP"](auto, stats)[0](stats)).toApproximate(188)
        expect(formula.charged.dmgHP(auto, stats)[0](stats)).toApproximate(288)
        expect(formula.plunging.highHP(auto, stats)[0](stats)).toApproximate(375)
        expect(formula.skill.steeleDMGHP(skill, stats)[0](stats)).toApproximate(198)
        expect(formula.skill.resonanceDMGHP(skill, stats)[0](stats)).toApproximate(236)
        expect(formula.skill.holdDMGHP(skill, stats)[0](stats)).toApproximate(349)
        expect(formula.burst.dmgHP(burst, stats)[0](stats)).toApproximate(4670)
      })

      describe("with jade shield", () => {
        beforeAll(() => {
          setupStats.geo_enemyRes_ -= 20
          setupStats.physical_enemyRes_ -= 20
        })
        afterAll(() => {
          setupStats.geo_enemyRes_ += 20
          setupStats.physical_enemyRes_ += 20
        })

        test("hits", () => {    
          const { auto, skill } = stats.talentLevelKeys
          expect(formula.normal["0HP"](auto, stats)[0](stats)).toApproximate(170)
          expect(formula.normal["1HP"](auto, stats)[0](stats)).toApproximate(171)
          expect(formula.normal["2HP"](auto, stats)[0](stats)).toApproximate(186)
          expect(formula.normal["3HP"](auto, stats)[0](stats)).toApproximate(195)
          expect(formula.normal["4HP"](auto, stats)[0](stats)).toApproximate(4*128)
          expect(formula.normal["5HP"](auto, stats)[0](stats)).toApproximate(219)
          expect(formula.charged.dmgHP(auto, stats)[0](stats)).toApproximate(337)
          expect(formula.plunging.highHP(auto, stats)[0](stats)).toApproximate(438)
          expect(formula.skill.steeleDMGHP(skill, stats)[0](stats)).toApproximate(231)
          expect(formula.skill.resonanceDMGHP(skill, stats)[0](stats)).toApproximate(275)
          expect(formula.skill.holdDMGHP(skill, stats)[0](stats)).toApproximate(408)
        })
      })
    })
    describe("with crit", () => {
      beforeAll(() => setupStats.hitMode = "critHit")
      afterAll(() => delete setupStats.hitMode)

      test("hits", () => {
        const { auto } = stats.talentLevelKeys
        expect(formula.normal["2HP"](auto, stats)[0](stats)).toApproximate(239)
        expect(formula.charged.dmgHP(auto, stats)[0](stats)).toApproximate(433)
      })

      describe("with jade shield", () => {
        beforeAll(() => {
          setupStats.geo_enemyRes_ -= 20
          setupStats.physical_enemyRes_ -= 20
        })
        afterAll(() => {
          setupStats.geo_enemyRes_ += 20
          setupStats.physical_enemyRes_ += 20
        })

        test("hits", () => {
          const { auto } = stats.talentLevelKeys
          expect(formula.normal["3HP"](auto, stats)[0](stats)).toApproximate(293)
          expect(formula.normal["2HP"](auto, stats)[0](stats)).toApproximate(279)
          expect(formula.charged.dmgHP(auto, stats)[0](stats)).toApproximate(505)
        })
      })
    })
  })
  describe("with artifacts", () => {
    beforeAll(() => {
      setupStats = createProxiedStats(baseStats)
      applyArtifacts(setupStats, artifacts)
    })
    afterAll(() => setupStats = undefined)

    test("overall stats", () => {
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
      beforeAll(() => setupStats.hitMode = "hit")
      afterAll(() => delete setupStats.hitMode)

      test("hits", () => {
        const { auto, skill } = stats.talentLevelKeys
        expect(formula.normal["0HP"](auto, stats)[0](stats)).toApproximate(342)
        expect(formula.normal["1HP"](auto, stats)[0](stats)).toApproximate(344)
        expect(formula.normal["2HP"](auto, stats)[0](stats)).toApproximate(382)
        expect(formula.normal["3HP"](auto, stats)[0](stats)).toApproximate(404)
        expect(formula.normal["4HP"](auto, stats)[0](stats)).toApproximate(4*239)
        expect(formula.normal["5HP"](auto, stats)[0](stats)).toApproximate(464)
        expect(formula.charged.dmgHP(auto, stats)[0](stats)).toApproximate(754)
        expect(formula.plunging.highHP(auto, stats)[0](stats)).toApproximate(1004)
        expect(formula.skill.steeleDMGHP(skill, stats)[0](stats)).toApproximate(433)
        expect(formula.skill.resonanceDMGHP(skill, stats)[0](stats)).toApproximate(542)
        expect(formula.skill.holdDMGHP(skill, stats)[0](stats)).toApproximate(870)
      })

      describe("with jade shield", () => {
        beforeAll(() => {
          setupStats.geo_enemyRes_ -= 20
          setupStats.physical_enemyRes_ -= 20
        })
        afterAll(() => {
          setupStats.geo_enemyRes_ += 20
          setupStats.physical_enemyRes_ += 20
        })

        test("hits", () => {
          const { burst } = stats.talentLevelKeys
          expect(formula.burst.dmgHP(burst, stats)[0](stats)).toApproximate(12635)
        })
      })  
    })
    describe("with crit", () => {
      beforeAll(() => setupStats.hitMode = "critHit")
      afterAll(() => delete setupStats.hitMode)
      
      test("hits", () => {  
        const { auto, skill } = stats.talentLevelKeys
        expect(formula.normal["0HP"](auto, stats)[0](stats)).toApproximate(707)
        expect(formula.normal["1HP"](auto, stats)[0](stats)).toApproximate(711)
        expect(formula.normal["2HP"](auto, stats)[0](stats)).toApproximate(790)
        expect(formula.normal["3HP"](auto, stats)[0](stats)).toApproximate(836)
        expect(formula.normal["4HP"](auto, stats)[0](stats)).toApproximate(4*494)
        expect(formula.normal["5HP"](auto, stats)[0](stats)).toApproximate(959)
        expect(formula.charged.dmgHP(auto, stats)[0](stats)).toApproximate(1560)
        expect(formula.plunging.highHP(auto, stats)[0](stats)).toApproximate(2077)
        expect(formula.skill.steeleDMGHP(skill, stats)[0](stats)).toApproximate(895)
        expect(formula.skill.resonanceDMGHP(skill, stats)[0](stats)).toApproximate(1121)
        expect(formula.skill.holdDMGHP(skill, stats)[0](stats)).toApproximate(1799)
      })
  
      describe("with jade shield", () => {
        beforeAll(() => {
          setupStats.geo_enemyRes_ -= 20
          setupStats.physical_enemyRes_ -= 20
        })
        afterAll(() => {
          setupStats.geo_enemyRes_ += 20
          setupStats.physical_enemyRes_ += 20
        })

        test("hits", () => {
          const { burst } = stats.talentLevelKeys
          expect(formula.burst.dmgHP(burst, stats)[0](stats)).toApproximate(26118)
        })
      })
    })
  })
})
