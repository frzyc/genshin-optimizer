import { Box } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { ElementIcon } from '../KeyMap/StatIcon'
import { iconInlineProps } from '../SVGIcons'
import DendroIcon from '../SVGIcons/Element/DendroIcon'
import ElectroIcon from '../SVGIcons/Element/ElectroIcon'
import type { AdditiveReactionKey } from '../Types/consts'
import ColorText from './ColoredText'
import SqBadge from './SqBadge'

const sqBadgeStyle = { mx: 0.25, px: 0.25 }
export default function AdditiveReactionModeText({
  reaction,
}: {
  reaction: AdditiveReactionKey
}) {
  const { t } = useTranslation('sheet_gen')

  const trigger = reaction === 'spread' ? 'dendro' : 'electro'

  return (
    <Box display="flex" alignItems="center">
      <ColorText color={reaction}>{t(`reaction.${reaction}`)}</ColorText>
      <SqBadge sx={sqBadgeStyle} color={'dendro'}>
        <DendroIcon {...iconInlineProps} />
      </SqBadge>
      {`+`}
      <SqBadge sx={sqBadgeStyle} color={'electro'}>
        <ElectroIcon {...iconInlineProps} />
      </SqBadge>
      {`+`}
      <SqBadge sx={sqBadgeStyle} color={trigger}>
        <ElementIcon ele={trigger} iconProps={iconInlineProps} />
      </SqBadge>
    </Box>
  )
}
