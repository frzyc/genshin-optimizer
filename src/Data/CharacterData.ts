// import characters from

const ascensionMaxLevel = [20, 40, 50, 60, 70, 80, 90] as const

const milestoneLevels = [
  [90, 6],
  [80, 6],
  [80, 5],
  [70, 5],
  [70, 4],
  [60, 4],
  [60, 3],
  [50, 3],
  [50, 2],
  [40, 2],
  [40, 1],
  [20, 1],
  [20, 0],
  [1, 0]
] as const

const characterStatBase = {
  critRate_: 5,
  critDMG_: 50,
  enerRech_: 100,
  stamina: 100
} as const

export {
  ascensionMaxLevel,
  characterStatBase,
  milestoneLevels
}