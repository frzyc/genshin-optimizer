import flower from './flower.png'
import plume from './plume.png'
import sands from './sands.png'
import goblet from './goblet.png'
import circlet from './circlet.png'
import { IArtifactSheet } from '../../../Types/artifact'
import ColorText from '../../../Components/ColoredText'
const artifact: IArtifactSheet = {
  name: "Tiny Miracle", rarity: [3, 4],
  icons: {
    flower,
    plume,
    sands,
    goblet,
    circlet
  },
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
        conditional: {
          key: "4",
          name: "Incoming DMG",
          states: {
            anemo: {
              name: <ColorText color="anemo">Anemo</ColorText>,
              stats: { anemo_res_: 30 }
            },
            geo: {
              name: <ColorText color="geo">Geo</ColorText>,
              stats: { geo_res_: 30 }
            },
            electro: {
              name: <ColorText color="electro">Electro</ColorText>,
              stats: { electro_res_: 30 }
            },
            hydro: {
              name: <ColorText color="hydro">Hydro</ColorText>,
              stats: { hydro_res_: 30 }
            },
            pyro: {
              name: <ColorText color="pyro">Pyro</ColorText>,
              stats: { pyro_res_: 30 }
            },
            cryo: {
              name: <ColorText color="cryo">Cryo</ColorText>,
              stats: { cryo_res_: 30 }
            }
          },
          fields: [{
            text: "CD",
            value: "10s"
          }]
        }
      }]
    }
  }
}
export default artifact