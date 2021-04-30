import flower from './Item_Snowswept_Memory.png'
import plume from './Item_Icebreaker\'s_Resolve.png'
import sands from './Item_Frozen_Homeland\'s_Demise.png'
import goblet from './Item_Frost-Weaved_Dignity.png'
import circlet from './Item_Broken_Rime\'s_Echo.png'
import { IArtifactSheet } from '../../../Types/artifact'
import { IConditionals } from '../../../Types/IConditional'
const conditionals: IConditionals = {
  set4: {
    name: "Attack enemy",
    states: {
      c: {
        name: "Affected By Cryo",
        stats: { critRate_: 20 }
      },
      f: {
        name: "Frozen",
        stats: { critRate_: 40 }
      }
    }
  }
}
const artifact: IArtifactSheet = {//Icebreaker
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
  conditionals,
  setEffects: {
    2: {
      text: <span><span className="text-cryo">Cryo DMG Bonus</span> +15%</span>,
      stats: { cryo_dmg_: 15 }
    },
    4: {
      text: <span>When a character attacks an enemy affected by <span className="text-cryo">Cryo</span>, their CRIT Rate is increased by 20%. If the enemy is Frozen, CRIT Rate is increased by an additional 20%</span>,
      conditional: conditionals.set4
    }
  }
}
export default artifact