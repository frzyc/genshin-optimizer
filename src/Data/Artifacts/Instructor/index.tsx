import flower from './flower.png'
import plume from './plume.png'
import sands from './sands.png'
import goblet from './goblet.png'
import circlet from './circlet.png'
import { IArtifactSheet } from '../../../Types/artifact'
import { IConditionals } from '../../../Types/IConditional'
import { st } from '../../Characters/SheetUtil'
const conditionals: IConditionals = {
  4: {
    name: st("afterUse.skill"),
    stats: { eleMas: 120 }//TODO: party buff
  }
}
const artifact: IArtifactSheet = {
  name: "Instructor", rarity: [3, 4],
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
      stats: { eleMas: 80 }
    },
    4: {
      document: [{
        conditional: conditionals[4]
      }]
    }
  }
}
export default artifact