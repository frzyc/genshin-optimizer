import { faBahai, faFeatherAlt, faHourglass, faWineGlass, faCrown, IconDefinition } from '@fortawesome/free-solid-svg-icons'
import { SlotKey } from '../Types/consts'

const SlotIcon: StrictDict<SlotKey, IconDefinition> = {
  flower: faBahai,
  plume: faFeatherAlt,
  sands: faHourglass,
  goblet: faWineGlass,
  circlet: faCrown
}
export default SlotIcon