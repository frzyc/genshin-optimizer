import characters from './Characters'
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
  crit_rate: 5,
  crit_dmg: 50,
  ener_rech: 100,
  stam: 100
}
const CharacterSpecializedStatKey = ["hp_", "atk_", "def_", "ele_mas", "ener_rech", "heal_bonu", "crit_rate", "crit_dmg", "phy_dmg", "anemo_ele_dmg", "geo_ele_dmg", "electro_ele_dmg", "hydro_ele_dmg", "pyro_ele_dmg", "cryo_ele_dmg"]

export {
  LevelsData,
  characterStatBase,
  characters as CharacterData,
  CharacterSpecializedStatKey
}