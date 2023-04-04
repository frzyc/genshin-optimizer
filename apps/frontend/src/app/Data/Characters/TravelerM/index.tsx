import { sillyNameTrans, trans } from '../../SheetUtil'
import Traveler from '../Traveler'
const [chg] = trans('char', 'TravelerM')

export default {
  sheet: {
    ...Traveler.sheet,
    name: sillyNameTrans('TravelerM'),
    gender: 'M',
    constellationName: chg('constellationName'),
    title: chg('title'),
  },
  data_gen: Traveler.data_gen,
} as const
