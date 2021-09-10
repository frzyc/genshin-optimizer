//Utility functionst to take data from datamined _gen.json data.
//TODO: when we decide to use decimals instead of percent, this function needs to be changed. I
//TODO: Ideaily, we retain the most accurate number in the src code, and do this toFixed on UI. 
export function toTalentPercent(arr: number[]): number[] {
  return arr.map(d => parseFloat((d * 100).toFixed(2)))
}

export function toTalentInt(arr: number[]): number[] {
  return arr.map(d => parseInt(d.toFixed()))
}
export function singleToTalentPercent(num) {
  return parseFloat((num * 100).toFixed(2))
}