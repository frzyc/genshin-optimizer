import { faStar } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Rarity } from '../Types/consts'

const StarIcon = () => <FontAwesomeIcon icon={faStar} />
const Stars = ({ stars, colored = false }: { stars: Rarity, colored?: boolean }) => <span className={colored ? "text-5star" : ""}>
  {stars ? [...Array(stars).keys()].map((_, i) => <StarIcon key={i} />) : null}
</span>

export {
  StarIcon,
  Stars
}
