import { Translate } from '../../../Components/Translate'
import Traveler from '../Traveler'
const key = "TravelerM"
const tr = (strKey: string) => <Translate ns={`char_${key}_gen`} key18={strKey} />

export default {
  sheet: {
    ...Traveler.sheet,
    name: tr("name"),
    gender: "M",
    constellationName: tr("constellationName"),
    title: tr("title"),
  },
  data_gen: Traveler.data_gen
} as const
