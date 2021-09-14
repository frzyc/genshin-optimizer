import { Image } from "react-bootstrap";
import { Translate } from "../Components/Translate";
import { IArtifactSheet, SetEffectEntry } from "../Types/artifact";
import { allArtifactSets, allSlotKeys, ArtifactRarity, ArtifactSetKey, SetNum, SlotKey } from "../Types/consts";
import { IConditionals } from "../Types/IConditional";
import { BonusStats, ICalculatedStats } from "../Types/stats";
import { mergeStats } from "../Util/StatUtil";
import { deepClone, evalIfFunc, objectFromKeyMap } from "../Util/Util";

export const artifactImport = import("../Data/Artifacts").then(imp =>
  Object.fromEntries(Object.entries(imp.default).map(([set, value]) =>
    [set, new ArtifactSheet(value, set)])) as StrictDict<ArtifactSetKey, ArtifactSheet>)
const promiseSheets = objectFromKeyMap(allArtifactSets, set => artifactImport.then(sheets => sheets[set]))

const tr = (setKey: string, strKey: string) => <Translate ns={`artifact_${setKey}_gen`} key18={strKey} />

export class ArtifactSheet {
  readonly data: IArtifactSheet
  readonly key: ArtifactSetKey
  constructor(data: IArtifactSheet, setKey: ArtifactSetKey) {
    this.data = data
    this.key = setKey
  }

  get name() { return tr(this.key, "setName") }
  get nameWithIcon() {
    const slotKey = this.slots[0]
    return <span><Image src={this.slotIcons[slotKey]} className="inline-icon" /> {tr(this.key, "setName")}</span>
  }

  //This is only for OCR, because we only scan in english right now.
  get nameRaw(): string { return this.data.name }
  get rarity(): readonly ArtifactRarity[] { return this.data.rarity }
  get slots(): SlotKey[] {
    switch (this.key) {
      case "PrayersForDestiny":
      case "PrayersForIllumination":
      case "PrayersForWisdom":
      case "PrayersToSpringtime": return ["circlet"]
      default: return deepClone(allSlotKeys) as any
    }
  }
  get slotIcons(): Dict<SlotKey, string> { return this.data.icons }
  get setEffects(): Dict<SetNum, SetEffectEntry> { return this.data.setEffects }
  get conditionals(): IConditionals | undefined { return this.data.conditionals }
  getSlotName = (slotKey: SlotKey) => tr(this.key, `pieces.${slotKey}.name`)
  getSlotDesc = (slotKey: SlotKey) => tr(this.key, `pieces.${slotKey}.desc`)
  setNumStats(num: SetNum, stats: ICalculatedStats): BonusStats {
    return deepClone(evalIfFunc(this.setEffects[num]?.stats, stats) || {})
  }
  setEffectDesc = (setNum: SetNum): Displayable => tr(this.key, `setEffects.${setNum}`)
  setEffectDocument = (setNum: SetNum) => this.data.setEffects[setNum]?.document

  static getAll() { return artifactImport }
  static get(set: ArtifactSetKey | undefined): Promise<ArtifactSheet> | undefined { return set && promiseSheets[set] }

  static setKeysByRarities(sheets: StrictDict<ArtifactSetKey, ArtifactSheet>): Dict<ArtifactRarity, ArtifactSetKey[]> {
    const grouped: Dict<ArtifactRarity, ArtifactSetKey[]> = {}
    Object.entries(sheets).forEach(([key, sheet]) => {
      const rarity = Math.max(...sheet.rarity) as ArtifactRarity
      if (grouped[rarity]) grouped[rarity]!.push(key)
      else grouped[rarity] = [key]
    })
    return grouped
  }

  static setsWithMaxRarity(sheets: StrictDict<ArtifactSetKey, ArtifactSheet>, rarity: ArtifactRarity): [ArtifactSetKey, ArtifactSheet][] {
    return Object.entries(sheets).filter(([, sheet]) => Math.max(...sheet.rarity) === rarity)
  }
  static setEffectsStats(sheets: StrictDict<ArtifactSetKey, ArtifactSheet>, charStats: ICalculatedStats, setToSlots: Dict<ArtifactSetKey, SlotKey[]>): BonusStats {
    const artifactSetEffect: BonusStats = {}
    Object.entries(setToSlots).forEach(([set, slots]) =>
      Object.entries(sheets[set]?.setEffects ?? {}).forEach(([num, value]) =>
        parseInt(num) <= slots.length && mergeStats(artifactSetEffect, evalIfFunc(value.stats, charStats))))
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