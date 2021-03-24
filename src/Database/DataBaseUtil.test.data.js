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
  noelle: {
    "characterKey": "noelle",
    "levelKey": "L90",
    "hitMode": "avgHit",
    "reactionMode": null,
    "equippedArtifacts": {
      "flower": "artifact_6",
      "sands": "artifact_8",
      "circlet": "artifact_9",
      "plume": "artifact_10",
      "goblet": "artifact_11"
    },
    "artifactConditionals": [
      {
        "srcKey": "RetracingBolide",
        "conditionalNum": 1,
        "srcKey2": "4"
      }
    ],
    "baseStatOverrides": {},
    "weapon": {
      "key": "Whiteblind",
      "levelKey": "L90",
      "refineIndex": 2,
      "overrideMainVal": 0,
      "overrideSubVal": 0,
      "conditionalNum": 4
    },
    "talentLevelKeys": {
      "auto": 6,
      "skill": 5,
      "burst": 9
    },
    "autoInfused": true,
    "talentConditionals": [
      {
        "srcKey": "burst",
        "conditionalNum": 1,
        "srcKey2": "Sweeping"
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
          "srcKey": "RetracingBolide",
          "conditionalNum": 1,
          "srcKey2": "4"
        }
      ],
      "mainStat": [
        "",
        "",
        ""
      ],
      "optimizationTarget": {
        "talentKey": "auto",
        "sectionIndex": 1,
        "fieldIndex": 0
      },
      "artifactsAssumeFull": false,
      "useLockedArts": false,
      "ascending": false
    }
  }
}
export const arts = {
  artifact_1: {
    "setKey": "ArchaicPetra",
    "numStars": 5,
    "level": 20,
    "slotKey": "goblet",
    "mainStatKey": "geo_dmg_",
    "substats": [{
      "key": "eleMas",
      "value": 58,
      "rolls": [23, 19, 16],
      "efficiency": 84.05797101449275,
      "rollArr": [
        [23, 19, 16],
        [21, 21, 16],
        [21, 19, 19],
        [19, 19, 19]
      ]
    }, {
      "key": "def",
      "value": 42,
      "rolls": [
        23,
        19
      ],
      "efficiency": 91.30434782608695,
      "rollArr": [
        [
          23,
          19
        ],
        [
          21,
          21
        ]
      ]
    },
    {
      "key": "hp_",
      "value": 9.3,
      "rolls": [
        5.3,
        4.1
      ],
      "efficiency": 81.03448275862068,
      "rollArr": [
        [
          5.3,
          4.1
        ],
        [
          4.7,
          4.7
        ]
      ]
    },
    {
      "key": "hp",
      "value": 448,
      "rolls": [
        239,
        209
      ],
      "efficiency": 74.91638795986621
    }
    ],
    "id": "artifact_1",
    "location": "",
    "currentEfficiency": 82.96492779251399,
    "maximumEfficiency": 82.96492779251399
  },//inventory
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
  artifact_6: {
    "setKey": "RetracingBolide",
    "numStars": 5,
    "level": 20,
    "slotKey": "flower",
    "mainStatKey": "hp",
    "substats": [
      {
        "key": "enerRech_",
        "value": 10.4,
        "rolls": [
          5.8,
          4.5
        ],
        "efficiency": 79.23076923076924,
        "rollArr": [
          [
            5.8,
            4.5
          ],
          [
            5.2,
            5.2
          ]
        ]
      },
      {
        "key": "critRate_",
        "value": 9.3,
        "rolls": [
          3.9,
          2.7,
          2.7
        ],
        "efficiency": 79.48717948717949,
        "rollArr": [
          [
            3.9,
            2.7,
            2.7
          ],
          [
            3.5,
            3.1,
            2.7
          ],
          [
            3.1,
            3.1,
            3.1
          ]
        ]
      },
      {
        "key": "atk_",
        "value": 5.8,
        "rolls": [
          5.8
        ],
        "efficiency": 100
      },
      {
        "key": "atk",
        "value": 49,
        "rolls": [
          19,
          16,
          14
        ],
        "efficiency": 85.96491228070175,
        "rollArr": [
          [
            19,
            16,
            14
          ],
          [
            18,
            18,
            14
          ],
          [
            18,
            16,
            16
          ],
          [
            18,
            16,
            14
          ],
          [
            16,
            16,
            16
          ]
        ]
      }
    ],
    "id": "artifact_6",
    "location": "noelle",
    "currentEfficiency": 83.86864597390912,
    "maximumEfficiency": 83.86864597390912
  },//noelle
  artifact_8: {
    "setKey": "RetracingBolide",
    "numStars": 5,
    "level": 20,
    "slotKey": "sands",
    "mainStatKey": "atk_",
    "substats": [
      {
        "key": "def_",
        "value": 19.7,
        "rolls": [
          7.3,
          7.3,
          5.1
        ],
        "efficiency": 89.95433789954338,
        "rollArr": [
          [
            7.3,
            7.3,
            5.1
          ],
          [
            7.3,
            6.6,
            5.8
          ],
          [
            6.6,
            6.6,
            6.6
          ]
        ]
      },
      {
        "key": "eleMas",
        "value": 19,
        "rolls": [
          19
        ],
        "efficiency": 82.6086956521739
      },
      {
        "key": "critRate_",
        "value": 7,
        "rolls": [
          3.9,
          3.1
        ],
        "efficiency": 89.74358974358975,
        "rollArr": [
          [
            3.9,
            3.1
          ],
          [
            3.5,
            3.5
          ]
        ]
      },
      {
        "key": "atk",
        "value": 37,
        "rolls": [
          19,
          19
        ],
        "efficiency": 100,
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
        ]
      }
    ],
    "id": "artifact_8",
    "location": "noelle",
    "currentEfficiency": 81.32876542644262,
    "maximumEfficiency": 81.32876542644262
  },//noelle
  artifact_9: {
    "setKey": "RetracingBolide",
    "numStars": 5,
    "level": 20,
    "slotKey": "circlet",
    "mainStatKey": "critRate_",
    "substats": [
      {
        "key": "enerRech_",
        "value": 16.2,
        "rolls": [
          6.5,
          5.2,
          4.5
        ],
        "efficiency": 83.07692307692307,
        "rollArr": [
          [
            6.5,
            5.2,
            4.5
          ],
          [
            5.8,
            5.8,
            4.5
          ],
          [
            5.8,
            5.2,
            5.2
          ]
        ]
      },
      {
        "key": "atk",
        "value": 33,
        "rolls": [
          19,
          14
        ],
        "efficiency": 86.8421052631579,
        "rollArr": [
          [
            19,
            14
          ],
          [
            18,
            16
          ],
          [
            18,
            14
          ],
          [
            16,
            16
          ]
        ]
      },
      {
        "key": "eleMas",
        "value": 16,
        "rolls": [
          16
        ],
        "efficiency": 69.56521739130434
      },
      {
        "key": "def_",
        "value": 10.9,
        "rolls": [
          5.8,
          5.1
        ],
        "efficiency": 74.65753424657532
      }
    ],
    "id": "artifact_9",
    "location": "noelle",
    "currentEfficiency": 71.31058507128222,
    "maximumEfficiency": 71.31058507128222
  },//noelle
  artifact_10: {
    "setKey": "RetracingBolide",
    "numStars": 5,
    "level": 20,
    "slotKey": "plume",
    "mainStatKey": "atk",
    "substats": [
      {
        "key": "hp",
        "value": 508,
        "rolls": [
          299,
          209
        ],
        "efficiency": 84.94983277591973,
        "rollArr": [
          [
            299,
            209
          ],
          [
            269,
            239
          ]
        ]
      },
      {
        "key": "critDMG_",
        "value": 7,
        "rolls": [
          7
        ],
        "efficiency": 89.74358974358975
      },
      {
        "key": "atk_",
        "value": 4.1,
        "rolls": [
          4.1
        ],
        "efficiency": 70.6896551724138
      },
      {
        "key": "def_",
        "value": 23.3,
        "rolls": [
          7.3,
          5.8,
          5.1,
          5.1
        ],
        "efficiency": 79.7945205479452,
        "rollArr": [
          [
            7.3,
            5.8,
            5.1,
            5.1
          ],
          [
            6.6,
            6.6,
            5.1,
            5.1
          ],
          [
            6.6,
            5.8,
            5.8,
            5.1
          ],
          [
            5.8,
            5.8,
            5.8,
            5.8
          ]
        ]
      }
    ],
    "id": "artifact_10",
    "location": "noelle",
    "currentEfficiency": 72.16788807329152,
    "maximumEfficiency": 72.16788807329152
  },//noelle
  artifact_11: {
    "setKey": "ArchaicPetra",
    "numStars": 5,
    "level": 20,
    "slotKey": "goblet",
    "mainStatKey": "geo_dmg_",
    "substats": [
      {
        "key": "def_",
        "value": 19,
        "rolls": [
          7.3,
          6.6,
          5.1
        ],
        "efficiency": 86.75799086757992,
        "rollArr": [
          [
            7.3,
            6.6,
            5.1
          ],
          [
            7.3,
            5.8,
            5.8
          ],
          [
            6.6,
            6.6,
            5.8
          ]
        ]
      },
      {
        "key": "atk_",
        "value": 5.8,
        "rolls": [
          5.8
        ],
        "efficiency": 100
      },
      {
        "key": "hp_",
        "value": 9.9,
        "rolls": [
          5.8,
          4.1
        ],
        "efficiency": 85.34482758620689,
        "rollArr": [
          [
            5.8,
            4.1
          ],
          [
            5.3,
            4.7
          ]
        ]
      },
      {
        "key": "critRate_",
        "value": 7,
        "rolls": [
          3.9,
          3.1
        ],
        "efficiency": 89.74358974358975,
        "rollArr": [
          [
            3.9,
            3.1
          ],
          [
            3.5,
            3.5
          ]
        ]
      }
    ],
    "id": "artifact_11",
    "location": "noelle",
    "currentEfficiency": 78.93897858470366,
    "maximumEfficiency": 78.93897858470366
  },//noelle
  artifact_18: {
    "setKey": "BloodstainedChivalry",
    "numStars": 5,
    "level": 16,
    "slotKey": "sands",
    "mainStatKey": "hp_",
    "substats": [
      {
        "key": "critDMG_",
        "value": 13.2,
        "rolls": [
          7.8,
          5.4
        ],
        "efficiency": 84.61538461538461,
        "rollArr": [
          [
            7.8,
            5.4
          ],
          [
            7,
            6.2
          ]
        ]
      },
      {
        "key": "enerRech_",
        "value": 6.5,
        "rolls": [
          6.5
        ],
        "efficiency": 100
      },
      {
        "key": "critRate_",
        "value": 8.6,
        "rolls": [
          3.1,
          2.7,
          2.7
        ],
        "efficiency": 72.64957264957266
      },
      {
        "key": "def",
        "value": 21,
        "rolls": [
          21
        ],
        "efficiency": 91.30434782608695
      }
    ],
    "id": "artifact_18",
    "currentEfficiency": 64.27598166728602,
    "maximumEfficiency": 75.38709277839713
  }//inventory
}
export const artifactDisplay = {
  "filterArtSetKey": "",
  "filterStars": [
    3,
    4,
    5
  ],
  "filterLevelLow": 0,
  "filterLevelHigh": 20,
  "filterSlotKey": "",
  "filterMainStatKey": "",
  "filterSubstats": [
    "",
    "",
    "",
    ""
  ],
  "filterLocation": "Equipped",
  "ascending": false,
  "maxNumArtifactsToDisplay": 50,
  "sortType": "mefficiency",
  "asending": false
}
export const characterDisplay = {
  "charIdToEdit": null,
  "showEditor": false,
  "sortBy": "level",
  "elementalFilter": [
    "anemo",
    "geo",
    "electro",
    "hydro",
    "pyro",
    "cryo"
  ],
  "weaponFilter": [
    "sword",
    "claymore",
    "catalyst",
    "bow",
    "polearm"
  ]
}
export const buildsDisplay = {
  "characterKey": "hutao",
  "maxBuildsToShow": 25
}

