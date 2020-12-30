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

//https://docs.google.com/spreadsheets/d/1x7nq-6dREJmt8nASPBm0xIF1WgXu1jNimFh5WQy53IA/edit?usp=sharing
const CharacterData = {
  amber: {
    name: "Amber",
    star: 4,
    elementKey: "pyro",
    weaponTypeKey: "bow",
    gender: "F",
    constellationName: "Lepus",
    titles: ["Outrider", "Champion Glider"],
    baseStat: {
      hp: [793, 2038, 2630, 3940, 4361, 5016, 5578, 6233, 6654, 7309, 7730, 8385, 8806, 9461],
      atk: [19, 48, 62, 93, 103, 118, 131, 147, 157, 172, 182, 198, 208, 223],
      def: [50, 129, 167, 250, 277, 318, 354, 396, 423, 464, 491, 532, 559, 601]
    },
    specializeStat: {
      key: "atk_",
      value: [0, 0, 0, 0, 6, 6, 12, 12, 12, 12, 18, 18, 24, 24]
    },
    talent: {
      auto: {},
      skill: {},
      burst: {}
    }
  },
  barbara: {
    name: "Barbara",
    star: 4,
    elementKey: "hydro",
    weaponTypeKey: "catalyst",
    gender: "F",
    constellationName: "Crater",
    titles: ["Shining Idol", "Deaconess"],
    baseStat: {
      hp: [821, 2108, 2721, 4076, 4512, 5189, 5770, 6448, 6884, 7561, 7996, 8674, 9110, 9787],
      atk: [13, 34, 44, 66, 73, 84, 94, 105, 112, 123, 130, 141, 148, 159],
      def: [56, 144, 186, 279, 308, 355, 394, 441, 470, 517, 546, 593, 623, 669]
    },
    specializeStat: {
      key: "hp_",
      value: [0, 0, 0, 0, 6, 6, 12, 12, 12, 12, 18, 18, 24, 24]
    },
    talent: {
      auto: {},
      skill: {},
      burst: {}
    }
  },
  beidou: {
    name: "Beidou",
    star: 4,
    elementKey: "electro",
    weaponTypeKey: "claymore",
    gender: "F",
    constellationName: "Victor Mare",
    titles: ["Uncrowned Lord of Ocean", "Queen of the Crux Fleet"],
    baseStat: {
      hp: [1094, 2811, 3628, 5435, 6015, 6919, 7694, 8597, 9178, 10081, 10662, 11565, 12146, 13050],
      atk: [19, 49, 63, 94, 104, 119, 133, 148, 158, 174, 184, 200, 210, 225],
      def: [54, 140, 180, 270, 299, 344, 382, 427, 456, 501, 530, 575, 603, 648]
    },
    specializeStat: {
      key: "electro_ele_dmg",
      value: [0, 0, 0, 0, 6, 6, 12, 12, 12, 12, 18, 18, 24, 24]
    },
    talent: {
      auto: {},
      skill: {},
      burst: {}
    }
  },
  bennett: {
    name: "Bennett",
    star: 4,
    elementKey: "pyro",
    weaponTypeKey: "sword",
    gender: "M",
    constellationName: "Rota Calamitas",
    titles: ["Trial by Fire", "Leader of Benny's Adventure Team"],
    baseStat: {
      hp: [1039, 2670, 3447, 5163, 5715, 6573, 7309, 8168, 8719, 9577, 10129, 10987, 11539, 12397],
      atk: [16, 41, 53, 80, 88, 101, 113, 126, 134, 148, 156, 169, 178, 191],
      def: [65, 166, 214, 321, 356, 409, 455, 508, 542, 596, 630, 684, 718, 771]
    },
    specializeStat: {
      key: "ener_rech",
      value: [0, 0, 0, 0, 6.7, 6.7, 13.3, 13.3, 13.3, 13.3, 20, 20, 26.7, 26.7]
    },
    talent: {
      auto: {},
      skill: {},
      burst: {}
    }
  },
  chongyun: {
    name: "Chongyun",
    star: 4,
    elementKey: "cryo",
    weaponTypeKey: "claymore",
    gender: "M",
    constellationName: "Nubis Caesor",
    titles: ["Frozen Ardor", "Banisher of Evil and Rumors Thereof"],
    baseStat: {
      hp: [921, 2366, 3054, 4574, 5063, 5824, 6475, 7236, 7725, 8485, 8974, 9734, 10223, 10984],
      atk: [19, 48, 62, 93, 103, 119, 131, 147, 157, 172, 182, 198, 208, 223],
      def: [54, 140, 180, 270, 299, 344, 382, 427, 456, 501, 530, 575, 603, 648]
    },
    specializeStat: {
      key: "atk_",
      value: [0, 0, 0, 0, 6, 6, 12, 12, 12, 12, 18, 18, 24, 24]
    },
    talent: {
      auto: {},
      skill: {},
      burst: {}
    }
  },
  diluc: {
    name: "Diluc",
    star: 5,
    elementKey: "pyro",
    weaponTypeKey: "claymore",
    gender: "M",
    constellationName: "Noctua",
    titles: ["The Dark Side of Dawn", "Darknight Hero", "The Uncrowned King of Mondstadt"],
    baseStat: {
      hp: [1011, 2621, 3488, 5219, 5834, 6712, 7533, 8421, 9036, 9932, 10547, 11453, 12068, 12981],
      atk: [26, 68, 90, 135, 151, 173, 194, 217, 233, 256, 272, 295, 311, 335],
      def: [61, 158, 211, 315, 352, 405, 455, 509, 546, 600, 637, 692, 729, 784]
    },
    specializeStat: {
      key: "crit_rate",
      value: [0, 0, 0, 0, 4.8, 4.8, 9.6, 9.6, 9.6, 9.6, 14.4, 14.4, 19.2, 19.2]
    },
    talent: {
      auto: {},
      skill: {},
      burst: {}
    }
  },
  diona: {
    name: "Diona",
    star: 4,
    elementKey: "cryo",
    weaponTypeKey: "bow",
    gender: "F",
    constellationName: "Feles",
    titles: ["Kätzlein Cocktail", "Wine Industry Slayer (Self-proclaimed)"],
    baseStat: {
      hp: [802, 2061, 2661, 3985, 4411, 5074, 5642, 6305, 6731, 7393, 7818, 8481, 8907, 9570],
      atk: [18, 46, 59, 88, 98, 113, 125, 140, 149, 164, 174, 188, 198, 212],
      def: [50, 129, 167, 250, 277, 318, 354, 396, 422, 464, 491, 532, 559, 601]
    },
    specializeStat: {
      key: "cryo_ele_dmg",
      value: [0, 0, 0, 0, 6, 6, 12, 12, 12, 12, 18, 18, 24, 24]
    },
    talent: {
      auto: {},
      skill: {},
      burst: {}
    }
  },
  fischl: {
    name: "Fischl",
    star: 4,
    elementKey: "electro",
    weaponTypeKey: "bow",
    gender: "F",
    constellationName: "Corvus",
    titles: ["Prinzessin der Verurteilung", "Sovereign of Immernachtreich", "Ruler of the Ashen Darkness"],
    baseStat: {
      hp: [770, 1979, 2555, 3827, 4236, 4872, 5418, 6054, 6463, 7099, 7508, 8144, 8553, 9189],
      atk: [20, 53, 68, 102, 113, 130, 144, 161, 172, 189, 200, 216, 227, 244],
      def: [50, 128, 165, 247, 274, 315, 350, 391, 418, 459, 485, 526, 553, 594]
    },
    specializeStat: {
      key: "atk_",
      value: [0, 0, 0, 0, 6, 6, 12, 12, 12, 12, 18, 18, 24, 24]
    },
    talent: {
      auto: {},
      skill: {},
      burst: {}
    }
  },
  jean: {
    name: "Jean",
    star: 5,
    elementKey: "anemo",
    weaponTypeKey: "sword",
    gender: "F",
    constellationName: "Leo Minor",
    titles: ["Acting Grand Master", "Dandelion Knight", "Lionfang Knight"],
    baseStat: {
      hp: [1144, 2967, 3948, 5908, 6605, 7599, 8528, 9533, 10230, 11243, 11940, 12965, 13662, 14695],
      atk: [19, 48, 64, 96, 108, 124, 139, 155, 166, 183, 194, 211, 222, 239],
      def: [60, 155, 206, 309, 345, 397, 446, 499, 535, 588, 624, 678, 715, 769]
    },
    specializeStat: {
      key: "heal_bonu",
      value: [0, 0, 0, 0, 5.5, 5.5, 11.1, 11.1, 11.1, 11.1, 16.6, 16.6, 22.2, 22.2]
    },
    talent: {
      auto: {},
      skill: {},
      burst: {}
    }
  },
  kaeya: {
    name: "Kaeya",
    star: 4,
    elementKey: "cryo",
    weaponTypeKey: "sword",
    gender: "M",
    constellationName: "Pavo Ocellus",
    titles: ["Cavalry Captain", "Quartermaster", "Frostblade"],
    baseStat: {
      hp: [976, 2506, 3235, 4846, 5364, 6170, 6860, 7666, 8184, 8989, 9507, 10312, 10830, 11636],
      atk: [19, 48, 62, 93, 103, 118, 131, 147, 157, 172, 182, 198, 208, 223],
      def: [66, 171, 220, 330, 365, 420, 467, 522, 557, 612, 647, 702, 737, 792]
    },
    specializeStat: {
      key: "ener_rech",
      value: [0, 0, 0, 0, 6.7, 6.7, 13.3, 13.3, 13.3, 13.3, 20, 20, 26.7, 26.7]
    },
    talent: {
      auto: {},
      skill: {},
      burst: {}
    }
  },
  keqing: {
    name: "Keqing",
    star: 5,
    elementKey: "electro",
    weaponTypeKey: "sword",
    gender: "F",
    constellationName: "Trulla Cementarii",
    titles: ["Driving Thunder", "Yuheng of the Liyue Qixing"],
    baseStat: {
      hp: [1020, 2646, 3521, 5268, 5889, 6776, 7604, 8500, 9121, 10025, 10647, 11561, 12182, 13103],
      atk: [25, 65, 87, 130, 145, 167, 187, 209, 225, 247, 262, 285, 300, 323],
      def: [62, 161, 215, 321, 359, 413, 464, 519, 556, 612, 649, 705, 743, 799]
    },
    specializeStat: {
      key: "crit_dmg",
      value: [0, 0, 0, 0, 9.6, 9.6, 19.2, 19.2, 19.2, 19.2, 28.8, 28.8, 38.4, 38.4]
    },
    talent: {
      auto: {},
      skill: {},
      burst: {}
    }
  },
  klee: {
    name: "Klee",
    star: 5,
    elementKey: "pyro",
    weaponTypeKey: "catalyst",
    gender: "F",
    constellationName: "Trifolium",
    titles: ["Fleeing Sunlight", "Spark Knight", "Red Burny Girl"],
    baseStat: {
      hp: [801, 2077, 2764, 4136, 4623, 5319, 5970, 6673, 7161, 7870, 8358, 9076, 9563, 10287],
      atk: [24, 63, 84, 125, 140, 161, 180, 202, 216, 238, 253, 274, 289, 311],
      def: [48, 124, 165, 247, 276, 318, 357, 399, 428, 470, 500, 542, 572, 615]
    },
    specializeStat: {
      key: "pyro_ele_dmg",
      value: [0, 0, 0, 0, 7.2, 7.2, 14.4, 14.4, 14.4, 14.4, 21.6, 21.6, 28.8, 28.8]
    },
    talent: {
      auto: {},
      skill: {},
      burst: {}
    }
  },
  lisa: {
    name: "Lisa",
    star: 4,
    elementKey: "electro",
    weaponTypeKey: "catalyst",
    gender: "F",
    constellationName: "Tempus Fugit",
    titles: ["Witch of Purple Rose", "The Librarian"],
    baseStat: {
      hp: [802, 2061, 2661, 3985, 4411, 5074, 5642, 6305, 6731, 7393, 7818, 8481, 8907, 9570],
      atk: [19, 50, 64, 96, 107, 123, 136, 153, 163, 179, 189, 205, 215, 232],
      def: [48, 123, 159, 239, 264, 304, 338, 378, 403, 443, 468, 508, 533, 573]
    },
    specializeStat: {
      key: "ele_mas",
      value: [0, 0, 0, 0, 24, 24, 48, 48, 48, 48, 72, 72, 96, 96]
    },
    talent: {
      auto: {},
      skill: {},
      burst: {}
    }
  },
  mona: {
    name: "Mona",
    star: 5,
    elementKey: "hydro",
    weaponTypeKey: "catalyst",
    gender: "F",
    constellationName: "Astrolabos",
    titles: ["Astral Reflection", "Enigmatic Astrologer"],
    baseStat: {
      hp: [810, 2102, 2797, 4185, 4678, 5383, 6041, 6752, 7246, 7964, 8458, 9184, 9677, 10409],
      atk: [22, 58, 77, 115, 129, 148, 167, 186, 200, 220, 233, 253, 267, 287],
      def: [51, 132, 176, 263, 294, 338, 379, 424, 455, 500, 531, 576, 607, 653]
    },
    specializeStat: {
      key: "ener_rech",
      value: [0, 0, 0, 0, 8, 8, 16, 16, 16, 16, 24, 24, 32, 32]
    },
    talent: {
      auto: {},
      skill: {},
      burst: {}
    }
  },
  ningguang: {
    name: "Ningguang",
    star: 4,
    elementKey: "geo",
    weaponTypeKey: "catalyst",
    gender: "F",
    constellationName: "Opus Aequilibrium",
    titles: ["Eclipsing Star", "Lady of the Jade Chamber", "Tianquan of the Liyue Qixing"],
    baseStat: {
      hp: [821, 2108, 2721, 4076, 4512, 5189, 5770, 6448, 6884, 7561, 7996, 8674, 9110, 9787],
      atk: [18, 46, 59, 89, 98, 113, 125, 140, 150, 164, 174, 188, 198, 212],
      def: [48, 123, 159, 239, 264, 304, 338, 378, 403, 443, 468, 508, 533, 573]
    },
    specializeStat: {
      key: "geo_ele_dmg",
      value: [0, 0, 0, 0, 6, 6, 12, 12, 12, 12, 18, 18, 24, 24]
    },
    talent: {
      auto: {},
      skill: {},
      burst: {}
    }
  },
  noelle: {
    name: "Noelle",
    star: 4,
    elementKey: "geo",
    weaponTypeKey: "claymore",
    gender: "F",
    constellationName: "Parma Cordis",
    titles: ["Chivalric Blossom", "Maid of Favonius"],
    baseStat: {
      hp: [1012, 2600, 3356, 5027, 5564, 6400, 7117, 7953, 8490, 9325, 9862, 10698, 11235, 12071],
      atk: [16, 41, 53, 80, 88, 101, 113, 126, 134, 148, 156, 169, 178, 191],
      def: [67, 172, 222, 333, 368, 423, 471, 526, 562, 617, 652, 708, 743, 799]
    },
    specializeStat: {
      key: "def_",
      value: [0, 0, 0, 0, 7.5, 7.5, 15, 15, 15, 15, 22.5, 22.5, 30, 30]
    },
    talent: {
      auto: {},
      skill: {},
      burst: {}
    }
  },
  qiqi: {
    name: "Qiqi",
    star: 5,
    elementKey: "cryo",
    weaponTypeKey: "sword",
    gender: "F",
    constellationName: "Pristina Nola",
    titles: ["Pharmacist", "Icy Resurrection"],
    baseStat: {
      hp: [963, 2498, 3323, 4973, 5559, 6396, 7178, 8023, 8610, 9463, 10050, 10912, 11499, 12368],
      atk: [22, 58, 77, 115, 129, 149, 167, 186, 200, 220, 233, 253, 267, 287],
      def: [72, 186, 248, 371, 415, 477, 535, 598, 642, 706, 749, 814, 857, 922]
    },
    specializeStat: {
      key: "heal_bonu",
      value: [0, 0, 0, 0, 5.5, 5.5, 11.1, 11.1, 11.1, 11.1, 16.6, 16.6, 22.2, 22.2]
    },
    talent: {
      auto: {},
      skill: {},
      burst: {}
    }
  },
  razor: {
    name: "Razor",
    star: 4,
    elementKey: "electro",
    weaponTypeKey: "claymore",
    gender: "M",
    constellationName: "Lupus Minor",
    titles: ["Legend of Wolvendom", "Wolf Boy"],
    baseStat: {
      hp: [1003, 2577, 3326, 4982, 5514, 6343, 7052, 7881, 8413, 9241, 9773, 10602, 11134, 11962],
      atk: [20, 50, 65, 97, 108, 124, 138, 154, 164, 180, 191, 207, 217, 234],
      def: [63, 162, 209, 313, 346, 398, 443, 495, 528, 580, 613, 665, 699, 751]
    },
    specializeStat: {
      key: "phy_dmg",
      value: [0, 0, 0, 0, 7.5, 7.5, 15, 15, 15, 15, 22.5, 22.5, 30, 30]
    },
    talent: {
      auto: {},
      skill: {},
      burst: {}
    }
  },
  sucrose: {
    name: "Sucrose",
    star: 4,
    elementKey: "anemo",
    weaponTypeKey: "catalyst",
    gender: "F",
    constellationName: "Ampulla",
    titles: ["Harmless Sweetie", "Knights of Favonius Alchemist"],
    baseStat: {
      hp: [775, 1991, 2570, 3850, 4261, 4901, 5450, 6090, 6501, 7141, 7552, 8192, 8603, 9244],
      atk: [14, 37, 47, 71, 78, 90, 100, 112, 120, 131, 139, 151, 159, 170],
      def: [59, 151, 195, 293, 324, 373, 414, 463, 494, 543, 574, 623, 654, 703]
    },
    specializeStat: {
      key: "anemo_ele_dmg",
      value: [0, 0, 0, 0, 6, 6, 12, 12, 12, 12, 18, 18, 24, 24]
    },
    talent: {
      auto: {},
      skill: {},
      burst: {}
    }
  },
  tartaglia: {
    name: "Tartaglia",
    star: 5,
    elementKey: "hydro",
    weaponTypeKey: "bow",
    gender: "M",
    constellationName: "Monoceros Caeli",
    titles: ["Childe", "11th of the Eleven Fatui Harbingers"],
    baseStat: {
      hp: [1020, 2646, 3521, 5268, 5889, 6776, 7604, 8500, 9121, 10025, 10647, 11561, 12182, 13103],
      atk: [23, 61, 81, 121, 135, 156, 175, 195, 210, 231, 245, 266, 280, 301],
      def: [63, 165, 219, 328, 366, 421, 473, 528, 567, 623, 662, 719, 757, 815]
    },
    specializeStat: {
      key: "hydro_ele_dmg",
      value: [0, 0, 0, 0, 7.2, 7.2, 14.4, 14.4, 14.4, 14.4, 21.6, 21.6, 28.8, 28.8]
    },
    talent: {
      auto: {},
      skill: {},
      burst: {}
    }
  },
  traveler_anemo: {
    name: "Traveler (Anemo)",
    star: 5,
    elementKey: "anemo",
    weaponTypeKey: "sword",
    gender: "F/M",
    constellationName: "Viatrix",//female const
    titles: ["Outlander", "Honorary Knight"],
    baseStat: {
      hp: [912, 2342, 3024, 4529, 5013, 5766, 6411, 7164, 7648, 8401, 8885, 9638, 10122, 10875],
      atk: [18, 46, 60, 88, 98, 112, 126, 140, 149, 164, 174, 188, 198, 213],
      def: [57, 147, 190, 284, 315, 362, 405, 450, 480, 527, 558, 605, 635, 682]
    },
    specializeStat: {
      key: "atk_",
      value: [0, 0, 0, 0, 6, 6, 12, 12, 12, 12, 18, 18, 24, 24]
    },
    talent: {
      auto: {},
      skill: {},
      burst: {}
    }
  },
  traveler_geo: {
    name: "Traveler (Geo)",
    star: 5,
    elementKey: "geo",
    weaponTypeKey: "sword",
    gender: "F/M",
    constellationName: "Viator",//male const
    titles: ["Outlander", "Honorary Knight"],
    baseStat: {
      hp: [912, 2342, 3024, 4529, 5013, 5766, 6411, 7164, 7648, 8401, 8885, 9638, 10122, 10875],
      atk: [18, 46, 60, 88, 98, 112, 126, 140, 149, 164, 174, 188, 198, 213],
      def: [57, 147, 190, 284, 315, 362, 405, 450, 480, 527, 558, 605, 635, 682]
    },
    specializeStat: {
      key: "atk_",
      value: [0, 0, 0, 0, 6, 6, 12, 12, 12, 12, 18, 18, 24, 24]
    },
    talent: {
      auto: {},
      skill: {},
      burst: {}
    }
  },
  venti: {
    name: "Venti",
    star: 5,
    elementKey: "anemo",
    weaponTypeKey: "bow",
    gender: "M",
    constellationName: "Carmen Dei",
    titles: ["Windborne Bard", "Tone-Deaf Bard"],
    baseStat: {
      hp: [820, 2127, 2830, 4234, 4734, 5446, 6112, 6832, 7331, 8058, 8557, 9292, 9791, 10531],
      atk: [20, 53, 71, 106, 118, 136, 153, 171, 183, 201, 214, 232, 245, 263],
      def: [52, 135, 180, 269, 301, 346, 388, 434, 465, 512, 543, 590, 622, 669]
    },
    specializeStat: {
      key: "ener_rech",
      value: [0, 0, 0, 0, 8, 8, 16, 16, 16, 16, 24, 24, 32, 32]
    },
    talent: {
      auto: {},
      skill: {},
      burst: {}
    }
  },
  xiangling: {
    name: "Xiangling",
    star: 4,
    elementKey: "pyro",
    weaponTypeKey: "polearm",
    gender: "F",
    constellationName: "Trulla",
    titles: ["Exquisite Delicacy", "Chef de Cuisine"],
    baseStat: {
      hp: [912, 2342, 3024, 4529, 5013, 5766, 6411, 7164, 7648, 8401, 8885, 9638, 10122, 10875],
      atk: [19, 49, 63, 94, 104, 119, 133, 149, 159, 174, 184, 200, 210, 225],
      def: [56, 144, 186, 279, 308, 355, 394, 441, 470, 517, 546, 593, 623, 669]
    },
    specializeStat: {
      key: "ele_mas",
      value: [0, 0, 0, 0, 24, 24, 48, 48, 48, 48, 72, 72, 96, 96]
    },
    talent: {
      auto: {},
      skill: {},
      burst: {}
    }
  },
  xingqiu: {
    name: "Xingqiu",
    star: 4,
    elementKey: "hydro",
    weaponTypeKey: "sword",
    gender: "M",
    constellationName: "Fabulae Textile",
    titles: ["Juvenile Galant", "Guhua Guru of Feiyun Fame", "Guhua Geek"],
    baseStat: {
      hp: [857, 2202, 2842, 4257, 4712, 5420, 6027, 6735, 7190, 7897, 8352, 9060, 9515, 10222],
      atk: [17, 43, 56, 84, 93, 107, 119, 133, 142, 156, 165, 179, 188, 202],
      def: [64, 163, 211, 316, 349, 402, 447, 499, 533, 585, 619, 671, 705, 758]
    },
    specializeStat: {
      key: "atk_",
      value: [0, 0, 0, 0, 6, 6, 12, 12, 12, 12, 18, 18, 24, 24]
    },
    talent: {
      auto: {},
      skill: {},
      burst: {}
    }
  },
  xinyan: {
    name: "Xinyan",
    star: 4,
    elementKey: "pyro",
    weaponTypeKey: "claymore",
    gender: "F",
    constellationName: "Fila Ignium",
    titles: ["Blazing Riff", "Rock 'n' Roll Musician"],
    baseStat: {
      hp: [939, 2413, 3114, 4665, 5163, 5939, 6604, 7379, 7878, 8653, 9151, 9927, 10425, 11201],
      atk: [21, 54, 69, 103, 115, 132, 147, 164, 175, 192, 203, 220, 231, 249],
      def: [67, 172, 222, 333, 368, 423, 471, 526, 562, 617, 652, 708, 743, 799]
    },
    specializeStat: {
      key: "atk_",
      value: [0, 0, 0, 0, 6, 6, 12, 12, 12, 12, 18, 18, 24, 24]
    },
    talent: {
      auto: {},
      skill: {},
      burst: {}
    }
  },
  zhongli: {
    name: "Zhongli",
    star: 5,
    elementKey: "geo",
    weaponTypeKey: "polearm",
    gender: "M",
    constellationName: "Lapis Dei",
    titles: ["Vago Mundo"],
    baseStat: {
      hp: [1144, 2967, 3948, 5908, 6605, 7599, 8528, 9533, 10230, 11243, 11940, 12965, 13662, 14695],
      atk: [20, 51, 67, 101, 113, 130, 146, 163, 175, 192, 204, 222, 233, 251],
      def: [57, 149, 198, 297, 332, 382, 428, 479, 514, 564, 699, 651, 686, 738]
    },
    specializeStat: {
      key: "geo_ele_dmg",
      value: [0, 0, 0, 0, 7.2, 7.2, 14.4, 14.4, 14.4, 14.4, 21.6, 21.6, 28.8, 28.8]
    },
    talent: {
      auto: {},
      skill: {},
      burst: {}
    }
  },
  // template: {
  //   name: "template",
  //   star: 4,
  //   elementKey: "hydro",
  //   weaponTypeKey: "catalyst",
  //   gender: "F",
  //   constellationName: "template",
  //   titles: ["template", "Deaconess"],
  //   baseStat: {
  //     hp: [],
  //     atk: [],
  //     def: []
  //   },
  //   specializeStat: {
  //     key: "",
  //     value: []
  //   },
  //   talent: {
  //     auto: {},
  //     skill: {},
  //     burst: {}
  //   }
  // },
}
export {
  LevelsData,
  characterStatBase,
  CharacterData,
  CharacterSpecializedStatKey
}