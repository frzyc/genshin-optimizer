import { trans } from '../../SheetUtil'
import Traveler from '../Traveler'
const [tr] = trans("char", "TravelerM")

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
