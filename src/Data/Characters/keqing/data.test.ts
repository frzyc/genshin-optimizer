import { applyArtifacts, computeAllStats, createProxiedStats, parseTestFlexObject } from "../TestUtils"
import formula from "./data"

const url = "https://frzyc.github.io/genshin-optimizer/#/flex?v=2&d=5p5k0104a047j09D03S095k03147g05I09B14o265i0g348x1a612c24L195g0a446Y12c21d49a1p5g04246S22W03x09v0d001004L80A07660dTheBlackSword3L900101000"
const { artifacts } = parseTestFlexObject(url)

let setupStats
describe("Testing Keqing's Formulas (Agent RAF#3111)", () => {
  beforeEach(() => {
    setupStats = createProxiedStats({
      characterHP: 12182, characterATK: 300, characterDEF: 743,
      characterEle: "electro", characterLevel: 80,
      weaponType: "sword", weaponATK: 510, critRate_: 27.6 + 5,//Black sword R1
      normal_dmg_: 20,
      charged_dmg_: 20,

      critDMG_: 50 + 38.4,//specialized

      enemyLevel: 85, physical_enemyRes_: 70, // Ruin Guard
      tlvl: Object.freeze({ auto: 8 - 1, skill: 7 - 1, burst: 7 - 1 }),
      constellation: 1,
    })
  })

  describe("with artifacts", () => {
    beforeEach(() => applyArtifacts(setupStats, [
      ...artifacts,
      { electro_dmg_: 15, atk_: 18 }, // 2 piece thunder-fury 2 piece gladiators
    ]))

    describe("no crit", () => {
      beforeEach(() => setupStats.hitMode = "hit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(234)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(234)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(310)
        // expect(formula.normal[3](stats)[0](stats)).toApproximate(157)//should be 179
        expect(formula.normal[4](stats)[0](stats)).toApproximate(196)
        expect(formula.normal[5](stats)[0](stats)).toApproximate(382)
        expect(formula.charged.hit1(stats)[0](stats)).toApproximate(438)
        expect(formula.charged.hit2(stats)[0](stats)).toApproximate(490)
        // expect(formula.plunging.dmg(stats)[0](stats)).toApproximate()
        // expect(formula.plunging.low(stats)[0](stats)).toApproximate()
        // expect(formula.plunging.high(stats)[0](stats)).toApproximate()

        expect(formula.skill.stilleto(stats)[0](stats)).toApproximate(994)
        // expect(formula.skill.slashing(stats)[0](stats)).toApproximate(3515)//wrong, should be 3315?
        expect(formula.skill.thunderclap_slashing(stats)[0](stats)).toApproximate(1657)

        expect(formula.burst.skill(stats)[0](stats)).toApproximate(1736)
        expect(formula.burst.consec_slash(stats)[0](stats)).toApproximate(473)
        expect(formula.burst.last(stats)[0](stats)).toApproximate(3726)

        expect(formula.constellation1.dmg(stats)[0](stats)).toApproximate(657)
      })

    })
    describe("no crit", () => {
      beforeEach(() => {
        setupStats.hitMode = "hit"
        setupStats.infusionSelf = "electro"
      })

      test("electro infusion", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(1039)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(1039)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(1379)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(797)
        expect(formula.normal[4](stats)[0](stats)).toApproximate(871)
        expect(formula.normal[5](stats)[0](stats)).toApproximate(1697)
        expect(formula.charged.hit1(stats)[0](stats)).toApproximate(1946)
        expect(formula.charged.hit2(stats)[0](stats)).toApproximate(2179)
        expect(formula.plunging.dmg(stats)[0](stats)).toApproximate(1437)
        expect(formula.plunging.low(stats)[0](stats)).toApproximate(2875)
        expect(formula.plunging.high(stats)[0](stats)).toApproximate(3591)
      })

    })
    describe("crit", () => {
      beforeEach(() => setupStats.hitMode = "critHit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(638)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(638)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(846)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(489)
        expect(formula.normal[4](stats)[0](stats)).toApproximate(535)
        expect(formula.normal[5](stats)[0](stats)).toApproximate(1041)
        expect(formula.charged.hit1(stats)[0](stats)).toApproximate(1194)
        expect(formula.charged.hit2(stats)[0](stats)).toApproximate(1337)
        // expect(formula.plunging.dmg(stats)[0](stats)).toApproximate()
        // expect(formula.plunging.low(stats)[0](stats)).toApproximate()
        // expect(formula.plunging.high(stats)[0](stats)).toApproximate()

        expect(formula.skill.stilleto(stats)[0](stats)).toApproximate(2712)
        expect(formula.skill.slashing(stats)[0](stats)).toApproximate(9040)
        expect(formula.skill.thunderclap_slashing(stats)[0](stats)).toApproximate(4520)

        expect(formula.burst.skill(stats)[0](stats)).toApproximate(4735)
        expect(formula.burst.consec_slash(stats)[0](stats)).toApproximate(1291)
        expect(formula.burst.last(stats)[0](stats)).toApproximate(10159)

        expect(formula.constellation1.dmg(stats)[0](stats)).toApproximate(1793)

      })

    })
    describe("crit", () => {
      beforeEach(() => {
        setupStats.hitMode = "critHit"
        setupStats.infusionSelf = "electro"
      })

      test("electro infusion", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(2834)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(2834)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(3761)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(2174)
        // expect(formula.normal[4](stats)[0](stats)).toApproximate(2736)//wrong, should be 2376?
        expect(formula.normal[5](stats)[0](stats)).toApproximate(4629)
        expect(formula.charged.hit1(stats)[0](stats)).toApproximate(5306)
        expect(formula.charged.hit2(stats)[0](stats)).toApproximate(5942)
        expect(formula.plunging.dmg(stats)[0](stats)).toApproximate(3920)
        expect(formula.plunging.low(stats)[0](stats)).toApproximate(7838)
        expect(formula.plunging.high(stats)[0](stats)).toApproximate(9791)
      })
    })
  })
})
