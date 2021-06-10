import { applyArtifacts, computeAllStats, createProxiedStats } from "../TestUtils"
import formula from "./data"

let setupStats

// Discord ID: 822256929929822248
describe("Testing Jean's Formulas (sohum#5921)", () => {
  beforeEach(() => {
    setupStats = createProxiedStats({
      characterHP: 9533, characterATK: 155, characterDEF: 499,
      characterEle: "anemo", characterLevel: 60,
      weaponType: "sword", weaponATK: 347,

      heal_: 11.1, enerRech_: 100 + 50.5,
      enemyLevel: 85, physical_enemyRes_: 70, // Ruin Guard

      tlvl: Object.freeze({ auto: 1 - 1, skill: 1 - 1, burst: 1 - 1 }),
    })
  })

  describe("with artifacts", () => {
    beforeEach(() => applyArtifacts(setupStats, [
      { hp: 3967, atk_: 9.3, atk: 16, critDMG_: 13.2, hp_: 10.5, }, // Flower of Life
      { atk: 258, critDMG_: 7, def: 81, critRate_: 3.9, hp: 239, }, // Plume of Death
      { enerRech_: 29.8, critDMG_: 6.2, hp: 209, eleMas: 19, atk: 16 }, // Sands of Eon
      { anemo_dmg_: 30.8, hp: 448, eleMas: 40, critRate_: 3.9, def: 21 }, // Goblet of Eonothem
      { critRate_: 25.8, hp: 478, critDMG_: 7, atk_: 13.4, atk: 35, }, // Circlet of Logos
      { eleMas: 80 }, // 2 Wanderer's Troupe
    ]))

    test("heal", () => {
      const stats = computeAllStats(setupStats)
      expect(formula.burst.regen(stats)[0](stats)).toApproximate(433)
      expect(formula.passive1.dmg(stats)[0](stats)).toApproximate(156)
    })
    describe("no crit", () => {
      beforeEach(() => setupStats.hitMode = "hit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(63)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(59)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(78)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(86)
        expect(formula.normal[4](stats)[0](stats)).toApproximate(103)
        expect(formula.charged.dmg(stats)[0](stats)).toApproximate(211)
        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(1498)
        expect(formula.burst.skill(stats)[0](stats)).toApproximate(2180)
        expect(formula.burst.field_dmg(stats)[0](stats)).toApproximate(402)
      })
    })

    describe("crit", () => {
      beforeEach(() => setupStats.hitMode = "critHit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(115)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(109)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(144)
        expect(formula.normal[4](stats)[0](stats)).toApproximate(189)
        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(2748)
        expect(formula.burst.skill(stats)[0](stats)).toApproximate(3998)
        expect(formula.burst.field_dmg(stats)[0](stats)).toApproximate(737)
      })
    })
  })
})

// Discord ID: 754914627246358610
describe("Testing Jean's Formulas (Saber#9529)", () => {
  beforeEach(() => {
    setupStats = createProxiedStats({
      characterHP: 14695, characterATK: 239, characterDEF: 769,
      characterEle: "anemo", characterLevel: 90,
      weaponType: "sword", weaponATK: 674,

      heal_: 22.2,
      atk_: 20, physical_dmg_: 41.3, // Weapon

      tlvl: Object.freeze({ auto: 9 - 1, skill: 8 - 1, burst: 6 - 1 }),
    })
  })

  describe("with artifacts", () => {
    beforeEach(() => applyArtifacts(setupStats, [
      { hp: 4780, critDMG_: 12.4, critRate_: 9.7, hp_: 4.1, def: 58 }, // Flower of Life
      { atk: 311, critRate_: 10.5, def: 19, critDMG_: 19.4, hp_: 4.7 }, // Plume of Death
      { atk_: 46.6, def_: 12.4, critDMG_: 22.5, hp: 478, enerRech_: 10.4 }, // Sands of Eon
      { atk_: 46.6, critDMG_: 27.2, def_: 5.8, eleMas: 23, critRate_: 6.6 }, // Goblet of Eonothem
      { critRate_: 31.1, enerRech_: 13, hp_: 14, hp: 299, eleMas: 56 }, // Circlet of Logos
      { atk_: 18, physical_dmg_: 25 }, // Gladiators 2set + Bloodstained 2set
    ]))

    test("overall stats", () => {
      const stats = computeAllStats(setupStats)
      expect(stats.finalHP).toApproximate(14695 + 8897)
      expect(stats.finalATK).toApproximate(914 + 1510)
      expect(stats.finalDEF).toApproximate(769 + 216)
      expect(stats.eleMas).toApproximate(79)
      expect(stats.critRate_).toApproximate(62.9)
      expect(stats.critDMG_).toApproximate(131.6)
      expect(stats.enerRech_).toApproximate(123.3)
      expect(stats.anemo_dmg_).toApproximate(0)
      expect(stats.physical_dmg_).toApproximate(66.3)
    })

    test("healing", () => {
      const stats = computeAllStats(setupStats)
      expect(formula.burst.heal(stats)[0](stats)).toApproximate(13388)
      expect(formula.burst.regen(stats)[0](stats)).toApproximate(1338)

      expect(formula.passive1.dmg(stats)[0](stats)).toApproximate(443)
    })

    describe("no crit", () => {
      beforeEach(() => setupStats.hitMode = "hit")

      describe("Ruin Guard lvl 85", () => {
        beforeEach(() => {
          setupStats.enemyLevel = 85
          setupStats.physical_enemyRes_ = 70
        })

        test("hits", () => {
          const stats = computeAllStats(setupStats)
          expect(formula.normal[0](stats)[0](stats)).toApproximate(544)
          expect(formula.normal[1](stats)[0](stats)).toApproximate(513)
          expect(formula.normal[2](stats)[0](stats)).toApproximate(678)
          expect(formula.normal[3](stats)[0](stats)).toApproximate(741)
          expect(formula.normal[4](stats)[0](stats)).toApproximate(891)

          expect(formula.charged.dmg(stats)[0](stats)).toApproximate(1823)

          expect(formula.plunging.dmg(stats)[0](stats)).toApproximate(719)
          expect(formula.plunging.low(stats)[0](stats)).toApproximate(1438)
          expect(formula.plunging.high(stats)[0](stats)).toApproximate(1797)

          expect(formula.skill.dmg(stats)[0](stats)).toApproximate(5162)
          expect(formula.skill.dmg_hold(stats)[0](stats)).toApproximate(7226)
        })
      })
    })

    describe("crit", () => {
      beforeEach(() => setupStats.hitMode = "critHit")

      describe("Ruin Guard lvl 85", () => {
        beforeEach(() => {
          setupStats.enemyLevel = 85
          setupStats.physical_enemyRes_ = 70
        })

        test("hits", () => {
          const stats = computeAllStats(setupStats)
          expect(formula.normal[0](stats)[0](stats)).toApproximate(1259)
          expect(formula.normal[1](stats)[0](stats)).toApproximate(1188)
          expect(formula.normal[2](stats)[0](stats)).toApproximate(1571)
          expect(formula.normal[3](stats)[0](stats)).toApproximate(1717)
          expect(formula.normal[4](stats)[0](stats)).toApproximate(2064)

          expect(formula.charged.dmg(stats)[0](stats)).toApproximate(4223)

          expect(formula.plunging.dmg(stats)[0](stats)).toApproximate(1666)
          expect(formula.plunging.low(stats)[0](stats)).toApproximate(3332)
          expect(formula.plunging.high(stats)[0](stats)).toApproximate(4162)

          expect(formula.skill.dmg(stats)[0](stats)).toApproximate(11954)
          expect(formula.skill.dmg_hold(stats)[0](stats)).toApproximate(16736)

          expect(formula.burst.skill(stats)[0](stats)).toApproximate(15217)
          expect(formula.burst.field_dmg(stats)[0](stats)).toApproximate(2808)
        })
      })
    })
  })

  describe("C1 with Anemo DMG Bonus", () => {
    beforeEach(() => {
      // Ruin Guard
      setupStats.enemyLevel = 86
      setupStats.physical_enemyRes_ = 70
    })

    describe("Setup 1", () => {
      beforeEach(() => {
        // Weapon
        delete setupStats.atk_
        delete setupStats.physical_dmg_
        setupStats.weaponATK = 914 - setupStats.characterATK

        setupStats.hp = 7542
        setupStats.atk = 1487
        setupStats.def = 218
        setupStats.critRate_ = 39.1
        setupStats.critDMG_ = 110.0
        setupStats.heal_ = 22.2
        setupStats.enerRech_ = 114.9
      })

      describe("no crit", () => {
        beforeEach(() => setupStats.hitMode = "hit")

        test("with Anemo DMG Bonus 46.6%", () => {
          setupStats.anemo_dmg_ = 46.6
          const stats = computeAllStats(setupStats)
          expect(formula.skill.dmg(stats)[0](stats)).toApproximate(7477)
          expect(formula.skill.dmg_hold(stats)[0](stats)).toApproximate(9517)
        })

        test("with Anemo DMG Bonus 71.6%", () => {
          setupStats.anemo_dmg_ = 71.6
          const stats = computeAllStats(setupStats)
          expect(formula.skill.dmg(stats)[0](stats)).toApproximate(8752)
          expect(formula.skill.dmg_hold(stats)[0](stats)).toApproximate(10792)
        })
      })

      describe("crit", () => {
        beforeEach(() => setupStats.hitMode = "critHit")

        test("with Anemo DMG Bonus 46.6%", () => {
          setupStats.anemo_dmg_ = 46.6
          const stats = computeAllStats(setupStats)
          expect(formula.skill.dmg(stats)[0](stats)).toApproximate(15700)
          expect(formula.skill.dmg_hold(stats)[0](stats)).toApproximate(19984)
        })

        test("with Anemo DMG Bonus 71.6%", () => {
          setupStats.anemo_dmg_ = 71.6
          const stats = computeAllStats(setupStats)
          expect(formula.skill.dmg(stats)[0](stats)).toApproximate(18378)
          expect(formula.skill.dmg_hold(stats)[0](stats)).toApproximate(22662)
        })
      })
    })

    describe("Setup 2", () => {
      beforeEach(() => {
        // Weapon
        delete setupStats.atk_
        delete setupStats.physical_dmg_
        setupStats.weaponATK = 914 - setupStats.characterATK

        setupStats.hp = 7574
        setupStats.atk = 1487
        setupStats.def = 218
        setupStats.critRate_ = 38.4
        setupStats.critDMG_ = 90.6
        setupStats.heal_ = 22.2
        setupStats.enerRech_ = 120.7
      })

      describe("no crit", () => {
        beforeEach(() => setupStats.hitMode = "hit")

        test("with Anemo DMG Bonus 61.6%", () => {
          setupStats.anemo_dmg_ = 61.6
          const stats = computeAllStats(setupStats)
          expect(formula.skill.dmg(stats)[0](stats)).toApproximate(8242)
          expect(formula.skill.dmg_hold(stats)[0](stats)).toApproximate(10282)
        })

        test("with Anemo DMG Bonus 86.6%", () => {
          setupStats.anemo_dmg_ = 86.6
          const stats = computeAllStats(setupStats)
          expect(formula.skill.dmg(stats)[0](stats)).toApproximate(9517)
          expect(formula.skill.dmg_hold(stats)[0](stats)).toApproximate(11557)
        })
      })

      describe("crit", () => {
        beforeEach(() => setupStats.hitMode = "critHit")

        test("with Anemo DMG Bonus 61.6%", () => {
          setupStats.anemo_dmg_ = 61.6
          const stats = computeAllStats(setupStats)
          expect(formula.skill.dmg(stats)[0](stats)).toApproximate(15706)
          expect(formula.skill.dmg_hold(stats)[0](stats)).toApproximate(19594)
        })

        test("with Anemo DMG Bonus 86.6%", () => {
          setupStats.anemo_dmg_ = 86.6
          const stats = computeAllStats(setupStats)
          expect(formula.skill.dmg(stats)[0](stats)).toApproximate(18136)
          expect(formula.skill.dmg_hold(stats)[0](stats)).toApproximate(22024)
        })
      })
    })

    describe("Setup 3", () => {
      beforeEach(() => {
        // Weapon
        delete setupStats.atk_
        delete setupStats.physical_dmg_
        setupStats.weaponATK = 914 - setupStats.characterATK

        setupStats.hp = 7574
        setupStats.atk = 1237
        setupStats.def = 228
        setupStats.critRate_ = 32.5
        setupStats.critDMG_ = 90.6
        setupStats.heal_ = 22.2
        setupStats.enerRech_ = 116.2
      })

      describe("no crit", () => {
        beforeEach(() => setupStats.hitMode = "hit")

        test("with Anemo DMG Bonus 22.0%", () => {
          setupStats.anemo_dmg_ = 22.0
          const stats = computeAllStats(setupStats)
          expect(formula.skill.dmg(stats)[0](stats)).toApproximate(5575)
          expect(formula.skill.dmg_hold(stats)[0](stats)).toApproximate(7403)
        })

        test("with Anemo DMG Bonus 47.0%", () => {
          setupStats.anemo_dmg_ = 47.0
          const stats = computeAllStats(setupStats)
          expect(formula.skill.dmg(stats)[0](stats)).toApproximate(6717)
          expect(formula.skill.dmg_hold(stats)[0](stats)).toApproximate(8545)
        })
      })

      describe("crit", () => {
        beforeEach(() => setupStats.hitMode = "critHit")

        test("with Anemo DMG Bonus 22.0%", () => {
          setupStats.anemo_dmg_ = 22.0
          const stats = computeAllStats(setupStats)
          expect(formula.skill.dmg(stats)[0](stats)).toApproximate(10624)
          expect(formula.skill.dmg_hold(stats)[0](stats)).toApproximate(14107)
        })

        test("with Anemo DMG Bonus 47.0%", () => {
          setupStats.anemo_dmg_ = 47.0
          const stats = computeAllStats(setupStats)
          expect(formula.skill.dmg(stats)[0](stats)).toApproximate(12801)
        })
      })
    })

    describe("Setup 4", () => {
      beforeEach(() => {
        // Weapon
        delete setupStats.atk_
        delete setupStats.physical_dmg_
        setupStats.weaponATK = 914 - setupStats.characterATK
        setupStats.skill_dmg_ = 16

        setupStats.hp = 7574
        setupStats.atk = 921
        setupStats.def = 228
        setupStats.critRate_ = 32.5
        setupStats.critDMG_ = 90.6
        setupStats.heal_ = 22.2
        setupStats.enerRech_ = 162.1
      })

      describe("no crit", () => {
        beforeEach(() => setupStats.hitMode = "hit")

        test("with Anemo DMG Bonus 22.0%", () => {
          setupStats.anemo_dmg_ = 22.0
          const stats = computeAllStats(setupStats)
          expect(formula.skill.dmg(stats)[0](stats)).toApproximate(5462)
          expect(formula.skill.dmg_hold(stats)[0](stats)).toApproximate(6880)
        })

        test("with Anemo DMG Bonus 47.0%", () => {
          setupStats.anemo_dmg_ = 47.0
          const stats = computeAllStats(setupStats)
          expect(formula.skill.dmg(stats)[0](stats)).toApproximate(6348)
          expect(formula.skill.dmg_hold(stats)[0](stats)).toApproximate(7767)
        })
      })

      describe("crit", () => {
        beforeEach(() => setupStats.hitMode = "critHit")

        test("with Anemo DMG Bonus 22.0%", () => {
          setupStats.anemo_dmg_ = 22.0
          const stats = computeAllStats(setupStats)
          expect(formula.skill.dmg(stats)[0](stats)).toApproximate(10408)
          expect(formula.skill.dmg_hold(stats)[0](stats)).toApproximate(13112)
        })

        test("with Anemo DMG Bonus 47.0%", () => {
          setupStats.anemo_dmg_ = 47.0
          const stats = computeAllStats(setupStats)
          expect(formula.skill.dmg(stats)[0](stats)).toApproximate(12098)
          expect(formula.skill.dmg_hold(stats)[0](stats)).toApproximate(14801)
        })
      })
    })
  })
})

// Discord ID: 822256929929822248
describe("Testing Jean's Formulas (sohum#5921)", () => {
  beforeEach(() => {
    setupStats = createProxiedStats({
      characterHP: 9533, characterATK: 155, characterDEF: 499,
      characterEle: "anemo", characterLevel: 60,
      weaponType: "sword", weaponATK: 347,

      heal_: 11.1, enerRech_: 100 + 50.5,
      enemyLevel: 85, physical_enemyRes_: 70, // Ruin Guard

      tlvl: Object.freeze({ auto: 1 - 1, skill: 1 - 1, burst: 1 - 1 }),
    })
  })

  describe("with artifacts", () => {
    beforeEach(() => applyArtifacts(setupStats, [
      { hp: 3967, atk_: 9.3, atk: 16, critDMG_: 13.2, hp_: 10.5, }, // Flower of Life
      { atk: 258, critDMG_: 7, def: 81, critRate_: 3.9, hp: 239, }, // Plume of Death
      { enerRech_: 29.8, critDMG_: 6.2, hp: 209, eleMas: 19, atk: 16 }, // Sands of Eon
      { anemo_dmg_: 30.8, hp: 448, eleMas: 40, critRate_: 3.9, def: 21 }, // Goblet of Eonothem
      { critRate_: 25.8, hp: 478, critDMG_: 7, atk_: 13.4, atk: 35, }, // Circlet of Logos
      { eleMas: 80 }, // 2 Wanderer's Troupe
    ]))

    test("heal", () => {
      const stats = computeAllStats(setupStats)
      expect(formula.burst.regen(stats)[0](stats)).toApproximate(433)
      expect(formula.passive1.dmg(stats)[0](stats)).toApproximate(156)
    })
    describe("no crit", () => {
      beforeEach(() => setupStats.hitMode = "hit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(63)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(59)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(78)
        expect(formula.normal[3](stats)[0](stats)).toApproximate(86)
        expect(formula.normal[4](stats)[0](stats)).toApproximate(103)
        expect(formula.charged.dmg(stats)[0](stats)).toApproximate(211)
        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(1498)
        expect(formula.burst.skill(stats)[0](stats)).toApproximate(2180)
        expect(formula.burst.field_dmg(stats)[0](stats)).toApproximate(402)
      })
    })

    describe("crit", () => {
      beforeEach(() => setupStats.hitMode = "critHit")

      test("hit", () => {
        const stats = computeAllStats(setupStats)
        expect(formula.normal[0](stats)[0](stats)).toApproximate(115)
        expect(formula.normal[1](stats)[0](stats)).toApproximate(109)
        expect(formula.normal[2](stats)[0](stats)).toApproximate(144)
        expect(formula.normal[4](stats)[0](stats)).toApproximate(189)
        expect(formula.skill.dmg(stats)[0](stats)).toApproximate(2748)
        expect(formula.burst.skill(stats)[0](stats)).toApproximate(3998)
        expect(formula.burst.field_dmg(stats)[0](stats)).toApproximate(737)
      })
    })
  })
})
