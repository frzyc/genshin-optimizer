import flower from './Item_Guardian\'s_Flower.png'
import plume from './Item_Guardian\'s_Sigil.png'
import sands from './Item_Guardian\'s_Clock.png'
import goblet from './Item_Guardian\'s_Vessel.png'
import circlet from './Item_Guardian\'s_Band.png'
let artifact = {
  name: "Defender's Will", rarity: [3, 4],
  pieces: {
    flower: "Guardian's Flower",
    plume: "Guardian's Sigil",
    sands: "Guardian's Clock",
    goblet: "Guardian's Vessel",
    circlet: "Guardian's Band"
  },
  icons: {
    flower,
    plume,
    sands,
    goblet,
    circlet
  },
  setEffects: {
    2: {
      text: "Base DEF +30%",
      stats: { def_: 30 }
    },
    4: {
      text: "Increases Elemental RES by 30% for each element present in the party.",
      conditional: [//TODO all party conditional
        {
          type: "artifact",
          condition: "Anemo",
          sourceKey: "DefendersWill_4",
          maxStack: 1,
          stats: {
            aneme_res_: 30
          }
        }, {
          type: "artifact",
          condition: "Geo",
          sourceKey: "DefendersWill_4",
          maxStack: 1,
          stats: {
            geo_res_: 30
          }
        }, {
          type: "artifact",
          condition: "Electro",
          sourceKey: "DefendersWill_4",
          maxStack: 1,
          stats: {
            electro_res_: 30
          }
        }, {
          type: "artifact",
          condition: "Hydro",
          sourceKey: "DefendersWill_4",
          maxStack: 1,
          stats: {
            hydro_res_: 30
          }
        }, {
          type: "artifact",
          condition: "pyro",
          sourceKey: "DefendersWill_4",
          maxStack: 1,
          stats: {
            pyro_res_: 30
          }
        }, {
          type: "artifact",
          condition: "Cryo",
          sourceKey: "DefendersWill_4",
          maxStack: 1,
          stats: {
            cryo_res_: 30
          }
        },
      ]
    }
  }
}
export default artifact