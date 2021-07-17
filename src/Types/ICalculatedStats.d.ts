import { ElementKey, HitModeKey } from "./consts";
export default interface ICalculatedStats {
  characterKey: string
  characterEle: ElementKey
  characterLevel: number
  weapon: {
    key: string;
    refineIndex: number;
  },
  constellation: number;
  ascension: number;
  tlvl: {
    auto: number;
    skill: number;
    burst: number;
  },
  conditionalValues: ConditionalValues
  mainStatAssumptionLevel: number
  modifiers?: Modifier
  equippedArtifacts?: StrictDict<SlotKey, string>
  setToSlots: object // TODO: type
  weaponType: string
  hitMode: HitModeKey
  reactionMode: reactionModeKey | null
  infusionAura: ElementKey | ""
  infusionSelf?: ElementKey
  finalHP: number
}

type ConditionalValues = {
  artifact?: any
  character?: any
  weapon?: any
}

interface Modifier {
  [key: string]: {
    [key: string]: number
  }
}