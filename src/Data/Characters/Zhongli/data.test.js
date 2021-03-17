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

let stats, currentStats = {}
describe("Testing Zhongli's Formulas", () => {
  beforeEach(() => {
    currentStats = { ...stats } // This is fine so long as we don't mutate `modifier` or `talentLevelKeys`
    PreprocessFormulas(GetDependencies(currentStats.modifiers), currentStats).formula(currentStats)
  })

  describe("without artifacts", () => {
    beforeAll(() => { stats = createProxiedStats(baseStats) })
    afterAll(() => stats = undefined)

    // No arti, no crit, no jade shield
    describe("no crit", () => {
      beforeAll(() => stats.hitMode = "hit")
      afterAll(() => delete stats.hitMode)

      test("hits", () => {
        const { auto, skill, burst } = currentStats.talentLevelKeys
        expect(formula.normal["0HP"](auto, currentStats)[0](currentStats)).toApproximate(145)
        expect(formula.normal["1HP"](auto, currentStats)[0](currentStats)).toApproximate(146)
        expect(formula.normal["2HP"](auto, currentStats)[0](currentStats)).toApproximate(159)
        expect(formula.normal["3HP"](auto, currentStats)[0](currentStats)).toApproximate(167)
        expect(formula.normal["4HP"](auto, currentStats)[0](currentStats)).toApproximate(4*110)
        expect(formula.normal["5HP"](auto, currentStats)[0](currentStats)).toApproximate(188)
        expect(formula.charged.dmgHP(auto, currentStats)[0](currentStats)).toApproximate(288)
        expect(formula.plunging.highHP(auto, currentStats)[0](currentStats)).toApproximate(375)
        expect(formula.skill.steeleDMGHP(skill, currentStats)[0](currentStats)).toApproximate(198)
        expect(formula.skill.resonanceDMGHP(skill, currentStats)[0](currentStats)).toApproximate(236)
        expect(formula.skill.holdDMGHP(skill, currentStats)[0](currentStats)).toApproximate(349)
        expect(formula.burst.dmgHP(burst, currentStats)[0](currentStats)).toApproximate(4670)
      })

      describe("with jade shield", () => {
        beforeAll(() => {
          stats.geo_enemyRes_ -= 20
          stats.physical_enemyRes_ -= 20
        })
        afterAll(() => {
          stats.geo_enemyRes_ += 20
          stats.physical_enemyRes_ += 20
        })

        test("hits", () => {    
          const { auto, skill } = currentStats.talentLevelKeys
          expect(formula.normal["0HP"](auto, currentStats)[0](currentStats)).toApproximate(170)
          expect(formula.normal["1HP"](auto, currentStats)[0](currentStats)).toApproximate(171)
          expect(formula.normal["2HP"](auto, currentStats)[0](currentStats)).toApproximate(186)
          expect(formula.normal["3HP"](auto, currentStats)[0](currentStats)).toApproximate(195)
          expect(formula.normal["4HP"](auto, currentStats)[0](currentStats)).toApproximate(4*128)
          expect(formula.normal["5HP"](auto, currentStats)[0](currentStats)).toApproximate(219)
          expect(formula.charged.dmgHP(auto, currentStats)[0](currentStats)).toApproximate(337)
          expect(formula.plunging.highHP(auto, currentStats)[0](currentStats)).toApproximate(438)
          expect(formula.skill.steeleDMGHP(skill, currentStats)[0](currentStats)).toApproximate(231)
          expect(formula.skill.resonanceDMGHP(skill, currentStats)[0](currentStats)).toApproximate(275)
          expect(formula.skill.holdDMGHP(skill, currentStats)[0](currentStats)).toApproximate(408)
        })
      })
    })
    describe("with crit", () => {
      beforeAll(() => stats.hitMode = "critHit")
      afterAll(() => delete stats.hitMode)

      test("hits", () => {
        const { auto } = currentStats.talentLevelKeys
        expect(formula.normal["2HP"](auto, currentStats)[0](currentStats)).toApproximate(239)
        expect(formula.charged.dmgHP(auto, currentStats)[0](currentStats)).toApproximate(433)
      })

      describe("with jade shield", () => {
        beforeAll(() => {
          stats.geo_enemyRes_ -= 20
          stats.physical_enemyRes_ -= 20
        })
        afterAll(() => {
          stats.geo_enemyRes_ += 20
          stats.physical_enemyRes_ += 20
        })

        test("hits", () => {
          const { auto } = currentStats.talentLevelKeys
          expect(formula.normal["3HP"](auto, currentStats)[0](currentStats)).toApproximate(293)
          expect(formula.normal["2HP"](auto, currentStats)[0](currentStats)).toApproximate(279)
          expect(formula.charged.dmgHP(auto, currentStats)[0](currentStats)).toApproximate(505)
        })
      })
    })
  })
  describe("with artifacts", () => {
    beforeAll(() => {
      stats = createProxiedStats(baseStats)
      applyArtifacts(stats, artifacts)
    })
    afterAll(() => stats = undefined)

    test("overall stats", () => {
      expect(currentStats.finalHP).toApproximate(14695 + 14945)
      expect(currentStats.finalATK).toApproximate(274 + 518)
      expect(currentStats.finalDEF).toApproximate(738 + 102)
      expect(currentStats.eleMas).toApproximate(0)
      expect(currentStats.critRate_).toApproximate(52.0)
      expect(currentStats.critDMG_).toApproximate(106.7)
      expect(currentStats.enerRech_).toApproximate(156.4)
      expect(currentStats.geo_dmg_).toApproximate(28.8)  
    })

    describe("no crit", () => {
      beforeAll(() => stats.hitMode = "hit")
      afterAll(() => delete stats.hitMode)

      test("hits", () => {
        const { auto, skill } = currentStats.talentLevelKeys
        expect(formula.normal["0HP"](auto, currentStats)[0](currentStats)).toApproximate(342)
        expect(formula.normal["1HP"](auto, currentStats)[0](currentStats)).toApproximate(344)
        expect(formula.normal["2HP"](auto, currentStats)[0](currentStats)).toApproximate(382)
        expect(formula.normal["3HP"](auto, currentStats)[0](currentStats)).toApproximate(404)
        expect(formula.normal["4HP"](auto, currentStats)[0](currentStats)).toApproximate(4*239)
        expect(formula.normal["5HP"](auto, currentStats)[0](currentStats)).toApproximate(464)
        expect(formula.charged.dmgHP(auto, currentStats)[0](currentStats)).toApproximate(754)
        expect(formula.plunging.highHP(auto, currentStats)[0](currentStats)).toApproximate(1004)
        expect(formula.skill.steeleDMGHP(skill, currentStats)[0](currentStats)).toApproximate(433)
        expect(formula.skill.resonanceDMGHP(skill, currentStats)[0](currentStats)).toApproximate(542)
        expect(formula.skill.holdDMGHP(skill, currentStats)[0](currentStats)).toApproximate(870)
      })

      describe("with jade shield", () => {
        beforeAll(() => {
          stats.geo_enemyRes_ -= 20
          stats.physical_enemyRes_ -= 20
        })
        afterAll(() => {
          stats.geo_enemyRes_ += 20
          stats.physical_enemyRes_ += 20
        })

        test("hits", () => {
          const { burst } = currentStats.talentLevelKeys
          expect(formula.burst.dmgHP(burst, currentStats)[0](currentStats)).toApproximate(12635)
        })
      })  
    })
    describe("with crit", () => {
      beforeAll(() => stats.hitMode = "critHit")
      afterAll(() => delete stats.hitMode)
      
      test("hits", () => {  
        const { auto, skill } = currentStats.talentLevelKeys
        expect(formula.normal["0HP"](auto, currentStats)[0](currentStats)).toApproximate(707)
        expect(formula.normal["1HP"](auto, currentStats)[0](currentStats)).toApproximate(711)
        expect(formula.normal["2HP"](auto, currentStats)[0](currentStats)).toApproximate(790)
        expect(formula.normal["3HP"](auto, currentStats)[0](currentStats)).toApproximate(836)
        expect(formula.normal["4HP"](auto, currentStats)[0](currentStats)).toApproximate(4*494)
        expect(formula.normal["5HP"](auto, currentStats)[0](currentStats)).toApproximate(959)
        expect(formula.charged.dmgHP(auto, currentStats)[0](currentStats)).toApproximate(1560)
        expect(formula.plunging.highHP(auto, currentStats)[0](currentStats)).toApproximate(2077)
        expect(formula.skill.steeleDMGHP(skill, currentStats)[0](currentStats)).toApproximate(895)
        expect(formula.skill.resonanceDMGHP(skill, currentStats)[0](currentStats)).toApproximate(1121)
        expect(formula.skill.holdDMGHP(skill, currentStats)[0](currentStats)).toApproximate(1799)
      })
  
      describe("with jade shield", () => {
        beforeAll(() => {
          stats.geo_enemyRes_ -= 20
          stats.physical_enemyRes_ -= 20
        })
        afterAll(() => {
          stats.geo_enemyRes_ += 20
          stats.physical_enemyRes_ += 20
        })

        test("hits", () => {
          const { burst } = currentStats.talentLevelKeys
          expect(formula.burst.dmgHP(burst, currentStats)[0](currentStats)).toApproximate(26118)
        })
      })
    })
  })
})
