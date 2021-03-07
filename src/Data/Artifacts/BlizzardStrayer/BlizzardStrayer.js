import flower from './Item_Snowswept_Memory.png'
import plume from './Item_Icebreaker\'s_Resolve.png'
import sands from './Item_Frozen_Homeland\'s_Demise.png'
import goblet from './Item_Frost-Weaved_Dignity.png'
import circlet from './Item_Broken_Rime\'s_Echo.png'
let artifact = {//Icebreaker
  name: "Blizzard Strayer", rarity: [4, 5],
  pieces: {
    flower: "Snowswept Memory",
    plume: "Icebreaker's Resolve",
    sands: "Frozen Homeland's Demise",
    goblet: "Frost-Weaved Dignity",
    circlet: "Broken Rime's Echo"
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
      text: <span><span className="text-cryo">Cryo DMG Bonus</span> +15%</span>,
      stats: { cryo_dmg_: 15 }
    },
    4: {
      text: <span>When a character attacks an enemy affected by <span className="text-cryo">Cryo</span>, their CRIT Rate is increased by 20%. If the enemy is Frozen, CRIT Rate is increased by an additional 20%</span>,
      conditional: [{
        type: "artifact",
        sourceKey: "BlizzardStrayer_4",
        condition: "Enemy affected by Cryo",
        maxStack: 1,
        stats: {
          critRate_: 20,
        }
      }, {
        type: "artifact",
        sourceKey: "BlizzardStrayer_4",
        condition: "Frozen Enemy",
        maxStack: 1,
        stats: {
          critRate_: 40,
        }
      }]
    }
  }
}
export default artifact