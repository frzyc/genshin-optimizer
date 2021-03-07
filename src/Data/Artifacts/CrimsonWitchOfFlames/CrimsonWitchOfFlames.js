import flower from './Item_Witch\'s_Flower_of_Blaze.png'
import plume from './Item_Witch\'s_Ever-Burning_Plume.png'
import sands from './Item_Witch\'s_End_Time.png'
import goblet from './Item_Witch\'s_Heart_Flames.png'
import circlet from './Item_Witch\'s_Scorching_Hat.png'
let artifact = {
  name: "Crimson Witch of Flames", rarity: [4, 5],
  pieces: {
    flower: "Witch's Flower of Blaze",
    plume: "Witch's Ever-Burning Plume",
    sands: "Witch's End Time",
    goblet: "Witch's Heart Flames",
    circlet: "Witch's Scorching Hat"
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
      text: <span><span className="text-pyro">Pyro DMG Bonus</span> +15%</span>,
      stats: { pyro_dmg_: 15 }
    },
    4: {
      text: "Increases Overloaded and Burning DMG by 40%. Increases Vaporize and Melt DMG by 15%. Using an Elemental Skill increases 2-Piece Set effects by 50% for 10s. Max 3 stacks.",
      stats: {
        overloaded_dmg_: 40,
        burning_dmg_: 40,
        vaporize_dmg_: 15,
        melt_dmg_: 15,
      },
      conditional: {
        type: "artifact",
        sourceKey: "CrimsonWitchOfFlames_4",
        maxStack: 3,
        stats: {
          pyro_dmg_: 7.5
        }
      }
    }
  }
}
export default artifact