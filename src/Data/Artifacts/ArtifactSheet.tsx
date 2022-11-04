import ImgIcon from "../../Components/Image/ImgIcon";
import SqBadge from "../../Components/SqBadge";
import { Translate } from "../../Components/Translate";
import { input } from "../../Formula";
import { mergeData } from "../../Formula/api";
import { Data } from "../../Formula/type";
import { UIData } from "../../Formula/uiData";
import { allArtifactSets, allSlotKeys, ArtifactRarity, ArtifactSetKey, SetNum, SlotKey } from "../../Types/consts";
import { DocumentSection, IDocumentHeader } from "../../Types/sheet";
import { st } from "../SheetUtil";

// TODO: remove typecasting once all sheets populated
const artifactSheets = import(".").then(imp => imp.default)

export interface IArtifactSheet {
  name: string, // only to stored the English name for OCR, otherwise, should come from localization pipeline
  rarity: readonly ArtifactRarity[],
  icons: Dict<SlotKey, string>,
  setEffects: Dict<SetNum, SetEffectEntry>
}
export interface SetEffectEntry {
  document: DocumentSection[],
}

export type AllArtifactSheets = (setKey: ArtifactSetKey) => ArtifactSheet
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
  get tr() { return ArtifactSheet.tr(this.key) }

  get name() { return this.tr("setName") }
  get defIconSrc() {
    const slotKey = this.slots[0]
    if (!this.slotIcons[slotKey]) return undefined
    return this.slotIcons[slotKey]
  }
  get defIcon() { return <ImgIcon src={this.defIconSrc} sx={{ fontSize: "1.5em" }} /> }
  get setName() { return this.tr("setName") }
  /**
   * @deprecated use src directly
   */
  get nameWithIcon() {
    const slotKey = this.slots[0]
    return <span><ImgIcon src={this.slotIcons[slotKey]} /> {this.tr("setName")}</span>
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
  getSlotName = (slotKey: SlotKey) => this.tr(`pieces.${slotKey}.name`)
  getSlotDesc = (slotKey: SlotKey) => this.tr(`pieces.${slotKey}.desc`)
  setEffectDesc = (setNum: SetNum): Displayable => this.tr(`setEffects.${setNum}`)
  setEffectDocument = (setNum: SetNum) => this.sheet.setEffects[setNum]?.document
  static trm(setKey: ArtifactSetKey) { return (strKey: string) => <Translate ns={`artifact_${setKey}`} key18={strKey} /> }
  static tr(setKey: string) { return (strKey: string) => <Translate ns={`artifact_${setKey}_gen`} key18={strKey} /> }
  static get(set: ArtifactSetKey | undefined): Promise<ArtifactSheet> | undefined { return set ? artifactSheets.then(a => a[set]) : undefined }
  static get getAll(): Promise<AllArtifactSheets> { return artifactSheets.then(as => (setKey: ArtifactSetKey): ArtifactSheet => as[setKey]) }
  static get getAllData() { return allData }
  static setKeysByRarities(sheets: AllArtifactSheets): Dict<ArtifactRarity, ArtifactSetKey[]> {
    const grouped: Dict<ArtifactRarity, ArtifactSetKey[]> = {}
    allArtifactSets.forEach(setKey => {
      const sheet = sheets(setKey)
      const rarity = Math.max(...sheet.rarity) as ArtifactRarity
      if (grouped[rarity]) grouped[rarity]!.push(setKey)
      else grouped[rarity] = [setKey]
    })
    return grouped
  }

  static setEffects(sheets: AllArtifactSheets, data: UIData) {
    const artifactSetEffect: Partial<Record<ArtifactSetKey, SetNum[]>> = {}
    allArtifactSets.forEach(setKey => {
      const sheet = sheets(setKey)
      const setNums = (Object.keys(sheet.setEffects).map(k => parseInt(k)) as SetNum[]).filter(sn => sheet.hasEnough(sn, data))
      if (setNums.length) artifactSetEffect[setKey] = setNums
    })
    return artifactSetEffect
  }
  hasEnough = (setNum: SetNum, data: UIData) => (data.get(input.artSet[this.key]).value ?? 0) >= setNum
}
export const setHeaderTemplate = (setKey: ArtifactSetKey, icons: Partial<Record<SlotKey, string>>): ((setNum: SetNum) => IDocumentHeader) => {
  const tr = (strKey: string) => <Translate ns={`artifact_${setKey}_gen`} key18={strKey} />
  return (setNum: SetNum) => ({
    title: tr("setName"),
    icon: <ImgIcon size={2} sx={{ m: -1 }} src={icons.flower ?? icons.circlet ?? ""} />,
    action: <SqBadge color="success">{st(`${setNum}set`)}</SqBadge>,
    description: tr(`setEffects.${setNum}`)
  })
}
