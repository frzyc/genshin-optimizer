import flower from './flower.png'
import plume from './plume.png'
import sands from './sands.png'
import goblet from './goblet.png'
import circlet from './circlet.png'
import { IArtifactSheet } from '../../../Types/artifact'
import { IConditionals } from '../../../Types/IConditional'
import ColorText from '../../../Components/ColoredText'
const conditionals: IConditionals = {
  4: {
    name: "Incoming DMG",
    states: {
      anemo: {
        name: <ColorText color="anemo">Anemo</ColorText>,
        stats: { anemo_res_: 30 }//TODO: party conditional
      },
      geo: {
        name: <ColorText color="geo">Geo</ColorText>,
        stats: { geo_res_: 30 }//TODO: party conditional
      },
      electro: {
        name: <ColorText color="electro">Electro</ColorText>,
        stats: { electro_res_: 30 }//TODO: party conditional
      },
      hydro: {
        name: <ColorText color="hydro">Hydro</ColorText>,
        stats: { hydro_res_: 30 }//TODO: party conditional
      },
      pyro: {
        name: <ColorText color="pyro">Pyro</ColorText>,
        stats: { pyro_res_: 30 }//TODO: party conditional
      },
      cryo: {
        name: <ColorText color="cryo">Cryo</ColorText>,
        stats: { cryo_res_: 30 }//TODO: party conditional
      }
    },
    fields: [{
      text: "CD",
      value: "10s"
    }]
  }

}
const artifact: IArtifactSheet = {
  name: "Tiny Miracle", rarity: [3, 4],
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
      stats: {
        anemo_res_: 20,
        geo_res_: 20,
        electro_res_: 20,
        hydro_res_: 20,
        pyro_res_: 20,
        cryo_res_: 20,
      }
    },
    4: {
      document: [{
        conditional: conditionals[4]
      }]
    }
  }
}
export default artifact