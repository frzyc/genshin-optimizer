import { IArtifactSheet, SetEffectEntry, StatArr, StatDict } from "../Types/artifact";
import { allArtifactSets, allRarities, ArtifactSetKey, Rarity, SetNum, SlotKey } from "../Types/consts";
import ICalculatedStats from "../Types/ICalculatedStats";
import { IConditionals } from "../Types/IConditional";
import { deepClone, evalIfFunc } from "../Util/Util";

export const artifactImport = import("../Data/Artifacts").then(imp =>
  Object.fromEntries(Object.entries(imp.default).map(([set, value]) =>
    [set, new ArtifactSheet(value)])) as StrictDict<ArtifactSetKey, ArtifactSheet>)
const promiseSheets = Object.fromEntries(allArtifactSets.map(set =>
  [set, artifactImport.then(sheets => sheets[set])])) as StrictDict<ArtifactSetKey, Promise<ArtifactSheet>>

export class ArtifactSheet {
  readonly data: IArtifactSheet
  constructor(data: IArtifactSheet) { this.data = data }

  get name(): string { return this.data.name }
  get rarity(): readonly Rarity[] { return this.data.rarity }
  get slotNames(): Dict<SlotKey, string> { return this.data.pieces }
  get slotIcons(): Dict<SlotKey, string> { return this.data.icons }
  get setEffects(): Dict<SetNum, SetEffectEntry> { return this.data.setEffects }
  get conditionals(): IConditionals | undefined { return this.data.conditionals }
  setNumStats(num: SetNum, stats: ICalculatedStats): StatDict {
    return deepClone(evalIfFunc(this.setEffects[num]?.stats, stats) || {})
  }
  setEffectTexts(setNum: SetNum, stats: ICalculatedStats): Displayable {
    let text = this.setEffects[setNum]?.text
    return evalIfFunc(text ?? "", stats)
  }
  setEffectConditionals(setNum: SetNum, stats: ICalculatedStats) {
    const effects = this.setEffects[setNum]
    if (effects?.conditional || effects?.conditionals) {
      return {
        ...effects?.conditional && { default: effects?.conditional },
        ...effects?.conditionals && effects?.conditionals
      }
    }
    return undefined
  }

  static getAll() { return artifactImport }
  static get(set: ArtifactSetKey | undefined): Promise<ArtifactSheet> | undefined { return set && promiseSheets[set] }

  static namesByMaxRarities(sheets: StrictDict<ArtifactSetKey, ArtifactSheet>): [Rarity, [ArtifactSetKey, string][]][] {
    const grouped: Dict<Rarity, [ArtifactSetKey, string][]> = {}
    Object.entries(sheets).forEach(([key, sheet]) => {
      const rarity = Math.max(...sheet.rarity) as Rarity
      if (grouped[rarity]) grouped[rarity]!.push([key, sheet.name])
      else grouped[rarity] = [[key, sheet.name]]
    })
    return allRarities.map(rarity => [rarity, grouped[rarity] ?? []] as [Rarity, [ArtifactSetKey, string][]]).filter(([, group]) => group.length)
  }
  static setsWithMaxRarity(sheets: StrictDict<ArtifactSetKey, ArtifactSheet>, rarity: Rarity): [ArtifactSetKey, ArtifactSheet][] {
    return Object.entries(sheets).filter(([, sheet]) => Math.max(...sheet.rarity) === rarity)
  }
  static setEffectsStats(sheets: StrictDict<ArtifactSetKey, ArtifactSheet>, charStats: ICalculatedStats, setToSlots: Dict<ArtifactSetKey, SlotKey[]>): StatArr {
    let artifactSetEffect: StatArr = []
    Object.entries(setToSlots).forEach(([set, slots]) =>
      Object.entries(sheets[set]?.setEffects ?? {}).forEach(([num, value]) =>
        parseInt(num) <= slots.length && Object.entries(evalIfFunc(value.stats, charStats) ?? {}).forEach(([key, value]) =>
          artifactSetEffect.push({ key, value }))))
    return artifactSetEffect
  }
  static setEffects(sheets: StrictDict<ArtifactSetKey, ArtifactSheet>, setToSlots: Dict<ArtifactSetKey, SlotKey[]>) {
    let artifactSetEffect: Dict<ArtifactSetKey, SetNum[]> = {}
    Object.entries(setToSlots).forEach(([set, slots]) => {
      let setNum = Object.keys(sheets[set]?.setEffects ?? {})
        .map(setNum => parseInt(setNum) as SetNum)
        .filter(setNum => setNum <= slots.length)
      if (setNum.length)
        artifactSetEffect[set] = setNum
    })
    return artifactSetEffect
  }
}