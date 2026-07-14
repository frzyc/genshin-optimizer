import { iconInlineProps } from '@genshin-optimizer/common/svgicons'
import { ColorText, SqBadge } from '@genshin-optimizer/common/ui'
import type { AmpReactionKey } from '@genshin-optimizer/gi/consts'
import { ElementIcon } from '@genshin-optimizer/gi/svgicons'
import { Box } from '@mui/material'
import { useTranslation } from 'react-i18next'

export const ampReactionMap = {
  melt: {
    cryo: 'pyro',
    pyro: 'cryo',
  },
  vaporize: {
    hydro: 'pyro',
    pyro: 'hydro',
  },
} as const
const sqBadgeStyle = { mx: 0.25, px: 0.25 }
export function AmpReactionModeText({
  reaction,
  trigger,
}: {
  reaction: AmpReactionKey
  trigger?: 'cryo' | 'pyro' | 'hydro'
}) {
  const { t } = useTranslation('sheet_gen')
  if (!trigger)
    trigger = Object.keys(ampReactionMap[reaction])[0] as
      | 'cryo'
      | 'pyro'
      | 'hydro'
  const base = (ampReactionMap[reaction] as any)[trigger] as
    | 'cryo'
    | 'pyro'
    | 'hydro'
    | undefined
  if (!base) return null

  return (
    <Box display="flex" alignItems="center">
      <ColorText color="melt">{t(`reaction.${reaction}`)}</ColorText>
      <SqBadge sx={sqBadgeStyle} color={base}>
        {<ElementIcon ele={base} iconProps={iconInlineProps} />}
      </SqBadge>
      {'+'}
      <SqBadge sx={sqBadgeStyle} color={trigger as 'cryo' | 'pyro' | 'hydro'}>
        {<ElementIcon ele={trigger} iconProps={iconInlineProps} />}
      </SqBadge>
    </Box>
  )
}
