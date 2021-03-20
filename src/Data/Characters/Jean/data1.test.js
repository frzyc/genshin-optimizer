import { PreprocessFormulas } from "../../../StatData"
import { GetDependencies } from "../../../StatDependency"
import { applyArtifacts, createProxiedStats } from "../TestUtils"
import formula from "./data"

// Discord ID: 822256929929822248
// Discord Handle: sohum#5921
const baseStats = {
  characterHP: 9533, characterATK: 155, characterDEF: 499,
  characterEle: "anemo", characterLevel: 60,
  weaponType: "sword", weaponATK: 347,

  heal_: 11.1, enerRech_: 100 + 50.5,
  enemyLevel: 85, physical_enemyRes_: 70, // Ruin Guard

  talentLevelKeys: Object.freeze({ auto: 1 - 1, skill: 1 - 1, burst: 1 - 1 }),
}
const artifacts = [
  { hp: 3967, atk_: 9.3, atk: 16, critDMG_: 13.2, hp_: 10.5,  }, // Flower of Life
  { atk: 258, critDMG_: 7, def: 81, critRate_: 3.9, hp: 239,  }, // Plume of Death
  { enerRech_: 29.8, critDMG_: 6.2, hp: 209, eleMas: 19, atk: 16 }, // Sands of Eon
  { anemo_dmg_: 30.8, hp: 448, eleMas: 40, critRate_: 3.9, def: 21 }, // Goblet of Eonothem
  { critRate_: 25.8, hp: 478, critDMG_: 7, atk_: 13.4, atk: 35, }, // Circlet of Logos
  { eleMas: 80 }, // 2 Wanderer's Troupe
]

let setupStats, stats = {}
beforeEach(() => {
  stats = { ...setupStats } // This is fine so long as we don't mutate `modifier` or `talentLevelKeys`
  PreprocessFormulas(GetDependencies(stats.modifiers), stats).formula(stats)
})

describe("Testing Jean's Formulas", () => {
  describe("with artifacts", () => {
    beforeAll(() => {
      setupStats = createProxiedStats(baseStats)
      applyArtifacts(setupStats, artifacts)
    })
    afterAll(() => setupStats = undefined)

    test("heal", () => {
      const { burst } = stats.talentLevelKeys
      expect(formula.burst.regen(burst, stats)[0](stats)).toApproximate(433)
    })
    test("reactions", () => {
      expect(stats.cryo_swirl_hit).toApproximate(423)
    })
    describe("no crit", () => {
      beforeAll(() => setupStats.hitMode = "hit")
      afterAll(() => delete setupStats.hitMode)

      test("hit", () => {
        const { auto, skill, burst } = stats.talentLevelKeys
        expect(formula.normal[0](auto, stats)[0](stats)).toApproximate(63)
        expect(formula.normal[1](auto, stats)[0](stats)).toApproximate(59)
        expect(formula.normal[2](auto, stats)[0](stats)).toApproximate(78)
        expect(formula.normal[3](auto, stats)[0](stats)).toApproximate(86)
        expect(formula.normal[4](auto, stats)[0](stats)).toApproximate(103)
        expect(formula.charged.dmg(auto, stats)[0](stats)).toApproximate(211)
        expect(formula.skill.dmg(skill, stats)[0](stats)).toApproximate(1498)
        expect(formula.burst.skill(burst, stats)[0](stats)).toApproximate(2180)
        expect(formula.burst.field_dmg(burst, stats)[0](stats)).toApproximate(402)
      })
    })

    describe("crit", () => {
      beforeAll(() => setupStats.hitMode = "critHit")
      afterAll(() => delete setupStats.hitMode)

      test("hit", () => {
        const { auto, skill, burst } = stats.talentLevelKeys
        expect(formula.normal[0](auto, stats)[0](stats)).toApproximate(115)
        expect(formula.normal[1](auto, stats)[0](stats)).toApproximate(109)
        expect(formula.normal[2](auto, stats)[0](stats)).toApproximate(144)
        expect(formula.normal[4](auto, stats)[0](stats)).toApproximate(189)
        expect(formula.skill.dmg(skill, stats)[0](stats)).toApproximate(2748)
        expect(formula.burst.skill(burst, stats)[0](stats)).toApproximate(3998)
        expect(formula.burst.field_dmg(burst, stats)[0](stats)).toApproximate(737)
      })
    })
  })
})
