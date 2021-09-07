import { applyArtifacts, computeAllStats, createProxiedStats, parseTestFlexObject } from "../TestUtils"
import formula from "./data"

const url = "https://frzyc.github.io/genshin-optimizer/#/flex?v=2&d=545k0314ak22t19z04z295k09444z15U02W01T895k0g341Hb9z06P0aa395k04242i21d45D09W095k01043r09D04W07b13006004L70A066617stamina3240hBlackcliffSlasher3L900101000"
const { artifacts } = parseTestFlexObject(url)

let setupStats
describe("Testing Beidou's Formulas (Blakeblaze#2916)", () => {

  beforeEach(() => {
    setupStats = createProxiedStats({
      characterHP: 10662, characterATK: 694 - 510, characterDEF: 530,
      characterEle: "electro", characterLevel: 70,
      weaponType: "claymore", weaponATK: 510, critDMG_: 50 + 55.1,// Blackcliff Slasher Lvl. 90 (Refinement 1)
      electro_dmg_: 18,//specialized

      enemyLevel: 85,
      physical_enemyRes_: 70, // Ruin Guard
      tlvl: Object.freeze({ auto: 7 - 1, skill: 10 - 1, burst: 10 - 1 }),
      constellation: 6,
    })
  })

  describe("with artifacts", () => {
    beforeEach(() => applyArtifacts(setupStats, [
      ...artifacts,
      { atk_: 18, normal_dmg_: 35 }, // 4pc gladiators
    ]))

    describe("no crit", () => {
      beforeEach(() => setupStats.hitMode = "hit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(371)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(369)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(461)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(451)
        expect(formula.normal[4](stats)[0](stats)).toApproximate(585)
        expect(formula.charged.spinning(stats)[0](stats)).toApproximate(217)
        expect(formula.charged.final(stats)[0](stats)).toApproximate(393)
        // expect(formula.plunging.dmg(stats)[0](stats)).toApproximate(692)//not sure what this 692 is
        // expect(formula.plunging.low(stats)[0](stats)).toApproximate(692)
        expect(formula.plunging.high(stats)[0](stats)).toApproximate(720)

        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(2643)
        expect(formula.skill.hit1(stats)[0](stats)).toApproximate(6120)
        expect(formula.skill.hit2(stats)[0](stats)).toApproximate(9598)

        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(2643)

        expect(formula.constellation4.dmg(stats)[0](stats)).toApproximate(241)
      })
      test('burst c6 effect', () => {
        setupStats.electro_enemyRes_ += -15
        const stats = computeAllStats(setupStats)
        expect(formula.burst.lightningDMG(stats)[0](stats)).toApproximate(2376)
      })
    })

    describe("crit", () => {
      beforeEach(() => setupStats.hitMode = "critHit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(891)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(888)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(1107)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(1084)
        expect(formula.normal[4](stats)[0](stats)).toApproximate(1405)
        expect(formula.charged.spinning(stats)[0](stats)).toApproximate(522)
        expect(formula.charged.final(stats)[0](stats)).toApproximate(945)
        // expect(formula.plunging.dmg(stats)[0](stats)).toApproximate()
        expect(formula.plunging.low(stats)[0](stats)).toApproximate(1384)
        expect(formula.plunging.high(stats)[0](stats)).toApproximate(1729)

        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(6345)
        expect(formula.skill.hit1(stats)[0](stats)).toApproximate(14694)
        expect(formula.skill.hit2(stats)[0](stats)).toApproximate(23044)

        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(6345)

        expect(formula.constellation4.dmg(stats)[0](stats)).toApproximate(579)
      })
      test('burst c6 effect', () => {
        setupStats.electro_enemyRes_ += -15
        const stats = computeAllStats(setupStats)
        expect(formula.burst.lightningDMG(stats)[0](stats)).toApproximate(5705)
      })

    })

  })
})
