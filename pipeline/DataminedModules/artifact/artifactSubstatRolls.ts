import artifactSubstatData from "./artifactSubstat";

const rollsForRarity = { 3: 2, 4: 4, 5: 6, }

function roll(currentRolls: number[], possibleRolls: number[], remaining: number, output: { [value: string]: number[][] }) {
  const value = Math.round(currentRolls.reduce((a, b) => a + possibleRolls[b], 0))
  if (value in output) {
    if (!output[value].find((x) => x.length === currentRolls.length))
      output[value].push([...currentRolls])
  } else output[value] = [[...currentRolls]]

  if (remaining === 0)
    return

  const lastRoll = currentRolls.length && currentRolls[currentRolls.length - 1]
  possibleRolls.forEach((_, index) => {
    if (index < lastRoll) return

    currentRolls.push(index)
    roll(currentRolls, possibleRolls, remaining - 1, output)
    currentRolls.pop()
  })
}
function getRolls(key: string, possibleRolls: number[], maxRolls: number): { [value: number]: number[][] } {
  const output: { [value: string]: number[][] } = {}
  if (key.endsWith('_')) // TODO: % CONVERSION
    roll([], possibleRolls.map(k => k * 1000), maxRolls, output)
  else roll([], possibleRolls, maxRolls, output)
  delete output["0"]
  return output
}
const artifactSubstatRollData = Object.fromEntries(Object.entries(rollsForRarity).map(([rarity, maxRolls]) =>
  [rarity, Object.fromEntries(Object.entries(artifactSubstatData[rarity]).map(([statKey, rolls]: [string, number[]]) =>
    [statKey, getRolls(statKey, rolls, maxRolls)]))]))

export default artifactSubstatRollData
