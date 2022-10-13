import { trans } from '../../SheetUtil'
import Traveler from '../Traveler'
const [tr] = trans("char", "TravelerF")

export default {
  sheet: {
    ...Traveler.sheet,
    name: tr("name"),
    gender: "F",
    constellationName: tr("constellationName"),
    title: tr("title"),
  },
  data_gen: Traveler.data_gen
} as const
