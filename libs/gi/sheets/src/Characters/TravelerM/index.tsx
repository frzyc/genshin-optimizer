import { nameTrans, trans } from '../../SheetUtil'
import Traveler from '../Traveler'
const [chg] = trans('char', 'TravelerM')

export default {
  sheet: {
    ...Traveler.sheet,
    name: nameTrans('TravelerM', chg),
    gender: 'M',
    constellationName: chg('constellationName'),
    title: chg('title'),
  },
  data_gen: Traveler.data_gen,
} as const
