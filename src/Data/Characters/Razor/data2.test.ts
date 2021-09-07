import { applyArtifacts, computeAllStats, createProxiedStats, parseTestFlexObject } from "../TestUtils"
import formula from "./data"

const string = "https://frzyc.github.io/genshin-optimizer/#/flex?v=2&d=545k01049p14W03z0a4245k03147x0aJ19t14n195g0424a423P08W02F1g5k0c349J12W0aS08E295k04446912629e15G0k203003L8007553mphysical_enemyImmunity3NaNaenemyLevel277iphysical_enemyRes_270fPrototypeAminus3L800101000"
const { artifacts } = parseTestFlexObject(string)

let setupStats
describe("Testing Steel + Lightning (by EliteMasterEric#3723)", () => {
  beforeEach(() => {
    setupStats = createProxiedStats({
      characterHP: 10602, characterATK: 704 - 497, characterDEF: 665,
      characterEle: "electro", characterLevel: 80,
      weaponType: "claymore", weaponATK: 497,
      atk_: 25.1,//prototype Archiac R1
      physical_dmg_: 22.5,//specialized

      enemyLevel: 77, physical_enemyRes_: 70, // Ruin Guard
      dmg_: 10,//C1
      tlvl: Object.freeze({ auto: 8 - 1, skill: 6 - 1, burst: 9 - 1 }),
    })
  })

  describe("with artifacts", () => {
    beforeEach(() => applyArtifacts(setupStats, [
      ...artifacts,
      { physical_dmg_: 25, atk_: 18 }, // 2 piece bloodstained 2 piece gladiator
    ]))

    describe("no crit", () => {
      beforeEach(() => setupStats.hitMode = "hit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)

        // Calculate combined damage of normal attack and burst.
        expect(formula.burst.c0(stats)[0](stats)).toApproximate(1041 + 650)
        expect(formula.burst.c1(stats)[0](stats)).toApproximate(897 + 560)
        expect(formula.burst.c2(stats)[0](stats)).toApproximate(1122 + 700)
        expect(formula.burst.c3(stats)[0](stats)).toApproximate(1477 + 922)
      })

    })
    describe("crit", () => {
      beforeEach(() => setupStats.hitMode = "critHit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)

        // Calculate combined damage of normal attack and burst.
        expect(formula.burst.c0(stats)[0](stats)).toApproximate(2008 + 1252)
        expect(formula.burst.c1(stats)[0](stats)).toApproximate(1730 + 1079)
        expect(formula.burst.c2(stats)[0](stats)).toApproximate(2163 + 1349)
        expect(formula.burst.c3(stats)[0](stats)).toApproximate(2848 + 1777)
      })
    })
  })
})
