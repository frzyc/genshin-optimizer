import { applyArtifacts, computeAllStats, createProxiedStats, parseTestFlexObject } from "../TestUtils"
import formula from "./data"

const url = "https://frzyc.github.io/genshin-optimizer/#/flex?v=2&d=594g0104af24k19s03c095k03142F01Y79v089395k04243419-0a617l095k09443412R08E14F0u5g0c343r01u77E04R0k006003L8000000fPrototypeAminus3L901101000"
const { artifacts } = parseTestFlexObject(url)

let setupStats
describe("Testing Razor's Formulas (sohum#5921)", () => {
  beforeEach(() => {
    setupStats = createProxiedStats({
      characterHP: 10602, characterATK: 772 - 565, characterDEF: 665,
      characterEle: "electro", characterLevel: 80,
      weaponType: "claymore", weaponATK: 565,
      atk_: 27.6,//prototype Archiac R2
      physical_dmg_: 22.5,//specialized

      enemyLevel: 85, physical_enemyRes_: 70, // Ruin Guard
      // dmg_: 10,//C1
      tlvl: Object.freeze({ auto: 8 - 1, skill: 11 - 1, burst: 10 - 1 }),
    })
  })

  describe("with artifacts", () => {
    beforeEach(() => applyArtifacts(setupStats, [
      ...artifacts,
      { atk_: 18, normal_dmg_: 35 }, // 4 piece gladiator
    ]))

    describe("no crit", () => {
      beforeEach(() => setupStats.hitMode = "hit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(972)
        expect(formula.constellation6.dmg(stats)[0](stats)).toApproximate(935)

        //prototype Archiac R1 dmg
        expect(3 * stats.physical_elemental_hit).toApproximate(1598)
      })

    })
    describe("crit", () => {
      beforeEach(() => setupStats.hitMode = "critHit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(1665)
        expect(formula.constellation6.dmg(stats)[0](stats)).toApproximate(1601)

        //prototype Archiac R1 dmg
        expect(3 * stats.physical_elemental_critHit).toApproximate(2737)
      })
    })
  })
})
