// @ts-nocheck
// We "mock" artifacts here, which definitely won't pass type checking
import { ArtifactSetEffects } from "../Types/Build"
import { artifactSetPermutations, calculateTotalBuildNumber, artifactPermutations, getTalentStatKey, getTalentStatKeyVariant, pruneArtifacts } from "./Build"

const dummyArtifact = (setKey, value) => { return { setKey, mainStatKey: "x", mainStatVal: value, substats: [] } }
const a = [dummyArtifact("A", 1), dummyArtifact("A", 2), dummyArtifact("A", 3)]
const b = [dummyArtifact("B", 1), dummyArtifact("B", 1.5)]
const c = [dummyArtifact("C", 2)]
const d = [dummyArtifact("D", 1), dummyArtifact("D", 2)]

describe(`artifactSetPermutations()`, () => {
  test(`should separate slots by filter`, () => {
    const artifacts = {
      flower: [a[0], a[1], b[0], c[0], d[0]],
      plume: [a[0], b[0], c[0]],
      sand: [a[0], a[1], b[0]],
    }
    const filter = [{ key: "A", num: 0 }, { key: "B", num: 0 }]
    // flower - 3, plume - 3, sand - 2
    expect(artifactSetPermutations(artifacts, filter)).toHaveLength(3 * 3 * 2)
  })
  test(`should exclude sets if slots are missing`, () => {
    const artifacts = {
      flower: [],
      plume: [a[0], b[0], c[0]],
      sand: [a[0], a[1], b[0]],
    }
    expect(artifactSetPermutations(artifacts, [])).toHaveLength(0)
  })
  test(`should passthrough with empty filter`, () => {
    const artifacts = {
      flower: [a[0], a[1], b[0], c[0], d[0]],
      plume: [a[0], b[0], c[0]],
      sand: [a[0], a[1], b[0]],
    }
    expect(artifactSetPermutations(artifacts, [])).toEqual([artifacts])
  })
  test(`should exclude unsatisfied permutations`, () => {
    const artifacts = {
      flower: [a[0], b[0], c[0]],
      plume: [a[1], b[1]],
      sand: [a[2], a[0], b[0]],
    }, filter = [{ key: "A", num: 2 }]
    const result = expect(artifactSetPermutations(artifacts, filter))
    result.toHaveLength(4)

    // Rewrite this if the items in each array, e.g. result[0].flower, is not expected to be stable.
    result.toContainEqual({ flower: [a[0]], plume: [a[1]], sand: [a[2], a[0]] }) // AAA
    result.toContainEqual({ flower: [a[0]], plume: [a[1]], sand: [b[0]] }) // AAO
    result.toContainEqual({ flower: [a[0]], plume: [b[1]], sand: [a[2], a[0]] }) // AOA
    result.toContainEqual({ flower: [b[0], c[0]], plume: [a[1]], sand: [a[2], a[0]] }) // OAA
  })
  test(`should yield nothing on unsatisfiable filter`, () => {
    const artifacts = {
      flower: [a[0], b[0]],
      plume: [a[0], b[0]],
      sand: [a[0], b[0]],
      clock: [c[0], d[0]],
    }
    const filter = [{ key: "A", num: 2 }, { key: "B", num: 2 }]
    expect(artifactSetPermutations(artifacts, filter)).toHaveLength(0)
  })
})
describe(`calculateTotalBuildNumber()`, () => {
  test(`should count all combinations`, () => {
    const artifacts = {
      flower: [a[0], a[1], b[0], c[0], d[0]],
      plume: [a[0], b[0], c[0]],
      sand: [a[0], a[1], b[0]],
    }
    const filter = [{ key: "A", num: 0 }, { key: "B", num: 0 }]
    expect(calculateTotalBuildNumber(artifacts, filter)).toEqual(5 * 3 * 3)
    expect(calculateTotalBuildNumber(artifacts, [])).toEqual(5 * 3 * 3)
    // COO, OCO, CCO
    expect(calculateTotalBuildNumber(artifacts, [{ key: "C", num: 1 }])).toEqual(1 * 2 * 3 + 4 * 1 * 3 + 1 * 1 * 3)
  })
})
describe(`artifactPermutations()`, () => {
  test(`should include all permutations`, () => {
    const artifacts = {
      flower: [a[0], a[1], b[0], c[0], d[0]],
      plume: [a[0], b[0], c[0]],
      sand: [a[0], a[1], b[0]],
    }
    const permutations = [], callback = (arg) => { permutations.push({ ...arg }) }
    artifactPermutations({ x: 0 }, artifacts, {}, callback)

    expect(permutations).toHaveLength(5 * 3 * 3)
    for (const flower of artifacts.flower)
      for (const plume of artifacts.plume)
        for (const sand of artifacts.sand)
          expect(permutations).toContainEqual({ flower, sand, plume })
  })
  test(`should correctly accumulate stats`, () => {
    const artifacts = {
      flower: [a[0], a[1]],
      plume: [a[0], b[0]],
      sand: [a[0], a[1]],
    }
    const permutations = [], callback = (arg, stat) => { permutations.push([{ ...arg }, { ...stat }]) }
    artifactPermutations({ x: 0 }, artifacts, {}, callback)

    expect(permutations).toContainEqual([{ flower: a[0], plume: b[0], sand: a[1] }, { x: 4 }])
  })
  test(`should apply artifact set effects`, () => {
    const artifacts = {
      flower: [a[0], c[0]],
      plume: [a[0], b[0]],
      sand: [a[0], a[1]],
      clock: [a[2], d[0]]
    }
    const permutations = [], callback = (arg, stat) => { permutations.push([{ ...arg }, { ...stat }]) }
    artifactPermutations({ x: 0, y: 0 }, artifacts, { "A": { 2: { x: 11 }, 4: { y: 7 } } }, callback)

    expect(permutations).toContainEqual([{ flower: c[0], plume: b[0], sand: a[1], clock: d[0] }, { x: 6, y: 0 }]) // no set
    expect(permutations).toContainEqual([{ flower: a[0], plume: b[0], sand: a[1], clock: a[2] }, { x: 7 + 11, y: 0 }]) // set 2
    expect(permutations).toContainEqual([{ flower: a[0], plume: a[0], sand: a[0], clock: a[2] }, { x: 6 + 11, y: 7 }]) // set 4
  })
  test(`should include sub-stats and mainStats`, () => {
    const a_ = { setKey: "A", mainStatKey: "other", mainStatVal: 2, substats: [{ key: "x", value: 1.2 }] }
    const artifacts = {
      flower: [a[0]],
      plume: [b[0]],
      sand: [a[0], a_, a[1]],
      clock: [a[2], d[0]]
    }
    const permutations = [], callback = (arg, stat) => { permutations.push([{ ...arg }, { ...stat }]) }
    artifactPermutations({ x: 0, other: 0 }, artifacts, [], callback)

    expect(permutations).toContainEqual([{ flower: a[0], plume: b[0], sand: a_, clock: d[0] }, { x: 4.2, other: 2 }])
  })
  test(`should use initial stats`, () => {
    const artifacts = {
      flower: [a[0]], plume: [b[0]], sand: [a[1]], clock: [d[0]]
    }
    const permutations = [], callback = (arg, stat) => { permutations.push([{ ...arg }, { ...stat }]) }
    artifactPermutations({ y: 2, x: 4 }, artifacts, [], callback)

    expect(permutations).toContainEqual([{ flower: a[0], plume: b[0], sand: a[1], clock: d[0] }, { x: 9, y: 2 }])
  })
})

describe('pruneArtifacts', () => {
  test('should keep incomparable artifacts', () => {
    const goodArtifact = [{
      id: 0, setKey: "x",
      mainStatKey: "stat1", mainStatVal: 10,
      substats: [{ key: "stat2", value: 20 },]
    }, {
      id: 1, setKey: "x",
      mainStatKey: "stat1", mainStatVal: 20,
      substats: [{ key: "stat2", value: 10 },]
    }, {
      id: 2, setKey: "x",
      mainStatKey: "irrelevant", mainStatVal: -10000,
      substats: [{ key: "stat2", value: 30 },]
    }]
    const badArtifact = [{
      // Worse than 0.
      id: 4, setKey: "x",
      mainStatKey: "irrelevant", mainStatVal: 10,
      substats: [{ key: "stat2", value: 15 },]
    }]
    const stats = new Set(["stat1", "stat2"])
    expect(pruneArtifacts([...goodArtifact, ...badArtifact], {}, stats, {})).toEqual(goodArtifact)
  })
  test('should only keep the "similar" artifact with the lowest id', () => {
    const goodArtifact = [{
      id: "0", setKey: "x",
      mainStatKey: "stat1", mainStatVal: 10,
      substats: [{ key: "stat2", value: 20 },]
    }, {
      id: "1", setKey: "x",
      mainStatKey: "stat1", mainStatVal: 10,
      substats: [{ key: "stat2", value: 20 },]
    }, {
      id: "2", setKey: "x",
      mainStatKey: "stat1", mainStatVal: 10,
      substats: [{ key: "stat2", value: 20 },]
    }]
    const stats = new Set(["stat1", "stat2"])
    expect(pruneArtifacts(goodArtifact, {}, stats, {})).toEqual([goodArtifact[0]])
  })
  test('should include set bonus', () => {
    const good = {
      id: 0, setKey: "x",
      mainStatKey: "stat1", mainStatVal: 10,
      substats: [{ key: "stat2", value: 20 },]
    }
    const goodFromSetEffect = {
      // But stat, 0 is better, but "y" set makes up for it
      id: 1, setKey: "y",
      mainStatKey: "stat1", mainStatVal: 5,
      substats: []
    }

    const artifactSetEffects = { y: { 4: { "stat2": 21 } } }
    const stats = new Set(["stat1", "stat2"])
    expect(pruneArtifacts([good, goodFromSetEffect], {}, stats, {})).toEqual([good])
    expect(pruneArtifacts([good, goodFromSetEffect], artifactSetEffects, stats, {})).toEqual([good, goodFromSetEffect])
  })
  test('should ignore irrelevant stats', () => {
    const good = {
      id: 0, setKey: "x",
      mainStatKey: "stat1", mainStatVal: 10,
      substats: [{ key: "stat2", value: 20 },]
    }
    const bad = {
      // But stat, 0 is better, but "y" set makes up for it
      id: 1, setKey: "y",
      mainStatKey: "stat1", mainStatVal: 5,
      substats: [{ key: { "irrelevant": 1000000 } }]
    }

    const stats = new Set(["stat1", "stat2"])
    expect(pruneArtifacts([good, bad], {}, stats, {})).toEqual([good])
  })
  test('should support ascending pruning', () => {
    const goodArtifact = [{
      id: 0, setKey: "x",
      mainStatKey: "stat1", mainStatVal: 10,
      substats: [{ key: "stat2", value: 20 },]
    }, {
      id: 1, setKey: "x",
      mainStatKey: "stat1", mainStatVal: 20,
      substats: [{ key: "stat2", value: 10 },]
    }, {
      id: 2, setKey: "x",
      mainStatKey: "irrelevant", mainStatVal: -10000,
      substats: [{ key: "stat2", value: 30 },]
    }]
    const badArtifact = [{
      // Worse than 0.
      id: 4, setKey: "x",
      mainStatKey: "irrelevant", mainStatVal: 10,
      substats: [{ key: "stat2", value: 21 },]
    }]
    const stats = new Set(["stat1", "stat2"])
    expect(pruneArtifacts([...goodArtifact, ...badArtifact], {}, stats, {})).toEqual(goodArtifact)
  })
  test('should reverse the order with enemy resistance', () => {
    const goodArtifact = [{
      id: 0, setKey: "x",
      mainStatKey: "cryo_enemyRes_", mainStatVal: 10,
      substats: []
    }]
    const badArtifact = [{
      id: 1, setKey: "x",
      mainStatKey: "cryo_enemyRes_", mainStatVal: 20,
      substats: []
    }]
    const stats = new Set(['cryo_enemyRes_'])
    expect(pruneArtifacts([...goodArtifact, ...badArtifact], {}, stats, {})).toEqual(goodArtifact)
  })
  test('should not cross prune artifacts with significant modifiers', () => {
    const modArtifact = [{
      id: 0, setKey: "EmblemOfSeveredFate",
      mainStatKey: "atk", mainStatVal: 10,
      substats: []
    }]
    const nonModArtifact = [{
      id: 1, setKey: "Adventurer",
      mainStatKey: "atk", mainStatVal: 11,
      substats: []
    }]
    const stats = new Set(["atk"])

    const setEffects1: ArtifactSetEffects = {
      EmblemOfSeveredFate: { 4: { modifiers: { atk: { b: 0 } } } }
    }
    expect(pruneArtifacts([...modArtifact, ...nonModArtifact], setEffects1, stats, {})).toEqual([...modArtifact, ...nonModArtifact])

    // non-significant modifiers
    const setEffects2: ArtifactSetEffects = {
      EmblemOfSeveredFate: { 4: { modifiers: { dmg_: { b: 0 } } } }
    }
    expect(pruneArtifacts([...modArtifact, ...nonModArtifact], setEffects2, stats, {})).toEqual(nonModArtifact)

  })
  test('should prune artifacts with modifiers in the same set', () => {
    const modArtifact = [{
      id: 0, setKey: "EmblemOfSeveredFate",
      mainStatKey: "atk", mainStatVal: 10,
      substats: []
    }]
    const betterArtifact = [{
      id: 1, setKey: "EmblemOfSeveredFate",
      mainStatKey: "atk", mainStatVal: 11,
      substats: []
    }]
    const setEffects1: ArtifactSetEffects = {
      EmblemOfSeveredFate: { 4: { modifiers: { atk: { b: 0 } } } }
    }
    const stats = new Set(["atk"])
    expect(pruneArtifacts([...modArtifact, ...betterArtifact], setEffects1, stats, {})).toEqual(betterArtifact)
  })
  test('should not prune artifacts with different modifiers', () => {
    const modArtifact1 = [{
      id: 0, setKey: "EmblemOfSeveredFate",
      mainStatKey: "atk", mainStatVal: 10,
      substats: []
    }]
    const modArtifact2 = [{
      id: 1, setKey: "EmblemOfSeveredFate1",
      mainStatKey: "atk", mainStatVal: 11,
      substats: []
    }]
    const setEffects1 = {
      EmblemOfSeveredFate: { 4: { modifiers: { atk: { b: 0 } } } },
      EmblemOfSeveredFate1: { 4: { modifiers: { atk: { b: 0 } } } }
    }
    const stats = new Set(["atk"])
    // We can't prune either artifact here. The set effects could go in any direction.
    expect(pruneArtifacts([...modArtifact1, ...modArtifact2], setEffects1, stats, {})).toEqual([...modArtifact1, ...modArtifact2])
  })
  test('should not prune artifact with non-numerical set effects', () => {
    const modArtifact = [{
      id: 0, setKey: "EmblemOfSeveredFate",
      mainStatKey: "atk", mainStatVal: 10,
      substats: []
    }]
    const nonModArtifact = [{
      id: 1, setKey: "Adventurer",
      mainStatKey: "atk", mainStatVal: 11,
      substats: []
    }]
    const stats = new Set(["atk", "infusionSelf"])

    const setEffects1: ArtifactSetEffects = {
      EmblemOfSeveredFate: { 4: { infusionSelf: "pyro" } }
    }
    expect(pruneArtifacts([...modArtifact, ...nonModArtifact], setEffects1, stats, {})).toEqual([...modArtifact, ...nonModArtifact])
  })
})

const stats = { characterKey: "electro-dude", hitMode: "avgHit", characterEle: "electro" }
describe('getTalentStatKey()', () => {
  test('should generate skill keys', () => {
    expect(getTalentStatKey("skill", stats)).toBe("electro_skill_avgHit")
    expect(getTalentStatKeyVariant("skill", stats)).toBe("electro")
  })
  test('should generate infusion', () => {
    expect(getTalentStatKey("normal", stats)).toBe("physical_normal_avgHit")
    expect(getTalentStatKeyVariant("normal", stats)).toBe("physical")

    expect(getTalentStatKey("normal", { ...stats, infusionAura: "cryo" })).toBe("cryo_normal_avgHit")
    expect(getTalentStatKeyVariant("normal", { ...stats, infusionAura: "cryo" })).toBe("cryo")

    expect(getTalentStatKey("normal", { ...stats, infusionSelf: "electro" })).toBe("electro_normal_avgHit")
    expect(getTalentStatKeyVariant("normal", { ...stats, infusionSelf: "electro" })).toBe("electro")

    expect(getTalentStatKey("normal", { ...stats, infusionAura: "cryo", infusionSelf: "electro" })).toBe("electro_normal_avgHit")
    expect(getTalentStatKeyVariant("normal", { ...stats, infusionAura: "cryo", infusionSelf: "electro" })).toBe("electro")
  })

  test('should override element', () => {
    expect(getTalentStatKey("normal", stats, "electro")).toBe("electro_normal_avgHit")
    expect(getTalentStatKeyVariant("normal", stats, "electro")).toBe("electro")
    expect(getTalentStatKey("burst", stats, "physical")).toBe("physical_burst_avgHit")
    expect(getTalentStatKeyVariant("burst", stats, "physical")).toBe("physical")
  })
  test('should do elemental', () => {
    expect(getTalentStatKey("pyro", stats)).toBe("pyro_elemental_avgHit")
    expect(getTalentStatKeyVariant("pyro", stats)).toBe("pyro")

    expect(getTalentStatKey("elemental", stats)).toBe("electro_elemental_avgHit")
    expect(getTalentStatKeyVariant("elemental", stats)).toBe("electro")
  })
  test('should not do amp.reactions with wrong element', () => {
    //normal without infusion
    expect(getTalentStatKey("normal", { ...stats, reactionMode: "pyro_melt" })).toBe("physical_normal_avgHit")
    expect(getTalentStatKeyVariant("normal", { ...stats, reactionMode: "pyro_melt" })).toBe("physical")

    //normal with infusion
    expect(getTalentStatKey("normal", { ...stats, reactionMode: "pyro_melt", infusionAura: "cryo" })).toBe("cryo_normal_avgHit")
    expect(getTalentStatKeyVariant("normal", { ...stats, reactionMode: "pyro_melt", infusionAura: "cryo" })).toBe("cryo")

    //normal with override
    expect(getTalentStatKey("normal", { ...stats, reactionMode: "pyro_melt" }, "electro")).toBe("electro_normal_avgHit")
    expect(getTalentStatKeyVariant("normal", { ...stats, reactionMode: "pyro_melt" }, "electro")).toBe("electro")

    //skill
    expect(getTalentStatKey("skill", { ...stats, reactionMode: "pyro_melt" })).toBe("electro_skill_avgHit")
    expect(getTalentStatKeyVariant("skill", { ...stats, reactionMode: "pyro_melt" })).toBe("electro")

    //elemental
    expect(getTalentStatKey("elemental", { ...stats, reactionMode: "pyro_melt" })).toBe("electro_elemental_avgHit")
    expect(getTalentStatKeyVariant("elemental", { ...stats, reactionMode: "pyro_melt" })).toBe("electro")

    //overwrite
    expect(getTalentStatKey("burst", { ...stats, reactionMode: "pyro_melt" }, "pyro")).toBe("pyro_melt_burst_avgHit")
    expect(getTalentStatKeyVariant("burst", { ...stats, reactionMode: "pyro_melt" }, "pyro")).toBe("melt")
  })
  test('should do amp.reactions with wrong element', () => {
    //normal without infusion
    expect(getTalentStatKey("normal", { ...stats, characterEle: "pyro", reactionMode: "pyro_melt" })).toBe("physical_normal_avgHit")
    expect(getTalentStatKeyVariant("normal", { ...stats, characterEle: "pyro", reactionMode: "pyro_melt" })).toBe("physical")

    //normal with infusion
    expect(getTalentStatKey("normal", { ...stats, characterEle: "pyro", reactionMode: "pyro_melt", infusionAura: "cryo" })).toBe("cryo_normal_avgHit")
    expect(getTalentStatKeyVariant("normal", { ...stats, characterEle: "pyro", reactionMode: "pyro_melt", infusionAura: "cryo" })).toBe("cryo")

    //normal with override
    expect(getTalentStatKey("normal", { ...stats, characterEle: "pyro", reactionMode: "pyro_melt" }, "pyro")).toBe("pyro_melt_normal_avgHit")
    expect(getTalentStatKeyVariant("normal", { ...stats, characterEle: "pyro", reactionMode: "pyro_melt" }, "pyro")).toBe("melt")

    //skill
    expect(getTalentStatKey("skill", { ...stats, characterEle: "pyro", reactionMode: "pyro_melt" })).toBe("pyro_melt_skill_avgHit")
    expect(getTalentStatKeyVariant("skill", { ...stats, characterEle: "pyro", reactionMode: "pyro_melt" })).toBe("melt")

    //elemental
    expect(getTalentStatKey("elemental", { ...stats, characterEle: "pyro", reactionMode: "pyro_melt" })).toBe("pyro_melt_elemental_avgHit")
    expect(getTalentStatKeyVariant("elemental", { ...stats, characterEle: "pyro", reactionMode: "pyro_melt" })).toBe("melt")
  })
})