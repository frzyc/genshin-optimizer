export default interface CalculatedStats {
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
  conditionalValues: object
}