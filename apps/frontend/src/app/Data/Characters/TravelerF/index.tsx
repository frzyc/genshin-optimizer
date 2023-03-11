import { trans } from '../../SheetUtil'
import Traveler from '../Traveler'
const [chg] = trans('char', 'TravelerF')

export default {
  sheet: {
    ...Traveler.sheet,
    name: chg('name'),
    gender: 'F',
    constellationName: chg('constellationName'),
    title: chg('title'),
  },
  data_gen: Traveler.data_gen,
} as const
