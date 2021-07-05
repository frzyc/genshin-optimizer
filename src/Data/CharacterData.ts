// import characters from

const ascensionMaxLevel = [20, 40, 50, 60, 70, 80, 90] as const
const characterStatBase = {
  critRate_: 5,
  critDMG_: 50,
  enerRech_: 100,
  stamina: 100
} as const

export {
  ascensionMaxLevel,
  characterStatBase,
}