import { styled } from '@mui/material'
import type { ElementKey } from '../../Types/consts'

interface TalentIconProps {
  element: ElementKey
}
const TalentIcon = styled('img', {
  name: 'TalentIcon',
  slot: 'Root',
})<TalentIconProps>(({ theme, element }) => ({
  backgroundImage: `linear-gradient(${theme.palette[element].light},${theme.palette[element].dark})`,
  borderRadius: '50%',
}))
export default TalentIcon
