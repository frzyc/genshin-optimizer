import formula from "./data"
import { applyArtifacts, createProxiedStats } from "../TestUtils"
import { PreprocessFormulas } from "../../../StatData"
import { GetDependencies } from "../../../StatDependency"

// Discord ID: 822576356146544691
// Discord Handle: Arby3#1371
const baseStat = {
  characterHP: 10050, characterATK: 233, characterDEF: 749,
  characterEle: "cryo", characterLevel: 70,
  weaponType: "sword", weaponATK: 401,
  
  healing_: 16.6, enerRech_: 100 + 55.9,

  enemyLevel: 85, physical_enemyRes_: 70, // Ruin Guard
  
  talentLevelKeys: Object.freeze({ auto: 6 - 1, skill: 6 - 1, burst: 9 - 1 }),
}
const artifacts = [
  { hp: 4780, enerRech_: 5.2, critRate_: 3.1, def_: 22.6, atk_: 13.4 }, // Flower of Life
  { atk: 311, critRate_: 6.6, critDMG_: 17.1, def_: 5.8, atk_: 11.7 }, // Plume of Death
  { atk_: 46.6, hp: 627, critDMG_: 14, atk: 35, critRate_: 3.1 }, // Sands of Eon
  { cryo_dmg_: 46.6, critDMG_: 15.5, eleMas: 19, atk: 47, critRate_: 7.4 }, // Goblet of Eonothem
  { critRate_: 31.1, def: 42, def_: 20.4, critDMG_: 17.9, atk_: 5.3 }, // Circlet of Logos
  { pyro_dmg_: 15 }, // 2 Crimson Witch of Flames
]

let setupStats, stats = {}
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
      expect(stats.finalHP).toApproximate(15457)
      expect(stats.finalATK).toApproximate(1514)
      expect(stats.finalDEF).toApproximate(1157)
      expect(stats.eleMas).toApproximate(19)
      expect(stats.critRate_).toApproximate(56.3)
      expect(stats.critDMG_).toApproximate(114.5)
      expect(stats.healing_).toApproximate(16.6)
    })

    describe("no crit", () => {
      beforeAll(() => setupStats.hitMode = "hit")
      afterAll(() => delete setupStats.hitMode)

      test("hits", () => {
        const { auto, skill, burst } = stats.talentLevelKeys
        expect(formula.normal[0](auto, stats)[0](stats)).toApproximate(119)
        expect(formula.normal[1](auto, stats)[0](stats)).toApproximate(122)
        expect(formula.normal[2](auto, stats)[0](stats)).toApproximate(76 * 2)
        expect(formula.normal[3](auto, stats)[0](stats)).toApproximate(78 * 2)
        expect(formula.normal[4](auto, stats)[0](stats)).toApproximate(199)
        expect(formula.charged.hit(auto, stats)[0](stats)).toApproximate(203)
        expect(formula.skill.hit(skill, stats)[0](stats)).toApproximate(1285)
        expect(formula.skill.herald(skill, stats)[0](stats)).toApproximate(482)
      })
    })

    describe("crit", () => {
      beforeAll(() => setupStats.hitMode = "critHit")
      afterAll(() => delete setupStats.hitMode)

      test("hits", () => {
        const { auto, skill, burst } = stats.talentLevelKeys
        expect(formula.normal[0](auto, stats)[0](stats)).toApproximate(256)
        expect(formula.normal[1](auto, stats)[0](stats)).toApproximate(263)
        expect(formula.normal[2](auto, stats)[0](stats)).toApproximate(163 * 2)
        expect(formula.normal[3](auto, stats)[0](stats)).toApproximate(167 * 2)
        expect(formula.normal[4](auto, stats)[0](stats)).toApproximate(427)
        expect(formula.charged.hit(auto, stats)[0](stats)).toApproximate(436)
        expect(formula.skill.hit(skill, stats)[0](stats)).toApproximate(2757)
        expect(formula.skill.herald(skill, stats)[0](stats)).toApproximate(1034)
      })
    })

    describe("C2", () => {
      beforeAll(() => {
        setupStats.normal_dmg_ += 15
        setupStats.charged_dmg_ += 15
      })
      afterAll(() => {
        setupStats.normal_dmg_ -= 15
        setupStats.charged_dmg_ -= 15
      })

      describe("no crit", () => {
        beforeAll(() => setupStats.hitMode = "hit")
        afterAll(() => delete setupStats.hitMode)
  
        test("hits", () => {
          const { auto, skill, burst } = stats.talentLevelKeys
          expect(formula.normal[0](auto, stats)[0](stats)).toApproximate(137)
          expect(formula.normal[1](auto, stats)[0](stats)).toApproximate(141)
          expect(formula.normal[2](auto, stats)[0](stats)).toApproximate(87 * 2)
          expect(formula.normal[3](auto, stats)[0](stats)).toApproximate(89 * 2)
          expect(formula.normal[4](auto, stats)[0](stats)).toApproximate(229)
          expect(formula.charged.hit(auto, stats)[0](stats)).toApproximate(233)
          expect(formula.skill.hit(skill, stats)[0](stats)).toApproximate(1285)
          expect(formula.skill.herald(skill, stats)[0](stats)).toApproximate(482)
        })
      })
  
      describe("crit", () => {
        beforeAll(() => setupStats.hitMode = "critHit")
        afterAll(() => delete setupStats.hitMode)
  
        test("hits", () => {
          const { auto, skill, burst } = stats.talentLevelKeys
          expect(formula.normal[0](auto, stats)[0](stats)).toApproximate(294)
          expect(formula.normal[1](auto, stats)[0](stats)).toApproximate(303)
          expect(formula.normal[2](auto, stats)[0](stats)).toApproximate(188 * 2)
          expect(formula.normal[3](auto, stats)[0](stats)).toApproximate(192 * 2)
          expect(formula.normal[4](auto, stats)[0](stats)).toApproximate(491)
          expect(formula.charged.hit(auto, stats)[0](stats)).toApproximate(501)
          expect(formula.skill.hit(skill, stats)[0](stats)).toApproximate(2757)
          expect(formula.skill.herald(skill, stats)[0](stats)).toApproximate(1034)
          expect(formula.burst.dmg(burst, stats)[0](stats)).toApproximate(9934)
        })
      })
    })
  })
})
