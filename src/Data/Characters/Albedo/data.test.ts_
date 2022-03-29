import { applyArtifacts, computeAllStats, createProxiedStats } from "../TestUtils"
import formula from "./data"

let setupStats

describe("Testing Albedo's skill + C2 Formulas (AdmiralRif#4541)", () => {
  beforeEach(() => {
    setupStats = createProxiedStats({
      characterHP: 11669, characterATK: 670 - 449, characterDEF: 773,
      characterEle: "geo", characterLevel: 80,
      weaponType: "sword", weaponATK: 449,
      critRate_: 5 + 25.1,
      geo_dmg_: 21.6,
      enemyLevel: 85, physical_enemyRes_: 70, // Ruin Guard
      tlvl: Object.freeze({ auto: 1 - 1, skill: 8 - 1, burst: 8 - 1 }),
    })
  })

  describe("with artifacts", () => {
    beforeEach(() => applyArtifacts(setupStats, [
      { hp: 3155, hp_: 4.1, critRate_: 3.5, eleMas: 19, enerRech_: 16.2, }, // Flower of Life
      { atk: 258, critDMG_: 14, enerRech_: 13, hp: 299, def_: 18.2, }, // Plume of Death
      { enerRech_: 27.6, atk: 16, critRate_: 7.4, critDMG_: 6.2, eleMas: 23 }, // Sands of Eon
      { geo_dmg_: 38.7, eleMas: 35, enerRech_: 10.4, def: 16, critRate_: 5.4 }, // Goblet of Eonothem
      { critDMG_: 41, hp: 538, critRate_: 3.5, def_: 13.1, def: 23 }, // Circlet of Logos
      { geo_dmg_: 15 }, // 2 Petrao
    ]))


    describe("no crit", () => {
      beforeEach(() => setupStats.hitMode = "hit")

      test("skill + C2", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.skill.press(stats)[0](stats)).toApproximate(1532)
        expect(formula.skill.blossom(stats)[0](stats)).toApproximate(1753)
        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(4314)
        expect(formula.burst.dmg1c2(stats)[0](stats)).toApproximate(4560)
        expect(formula.burst.dmg2c2(stats)[0](stats)).toApproximate(4806)
        expect(formula.burst.dmg3c2(stats)[0](stats)).toApproximate(5052)
        expect(formula.burst.dmg4c2(stats)[0](stats)).toApproximate(5298)
        expect(formula.burst.blossom(stats)[0](stats)).toApproximate(845)
        expect(formula.burst.blossom1c2(stats)[0](stats)).toApproximate(1092)
        expect(formula.burst.blossom2c2(stats)[0](stats)).toApproximate(1338)
        expect(formula.burst.blossom3c2(stats)[0](stats)).toApproximate(1584)
        expect(formula.burst.blossom4c2(stats)[0](stats)).toApproximate(1830)
      })
    })

    describe("skill + crit", () => {
      beforeEach(() => setupStats.hitMode = "critHit")

      test("C2", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.skill.press(stats)[0](stats)).toApproximate(3235)
        expect(formula.skill.blossom(stats)[0](stats)).toApproximate(3704)
        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(9111)
        expect(formula.burst.dmg1c2(stats)[0](stats)).toApproximate(9631)
        expect(formula.burst.dmg2c2(stats)[0](stats)).toApproximate(10151)
        expect(formula.burst.dmg3c2(stats)[0](stats)).toApproximate(10671)
        expect(formula.burst.dmg4c2(stats)[0](stats)).toApproximate(11191)
        expect(formula.burst.blossom(stats)[0](stats)).toApproximate(1786)
        expect(formula.burst.blossom1c2(stats)[0](stats)).toApproximate(2306)
        expect(formula.burst.blossom2c2(stats)[0](stats)).toApproximate(2826)
        expect(formula.burst.blossom3c2(stats)[0](stats)).toApproximate(3346)
        expect(formula.burst.blossom4c2(stats)[0](stats)).toApproximate(3866)
      })
    })
  })
})

describe("Testing Albedo's Formulas (The_Lolicon#4257)", () => {
  beforeEach(() => {
    setupStats = createProxiedStats({
      characterHP: 11669, characterATK: 222, characterDEF: 773,
      characterEle: "geo", characterLevel: 80,
      weaponType: "sword", weaponATK: 355,
      critRate_: 5 + 28,
      critDMG_: 50 + 42.7,
      geo_dmg_: 21.6,
      enemyLevel: 85, physical_enemyRes_: 70, // Ruin Guard
      tlvl: Object.freeze({ auto: 1 - 1, skill: 8 - 1, burst: 6 - 1 }),
    })
  })

  describe("with artifacts", () => {
    beforeEach(() => applyArtifacts(setupStats, [
      { hp: 4780, atk: !6, def: 37, critDMG_: 21, def_: 12.4, }, // Flower of Life
      { atk: 311, def_: 24.1, critDMG_: 14.8, atk_: 4.1, enerRech_: 5.8, }, // Plume of Death
      { def_: 58.3, atk: 33, hp_: 4.1, def: 44, critRate_: 12.4 }, // Sands of Eon
      { geo_dmg_: 46.6, hp: 239, eleMas: 40, critRate_: 2.7, critDMG_: 33.4 }, // Goblet of Eonothem
      { critRate_: 31.1, def_: 10.9, atk: 35, eleMas: 16, critDMG_: 18.7 }, // Circlet of Logos
      { geo_dmg_: 15 }, // 2 Petrao
    ]))


    describe("no crit", () => {
      beforeEach(() => setupStats.hitMode = "hit")

      test("with artifacts", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(54)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(54)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(69)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(73)
        expect(formula.normal[4](stats)[0](stats)).toApproximate(91)
        expect(formula.charged.atk1(stats)[0](stats)).toApproximate(69)
        expect(formula.charged.atk2(stats)[0](stats)).toApproximate(88)
        expect(formula.plunging.dmg(stats)[0](stats)).toApproximate(94)
        expect(formula.plunging.low(stats)[0](stats)).toApproximate(188)
        expect(formula.plunging.high(stats)[0](stats)).toApproximate(235)
        expect(formula.skill.press(stats)[0](stats)).toApproximate(1688)
        expect(formula.skill.blossom(stats)[0](stats)).toApproximate(2904)
        expect(formula.skill.blossom50(stats)[0](stats)).toApproximate(3300)
        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(4195)
        expect(formula.burst.blossom(stats)[0](stats)).toApproximate(815)
      })
    })

    describe("crit", () => {
      beforeEach(() => setupStats.hitMode = "critHit")

      test("with artifacts", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(151)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(151)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(195)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(205)
        expect(formula.normal[4](stats)[0](stats)).toApproximate(256)
        expect(formula.charged.atk1(stats)[0](stats)).toApproximate(195)
        expect(formula.charged.atk2(stats)[0](stats)).toApproximate(248)
        expect(formula.plunging.dmg(stats)[0](stats)).toApproximate(264)
        expect(formula.plunging.low(stats)[0](stats)).toApproximate(527)
        expect(formula.plunging.high(stats)[0](stats)).toApproximate(659)
        expect(formula.skill.press(stats)[0](stats)).toApproximate(4735)
        expect(formula.skill.blossom(stats)[0](stats)).toApproximate(8147)
        expect(formula.skill.blossom50(stats)[0](stats)).toApproximate(9258)
        expect(formula.burst.dmg(stats)[0](stats)).toApproximate(11668)
        expect(formula.burst.blossom(stats)[0](stats)).toApproximate(2287)
      })
    })
  })
})