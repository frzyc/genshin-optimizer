import ImgIcon from "../Components/Image/ImgIcon";
import { Translate } from "../Components/Translate";
import { mergeData } from "../Formula/api";
import { Data } from "../Formula/type";
import { IArtifactSheet, SetEffectEntry } from "../Types/artifact_WR";
import { allSlotKeys, ArtifactRarity, ArtifactSetKey, SetNum, SlotKey } from "../Types/consts";
import { objectMap } from "../Util/Util";

// TODO: remove typecasting once all sheets populated
const artifactSheets = import("../Data/Artifacts/index_WR").then(imp => objectMap(imp.default, (artifact, key) => new ArtifactSheet(key, artifact.default, artifact.data))) as Promise<Record<ArtifactSetKey, ArtifactSheet>>

const tr = (setKey: string, strKey: string) => <Translate ns={`artifact_${setKey}_gen`} key18={strKey} />
const allData = artifactSheets.then(as => mergeData(Object.values(as).map(s => s.data)))
export class ArtifactSheet {
  readonly sheet: IArtifactSheet
  readonly key: ArtifactSetKey
  readonly data: Data
  constructor(setKey: ArtifactSetKey, sheet: IArtifactSheet, data: Data) {
    this.sheet = sheet
    this.key = setKey
    this.data = data
  }

  get name() { return tr(this.key, "setName") }
  get defIconSrc() {
    const slotKey = this.slots[0]
    if (!this.slotIcons[slotKey]) return undefined
    return this.slotIcons[slotKey]
  }
  /**
   * @deprecated use src directly
   */
  get nameWithIcon() {
    const slotKey = this.slots[0]
    return <span><ImgIcon src={this.slotIcons[slotKey]} /> {tr(this.key, "setName")}</span>
  }

  //This is only for OCR, because we only scan in english right now.
  get nameRaw(): string { return this.sheet.name }
  get rarity(): readonly ArtifactRarity[] { return this.sheet.rarity }
  get slots(): SlotKey[] {
    switch (this.key) {
      case "PrayersForDestiny":
      case "PrayersForIllumination":
      case "PrayersForWisdom":
      case "PrayersToSpringtime": return ["circlet"]
      default: return [...allSlotKeys]
    }
  }
  get slotIcons(): Dict<SlotKey, string> { return this.sheet.icons }
  get setEffects(): Dict<SetNum, SetEffectEntry> { return this.sheet.setEffects }
  getSlotName = (slotKey: SlotKey) => tr(this.key, `pieces.${slotKey}.name`)
  getSlotDesc = (slotKey: SlotKey) => tr(this.key, `pieces.${slotKey}.desc`)
  setEffectDesc = (setNum: SetNum): Displayable => tr(this.key, `setEffects.${setNum}`)
  setEffectDocument = (setNum: SetNum) => this.sheet.setEffects[setNum]?.document

  static get(set: ArtifactSetKey | undefined): Promise<ArtifactSheet> | undefined { return set ? artifactSheets.then(a => a[set]) : undefined }
  static get getAll() { return artifactSheets }
  static get getAllData() { return allData }
  static setKeysByRarities(sheets: StrictDict<ArtifactSetKey, ArtifactSheet>): Dict<ArtifactRarity, ArtifactSetKey[]> {
    const grouped: Dict<ArtifactRarity, ArtifactSetKey[]> = {}
    Object.entries(sheets).forEach(([key, sheet]) => {
      const rarity = Math.max(...sheet.rarity) as ArtifactRarity
      if (grouped[rarity]) grouped[rarity]!.push(key)
      else grouped[rarity] = [key]
    })
    return grouped
  }

  static setEffects(sheets: StrictDict<ArtifactSetKey, ArtifactSheet>, setToSlots: [ArtifactSetKey, number][]) {
    let artifactSetEffect: [ArtifactSetKey, SetNum[]][] = []
    setToSlots.forEach(([set, slots]) => {
      if (!slots) return
      let setNum = Object.keys(sheets[set]?.setEffects ?? {})
        .map(setNum => parseInt(setNum) as SetNum)
        .filter(setNum => setNum <= slots)
      if (setNum.length)
        artifactSetEffect.push([set, setNum])
    })
    return artifactSetEffect
  }
}
