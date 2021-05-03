import { HitModeKey } from "./consts";
export default interface ICalculatedStats {
  characterKey: string
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
  modifiers?: object
  equippedArtifacts?: StrictDict<SlotKey, string>
  setToSlots: object//TODO: type
  weaponType: string
  hitMode: HitModeKey
  reactionMode: reactionModeKey | null

  finalHP: number
}

type ConditionalValues = {
  artifact?: any
  character?: any
  weapon?: any
}
