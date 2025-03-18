import { iconInlineProps } from '@genshin-optimizer/common/svgicons'
import { ColorText, SqBadge } from '@genshin-optimizer/common/ui'
import type { AdditiveReactionKey } from '@genshin-optimizer/gi/consts'
import {
  DendroIcon,
  ElectroIcon,
  ElementIcon,
} from '@genshin-optimizer/gi/svgicons'
import { Box } from '@mui/material'
import { useTranslation } from 'react-i18next'

const sqBadgeStyle = { mx: 0.25, px: 0.25 }
export function AdditiveReactionModeText({
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
      {'+'}
      <SqBadge sx={sqBadgeStyle} color={'electro'}>
        <ElectroIcon {...iconInlineProps} />
      </SqBadge>
      {'+'}
      <SqBadge sx={sqBadgeStyle} color={trigger}>
        <ElementIcon ele={trigger} iconProps={iconInlineProps} />
      </SqBadge>
    </Box>
  )
}
