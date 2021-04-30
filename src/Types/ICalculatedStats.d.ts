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
  equippedArtifacts: object //TODO: when is this considered attached?
  setToSlots: object//TODO: type
  weaponType: string
}

type ConditionalValues = {
  artifact?: any
  character?: any
  weapon?: any
}
