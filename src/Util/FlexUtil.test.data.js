import { CurrentDatabaseVersion } from "../Database/DatabaseUtil"

export const chars = {
  ningguang: {
    "characterKey": "ningguang",
    "levelKey": "L80A",
    "hitMode": "avgHit",
    "reactionMode": null,
    "equippedArtifacts": {
      "flower": "artifact_4",
      "plume": "artifact_2",
      "sands": "artifact_5",
      "goblet": "artifact_400",
      "circlet": "artifact_3"
    },
    "artifactConditionals": [],
    "baseStatOverrides": {
      "enemy_level": 91,
      "enemyLevel": 90
    },
    "weapon": {
      "key": "SolarPearl",
      "levelKey": "L90",
      "refineIndex": 1,
      "overrideMainVal": 0,
      "overrideSubVal": 0,
      "conditionalNum": 3
    },
    "talentLevelKeys": {
      "autoLevelKey": 0,
      "skillLevelKey": 0,
      "burstLevelKey": 0,
      "auto": 5,
      "skill": 7,
      "burst": 8
    },
    "autoInfused": true,
    "talentConditionals": [
      {
        "srcKey": "passive2",
        "conditionalNum": 1,
        "srcKey2": "StrategicReserve"
      }
    ],
    "constellation": 6,
    "overrideLevel": 0,
    "buildSetting": {
      "setFilters": [
        {
          "key": "",
          "num": 0
        },
        {
          "key": "",
          "num": 0
        },
        {
          "key": "",
          "num": 0
        }
      ],
      "statFilters": {},
      "artifactConditionals": [
        {
          "srcKey": "NoblesseOblige",
          "conditionalNum": 1,
          "srcKey2": "4"
        },
        {
          "srcKey": "WanderersTroupe",
          "conditionalNum": 1,
          "srcKey2": "4"
        }
      ],
      "mainStat": [
        "atk_",
        "geo_dmg_",
        ""
      ],
      "optimizationTarget": {
        "talentKey": "burst",
        "sectionIndex": 0,
        "fieldIndex": 0
      },
      "artifactsAssumeFull": true,
      "useLockedArts": false,
      "ascending": false
    }
  },
}
export const flexObj = {
  dbv: CurrentDatabaseVersion,
  "characterKey": "ningguang",
  "levelKey": "L80A",
  "hitMode": "avgHit",
  "reactionMode": null,
  "artifacts": [{
    "setKey": "NoblesseOblige",
    "numStars": 5,
    "level": 20,
    "slotKey": "flower",
    "mainStatKey": "hp",
    "substats": {
      "eleMas": 21,
      "def": 39,
      "def_": 6.6,
      "critDMG_": 25.6,
    },
  }, {
    "setKey": "NoblesseOblige",
    "numStars": 5,
    "level": 20,
    "slotKey": "plume",
    "mainStatKey": "atk",
    "substats": {
      "hp": 269,
      "critRate_": 13.2,
      "enerRech_": 11.7,
      "critDMG_": 15.5,
    },
  }, {
    "setKey": "WanderersTroupe",
    "numStars": 5,
    "level": 20,
    "slotKey": "sands",
    "mainStatKey": "atk_",
    "substats": {
      "critRate_": 14.8,
      "enerRech_": 5.2,
      "eleMas": 21,
      "atk": 31,
    },
  }, {
    "setKey": "ArchaicPetra",
    "numStars": 5,
    "level": 20,
    "slotKey": "goblet",
    "mainStatKey": "geo_dmg_",
    "substats": {
      "critDMG_": 15.5,
      "def": 19,
      "atk": 37,
      "def_": 18.2,
    },
  }, {
    "setKey": "ArchaicPetra",
    "numStars": 5,
    "level": 20,
    "slotKey": "circlet",
    "mainStatKey": "atk_",
    "substats": {
      "critDMG_": 20.2,
      "critRate_": 3.5,
      "atk": 14,
      "enerRech_": 18.8,
    },
  }],
  "artifactConditionals": [],
  "baseStatOverrides": {
    "enemy_level": 91,
    "enemyLevel": 90
  },
  "weapon": {
    "key": "SolarPearl",
    "levelKey": "L90",
    "refineIndex": 1,
    "overrideMainVal": 0,
    "overrideSubVal": 0,
    "conditionalNum": 3
  },
  "tlvl": [5, 7, 8],
  "autoInfused": true,
  "talentConditionals": [
    {
      "srcKey": "passive2",
      "conditionalNum": 1,
      "srcKey2": "StrategicReserve"
    }
  ],
  "constellation": 6,
  "overrideLevel": 0,
}
export const characterObj = {
  databaseVersion: CurrentDatabaseVersion,
  "characterKey": "ningguang",
  "levelKey": "L80A",
  "hitMode": "avgHit",
  "reactionMode": null,
  "artifacts": [{
    "setKey": "NoblesseOblige",
    "numStars": 5,
    "level": 20,
    "slotKey": "flower",
    "mainStatKey": "hp",
    "location": "ningguang",
    "substats": [
      {
        "key": "eleMas",
        "value": 21,
      },
      {
        "key": "def",
        "value": 39,
      },
      {
        "key": "def_",
        "value": 6.6,
      },
      {
        "key": "critDMG_",
        "value": 25.6,
      }
    ],
  }, {
    "setKey": "NoblesseOblige",
    "numStars": 5,
    "level": 20,
    "slotKey": "plume",
    "mainStatKey": "atk",
    "location": "ningguang",
    "substats": [
      {
        "key": "hp",
        "value": 269,
      },
      {
        "key": "critRate_",
        "value": 13.2,
      },
      {
        "key": "enerRech_",
        "value": 11.7,
      },
      {
        "key": "critDMG_",
        "value": 15.5,
      }
    ],
  }, {
    "setKey": "WanderersTroupe",
    "numStars": 5,
    "level": 20,
    "slotKey": "sands",
    "mainStatKey": "atk_",
    "location": "ningguang",
    "substats": [
      {
        "key": "critRate_",
        "value": 14.8,
      },
      {
        "key": "enerRech_",
        "value": 5.2,
      },
      {
        "key": "eleMas",
        "value": 21,
      },
      {
        "key": "atk",
        "value": 31,
      }
    ],
  }, {
    "setKey": "ArchaicPetra",
    "numStars": 5,
    "level": 20,
    "slotKey": "goblet",
    "mainStatKey": "geo_dmg_",
    "location": "ningguang",
    "substats": [
      {
        "key": "critDMG_",
        "value": 15.5,
      },
      {
        "key": "def",
        "value": 19,
      },
      {
        "key": "atk",
        "value": 37,
      },
      {
        "key": "def_",
        "value": 18.2,
      }
    ],
  }, {
    "setKey": "ArchaicPetra",
    "numStars": 5,
    "level": 20,
    "slotKey": "circlet",
    "mainStatKey": "atk_",
    "location": "ningguang",
    "substats": [
      {
        "key": "critDMG_",
        "value": 20.2,
      },
      {
        "key": "critRate_",
        "value": 3.5,
      },
      {
        "key": "atk",
        "value": 14,
      },
      {
        "key": "enerRech_",
        "value": 18.8,
      }
    ],
  }],
  "artifactConditionals": [],
  "baseStatOverrides": {
    "enemy_level": 91,
    "enemyLevel": 90
  },
  "weapon": {
    "key": "SolarPearl",
    "levelKey": "L90",
    "refineIndex": 1,
    "overrideMainVal": 0,
    "overrideSubVal": 0,
    "conditionalNum": 3
  },
  "talentLevelKeys": {
    "auto": 5,
    "skill": 7,
    "burst": 8
  },
  "autoInfused": true,
  "talentConditionals": [
    {
      "srcKey": "passive2",
      "conditionalNum": 1,
      "srcKey2": "StrategicReserve"
    }
  ],
  "constellation": 6,
  "overrideLevel": 0,
}
export const arts = {
  artifact_2: {
    "setKey": "NoblesseOblige",
    "numStars": 5,
    "level": 20,
    "slotKey": "plume",
    "mainStatKey": "atk",
    "substats": [
      {
        "key": "hp",
        "value": 269,
        "rolls": [
          269
        ],
        "efficiency": 89.96655518394648
      },
      {
        "key": "critRate_",
        "value": 13.2,
        "rolls": [
          3.9,
          3.9,
          2.7,
          2.7
        ],
        "efficiency": 84.61538461538461,
        "rollArr": [
          [
            3.9,
            3.9,
            2.7,
            2.7
          ],
          [
            3.9,
            3.5,
            3.1,
            2.7
          ],
          [
            3.9,
            3.1,
            3.1,
            3.1
          ],
          [
            3.5,
            3.5,
            3.5,
            2.7
          ],
          [
            3.5,
            3.5,
            3.1,
            3.1
          ]
        ]
      },
      {
        "key": "enerRech_",
        "value": 11.7,
        "rolls": [
          6.5,
          5.2
        ],
        "efficiency": 89.99999999999999,
        "rollArr": [
          [
            6.5,
            5.2
          ],
          [
            5.8,
            5.8
          ]
        ]
      },
      {
        "key": "critDMG_",
        "value": 15.5,
        "rolls": [
          7.8,
          7.8
        ],
        "efficiency": 100
      }
    ],
    "id": "artifact_2",
    "location": "ningguang",
    "currentEfficiency": 89.8253437383872,
    "maximumEfficiency": 89.8253437383872
  },//ningguang
  artifact_4: {
    "setKey": "NoblesseOblige",
    "numStars": 5,
    "level": 20,
    "slotKey": "flower",
    "mainStatKey": "hp",
    "substats": [
      {
        "key": "eleMas",
        "value": 21,
        "rolls": [
          21
        ],
        "efficiency": 91.30434782608695
      },
      {
        "key": "def",
        "value": 39,
        "rolls": [
          23,
          16
        ],
        "efficiency": 84.78260869565217,
        "rollArr": [
          [
            23,
            16
          ],
          [
            21,
            19
          ],
          [
            19,
            19
          ]
        ]
      },
      {
        "key": "def_",
        "value": 6.6,
        "rolls": [
          6.6
        ],
        "efficiency": 90.41095890410958
      },
      {
        "key": "critDMG_",
        "value": 25.6,
        "rolls": [
          7.8,
          7,
          5.4,
          5.4
        ],
        "efficiency": 82.05128205128206,
        "rollArr": [
          [
            7.8,
            7,
            5.4,
            5.4
          ],
          [
            7.8,
            6.2,
            6.2,
            5.4
          ],
          [
            7,
            7,
            6.2,
            5.4
          ],
          [
            7,
            6.2,
            6.2,
            6.2
          ]
        ]
      }
    ],
    "id": "artifact_4",
    "location": "ningguang",
    "currentEfficiency": 75.49840581406991,
    "maximumEfficiency": 75.49840581406991
  },//ningguang
  artifact_5: {
    "setKey": "WanderersTroupe",
    "numStars": 5,
    "level": 20,
    "slotKey": "sands",
    "mainStatKey": "atk_",
    "substats": [
      {
        "key": "critRate_",
        "value": 14.8,
        "rolls": [
          3.9,
          3.9,
          3.9,
          3.1
        ],
        "efficiency": 94.87179487179486,
        "rollArr": [
          [
            3.9,
            3.9,
            3.9,
            3.1
          ],
          [
            3.9,
            3.9,
            3.5,
            3.5
          ],
          [
            3.9,
            2.7,
            2.7,
            2.7,
            2.7
          ],
          [
            3.5,
            3.1,
            2.7,
            2.7,
            2.7
          ],
          [
            3.1,
            3.1,
            3.1,
            2.7,
            2.7
          ]
        ]
      },
      {
        "key": "enerRech_",
        "value": 5.2,
        "rolls": [
          5.2
        ],
        "efficiency": 80
      },
      {
        "key": "eleMas",
        "value": 21,
        "rolls": [
          21
        ],
        "efficiency": 91.30434782608695
      },
      {
        "key": "atk",
        "value": 31,
        "rolls": [
          18,
          14
        ],
        "efficiency": 84.21052631578947,
        "rollArr": [
          [
            18,
            14
          ],
          [
            16,
            16
          ],
          [
            16,
            14
          ]
        ]
      }
    ],
    "id": "artifact_5",
    "location": "ningguang",
    "currentEfficiency": 79.9125088827606,
    "maximumEfficiency": 79.9125088827606
  },//ningguang
  artifact_400: {
    "id": "artifact_400",
    "setKey": "ArchaicPetra",
    "numStars": 5,
    "level": 20,
    "slotKey": "goblet",
    "mainStatKey": "geo_dmg_",
    "substats": [
      {
        "key": "critDMG_",
        "value": 15.5,
        "rolls": [
          7.8,
          7.8
        ],
        "efficiency": 100
      },
      {
        "key": "def",
        "value": 19,
        "rolls": [
          19
        ],
        "efficiency": 82.6086956521739
      },
      {
        "key": "atk",
        "value": 37,
        "rolls": [
          19,
          19
        ],
        "rollArr": [
          [
            19,
            19
          ],
          [
            19,
            18
          ],
          [
            18,
            18
          ]
        ],
        "efficiency": 100
      },
      {
        "key": "def_",
        "value": 18.2,
        "rolls": [
          7.3,
          5.8,
          5.1
        ],
        "rollArr": [
          [
            7.3,
            5.8,
            5.1
          ],
          [
            6.6,
            6.6,
            5.1
          ],
          [
            6.6,
            5.8,
            5.8
          ]
        ],
        "efficiency": 83.10502283105023
      }
    ],
    "currentEfficiency": 81.32486268281384,
    "maximumEfficiency": 81.32486268281384,
    "location": "ningguang"
  },//ningguang
  artifact_3: {
    "setKey": "ArchaicPetra",
    "numStars": 5,
    "level": 20,
    "slotKey": "circlet",
    "mainStatKey": "atk_",
    "substats": [
      {
        "key": "critDMG_",
        "value": 20.2,
        "rolls": [
          7.8,
          7,
          5.4
        ],
        "efficiency": 86.32478632478634,
        "rollArr": [
          [
            7.8,
            7,
            5.4
          ],
          [
            7.8,
            6.2,
            6.2
          ],
          [
            7,
            7,
            6.2
          ]
        ]
      },
      {
        "key": "critRate_",
        "value": 3.5,
        "rolls": [
          3.5
        ],
        "efficiency": 89.74358974358975
      },
      {
        "key": "atk",
        "value": 14,
        "rolls": [
          14
        ],
        "efficiency": 73.68421052631578
      },
      {
        "key": "enerRech_",
        "value": 18.8,
        "rolls": [
          6.5,
          6.5,
          5.8
        ],
        "efficiency": 96.41025641025641,
        "rollArr": [
          [
            6.5,
            6.5,
            5.8
          ],
          [
            5.2,
            4.5,
            4.5,
            4.5
          ]
        ]
      }
    ],
    "id": "artifact_3",
    "location": "ningguang",
    "currentEfficiency": 79.07032538611486,
    "maximumEfficiency": 79.07032538611486
  },//ningguang
}

