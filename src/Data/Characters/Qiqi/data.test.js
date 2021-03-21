import formula from "./data"
import { applyArtifacts, createProxiedStats } from "../TestUtils"
import { PreprocessFormulas } from "../../../StatData"
import { GetDependencies } from "../../../StatDependency"

let setupStats, stats = {}

// Discord ID: 822861794544582686
// Discord Handle: Camelva#7085
const baseStat = {
  characterHP: 10050, characterATK: 580 - 347, characterDEF: 749,
  characterEle: "cryo", characterLevel: 70,
  weaponType: "sword", weaponATK: 347,
  
  heal_: 16.6,

  enemyLevel: 92, physical_enemyRes_: 70, // Ruin Guard
  
  talentLevelKeys: Object.freeze({ auto: 1 - 1, skill: 5 - 1, burst: 6 - 1 }),
}
const artifacts = [
  { hp: 3967, critDMG_: 14.0, eleMas: 21, critRate_: 9.3, atk: 19, }, // Flower of Life
  { atk: 311, critRate_: 7.8, def: 53, atk_: 11.7, enerRech_: 4.5 }, // Plume of Death
  { atk_: 38.7, eleMas: 56, def: 42, hp_: 4.7, enerRech_: 6.5, }, // Sands of Eon
  { physical_dmg_: 58.3, enerRech_: 11.0, critRate_: 7.4, eleMas: 40, atk: 53, }, // Goblet of Eonothem
  { hp_: 7, atk_: 5.3, critDMG_: 7.0, enerRech_: 5.2, atk: 18, }, // Circlet of Logos
  { atk_: 18 }, // 2 Gladiator's Finale
]

describe("Test Qiqi's formulas", () => {
  beforeEach(() => {
    stats = { ...setupStats } // This is fine so long as we don't mutate `modifier` or `talentLevelKeys`
    PreprocessFormulas(GetDependencies(stats.modifiers), stats).formula(stats)
  })

  describe("with artifacts", () => {
    beforeAll(() => {
      setupStats = createProxiedStats(baseStat)
      applyArtifacts(setupStats, artifacts)
    })
    afterAll(() => setupStats = undefined)

    test("overall stats", () => {
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
      beforeAll(() => setupStats.hitMode = "hit")
      afterAll(() => delete setupStats.hitMode)

      test("hits", () => {
        const { auto, skill, burst } = stats.talentLevelKeys
        expect(formula.normal[0](auto, stats)[0](stats)).toApproximate(118)
        expect(formula.normal[1](auto, stats)[0](stats)).toApproximate(121)
        expect(formula.normal[2](auto, stats)[0](stats)).toApproximate(75 * 2)
        expect(formula.normal[3](auto, stats)[0](stats)).toApproximate(77 * 2)
        expect(formula.normal[4](auto, stats)[0](stats)).toApproximate(197)
        expect(formula.charged.hit(auto, stats)[0](stats)).toApproximate(201)
        expect(formula.skill.hit(skill, stats)[0](stats)).toApproximate(756)
        expect(formula.skill.herald(skill, stats)[0](stats)).toApproximate(283)
        expect(formula.skill.hitregen(skill, stats)[0](stats)).toApproximate(343)
        expect(formula.skill.continuousregen(skill, stats)[0](stats)).toApproximate(2275)
        expect(formula.burst.dmg(burst, stats)[0](stats)).toApproximate(2371)
        expect(formula.burst.healing(burst, stats)[0](stats)).toApproximate(3133)
      })
    })

    describe("crit", () => {
      beforeAll(() => setupStats.hitMode = "critHit")
      afterAll(() => delete setupStats.hitMode)

      test("hits", () => {
        const { auto, skill } = stats.talentLevelKeys
        expect(formula.normal[0](auto, stats)[0](stats)).toApproximate(202)
        expect(formula.normal[1](auto, stats)[0](stats)).toApproximate(208)
        expect(formula.normal[2](auto, stats)[0](stats)).toApproximate(129 * 2)
        expect(formula.normal[3](auto, stats)[0](stats)).toApproximate(132 * 2)
        expect(formula.normal[4](auto, stats)[0](stats)).toApproximate(338)
        expect(formula.charged.hit(auto, stats)[0](stats)).toApproximate(345)
        expect(formula.skill.hit(skill, stats)[0](stats)).toApproximate(1293)
        expect(formula.skill.herald(skill, stats)[0](stats)).toApproximate(485)
      })
    })
  })
})