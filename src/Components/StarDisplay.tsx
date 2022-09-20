import { faStar } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Rarity } from '../Types/consts'
import ColorText from './ColoredText'

export const StarIcon = () => <FontAwesomeIcon icon={faStar} />
export const StarsDisplay = ({ stars, colored = false }: { stars: Rarity, colored?: boolean }) =>
  <ColorText color={colored ? "warning" : undefined} >
    {stars ? [...Array(stars).keys()].map((_, i) => <StarIcon key={i} />) : null}
  </ColorText>
