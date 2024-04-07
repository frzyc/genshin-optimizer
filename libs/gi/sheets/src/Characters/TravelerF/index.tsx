import { nameTrans, trans } from '../../SheetUtil'
import Traveler from '../Traveler'
const [chg] = trans('char', 'TravelerF')

export default {
  sheet: {
    ...Traveler.sheet,
    name: nameTrans('TravelerF', chg),
    gender: 'F',
    constellationName: chg('constellationName'),
    title: chg('title'),
  },
  data_gen: Traveler.data_gen,
} as const
