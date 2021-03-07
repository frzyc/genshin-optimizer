let CharacterData = {}
let CharacterDataImport = import('./Characters')
CharacterDataImport.then(imp => {
  CharacterData = imp.default
  CharacterDataImport = null
})
// import characters from 
const LevelsData = {
  "L1": {
    name: "Lv. 1",
    level: 1,
    asend: 0
  },
  "L20": {
    name: "Lv. 20",
    level: 20,
    asend: 0
  },
  "L20A": {
    name: "Lv. 20 As.1",
    level: 20,
    asend: 1

  },
  "L40": {
    name: "Lv. 40",
    level: 40,
    asend: 1
  },
  "L40A": {
    name: "Lv. 40 As.2",
    level: 40,
    asend: 2
  },

  "L50": {
    name: "Lv. 50",
    level: 50,
    asend: 2
  },
  "L50A": {
    name: "Lv. 50 As.3",
    level: 50,
    asend: 3
  },
  "L60": {
    name: "Lv. 60",
    level: 60,
    asend: 3
  },
  "L60A": {
    name: "Lv. 60 As.4",
    level: 60,
    asend: 4
  },
  "L70": {
    name: "Lv. 70",
    level: 70,
    asend: 4
  },
  "L70A": {
    name: "Lv. 70 As.5",
    level: 70,
    asend: 5
  },

  "L80": {
    name: "Lv. 80",
    level: 80,
    asend: 5
  },
  "L80A": {
    name: "Lv. 80 As.6",
    level: 80,
    asend: 6
  },
  "L90": {
    name: "Lv. 90",
    level: 90,
    asend: 6
  }

}
const characterStatBase = {
  critRate_: 5,
  critDMG_: 50,
  enerRech_: 100,
  stamina: 100
}
const CharacterSpecializedStatKey = ["hp_", "atk_", "def_", "eleMas", "enerRech_", "heal_", "critRate_", "critDMG_", "physical_dmg_", "anemo_dmg_", "geo_dmg_", "electro_dmg_", "hydro_dmg_", "pyro_dmg_", "cryo_dmg_"]

export {
  LevelsData,
  characterStatBase,
  CharacterData,
  CharacterDataImport,
  CharacterSpecializedStatKey
}