import { PreprocessFormulas } from "../../../StatData"
import { GetDependencies } from "../../../StatDependency"
import { applyArtifacts, createProxiedStats } from "../TestUtils"
import formula from "./data"

// Discord ID: 822274940547629077
// Discord Handle: firedragon2508#8862
const baseStats = {
  characterHP: 8192, characterATK: 151, characterDEF: 623,
  characterEle: "anemo", characterLevel: 80,
  weaponType: "catalyst", weaponATK: 448,
  
  anemo_dmg_: 18, critDMG_: 50 + 50.3,
  
  talentLevelKeys: Object.freeze({ auto: 6 - 1, skill: 9 - 1, burst: 10 - 1 }),
}
const artifacts = [
  { hp: 4171, atk_: 17.5, def_: 5.8, eleMas: 23, enerRech_: 10.4 }, // Flower of Life
  { atk: 311, hp: 986, critRate_: 7, eleMas: 21, enerRech_: 6.5 }, // Plume of Death
  { eleMas: 155, atk_: 9.3, atk: 53, critDMG_: 7.8, hp: 239 }, // Sands of Eon
  { anemo_dmg_: 46.6, atk: 27, def: 35, atk_: 4.5, hp: 657 }, // Goblet of Eonothem
  { atk_: 46.6, critDMG_: 5.4, def: 21, enerRech_: 22.0, critRate_: 5.8 }, // Circlet of Logos
  { anemo_dmg_: 15, swirl_dmg_: 60 }, // Viridescent Venerer 4 Pieces Set
]

let setupStats, stats = {}
describe("Testing Sucrose's Formulas with artifacts", () => {
  beforeEach(() => {
    stats = { ...setupStats } // This is fine so long as we don't mutate `modifier` or `talentLevelKeys`
    PreprocessFormulas(GetDependencies(stats.modifiers), stats).formula(stats)
  })

  describe("without artifacts", () => {
    beforeAll(() => { setupStats = createProxiedStats(baseStats) })
    afterAll(() => setupStats = undefined)

    test("reaction", () => {
      expect(stats.pyro_swirl_hit).toApproximate(511)
    })  

    describe("no crit", () => {
      beforeAll(() => setupStats.hitMode = "hit")
      afterAll(() => delete setupStats.hitMode)
  
      describe("Ruin Guard lvl 85", () => {
        beforeAll(() => setupStats.enemyLevel = 85)
        afterAll(() => delete setupStats.enemyLevel)
  
        test("hits", () => {
          const { auto, skill, burst } = stats.talentLevelKeys
          expect(formula.normal[0](auto, stats)[0](stats)).toApproximate(147)
          expect(formula.normal[1](auto, stats)[0](stats)).toApproximate(134)
          expect(formula.normal[2](auto, stats)[0](stats)).toApproximate(168)
          expect(formula.normal[3](auto, stats)[0](stats)).toApproximate(210)
          expect(formula.charged.hit(auto, stats)[0](stats)).toApproximate(527)
          expect(formula.skill.press(skill, stats)[0](stats)).toApproximate(1126)
          expect(formula.burst.dot(burst, stats)[0](stats)).toApproximate(836)
        })
      })
      describe("Electro Hypostasis lvl 93", () => {
        beforeAll(() => setupStats.enemyLevel = 85)
        afterAll(() => delete setupStats.enemyLevel)
  
        test("hits", () => {
          const { auto, skill, burst } = stats.talentLevelKeys
          expect(formula.normal[0](auto, stats)[0](stats)).toApproximate(145)
          expect(formula.normal[1](auto, stats)[0](stats)).toApproximate(132)
          expect(formula.normal[2](auto, stats)[0](stats)).toApproximate(166)
          expect(formula.normal[3](auto, stats)[0](stats)).toApproximate(207)
          expect(formula.charged.hit(auto, stats)[0](stats)).toApproximate(520)
          expect(formula.skill.press(skill, stats)[0](stats)).toApproximate(1111)
          expect(formula.burst.dot(burst, stats)[0](stats)).toApproximate(824)
        })
      })
    })  
  })

  describe("with artifacts", () => {
    beforeAll(() => {
      setupStats = createProxiedStats(baseStats)
      applyArtifacts(setupStats, artifacts)
    })
    afterAll(() => {
      setupStats = undefined
    })
    
    test("overall stats", () => {
      expect(stats.finalHP).toApproximate(14245)
      expect(stats.finalATK).toApproximate(1458)
      expect(stats.finalDEF).toApproximate(715)
      expect(stats.eleMas).toApproximate(199)
      expect(stats.critRate_).toApproximate(17.8)
      expect(stats.critDMG_).toApproximate(113.50)
      expect(stats.enerRech_).toApproximate(138.9)
      expect(stats.anemo_dmg_).toApproximate(79.6)
    })

    describe("no crit", () => {
      beforeAll(() => setupStats.hitMode = "hit")
      afterAll(() => delete setupStats.hitMode)
  
      describe("Electro Hypostasis lvl 93", () => {
        beforeAll(() => setupStats.enemyLevel = 93)
        afterAll(() => delete setupStats.enemyLevel)
  
        test("hits", () => {
          const { auto, skill, burst } = stats.talentLevelKeys
          expect(formula.normal[0](auto, stats)[0](stats)).toApproximate(532)
          expect(formula.normal[1](auto, stats)[0](stats)).toApproximate(487)
          expect(formula.normal[2](auto, stats)[0](stats)).toApproximate(612)
          expect(formula.normal[3](auto, stats)[0](stats)).toApproximate(762)
          expect(formula.charged.hit(auto, stats)[0](stats)).toApproximate(1913)
          expect(formula.skill.press(skill, stats)[0](stats)).toApproximate(4082)
          expect(formula.burst.dot(burst, stats)[0](stats)).toApproximate(3029)
        })
      })

      describe("Hilichurl lvl 86", () => {
        beforeAll(() => setupStats.enemyLevel = 86)
        afterAll(() => delete setupStats.enemyLevel)
  
        test("hits", () => {
          const { auto, skill, burst } = stats.talentLevelKeys
          expect(formula.normal[0](auto, stats)[0](stats)).toApproximate(545)
          expect(formula.normal[1](auto, stats)[0](stats)).toApproximate(499)
          expect(formula.normal[2](auto, stats)[0](stats)).toApproximate(627)
          expect(formula.normal[3](auto, stats)[0](stats)).toApproximate(781)
          expect(formula.charged.hit(auto, stats)[0](stats)).toApproximate(1960)
          expect(formula.skill.press(skill, stats)[0](stats)).toApproximate(4183)
          expect(formula.burst.dot(burst, stats)[0](stats)).toApproximate(3104)
        })
      })
    })
  })

  describe("swirl", () => {
    beforeAll(() => {
      setupStats = createProxiedStats(baseStats)
      setupStats.enemyLevel = 81
      applyArtifacts(setupStats, [{ eleMas: 234, swirl_dmg_: 60, pyro_enemyRes_: -40 }]) // 4VV
    })
    afterAll(() => setupStats = undefined)

    test("swirl", () => {
      expect(stats.pyro_swirl_hit).toApproximate(1666)
    })
  })
})
