import { Box } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { ElementIcon } from '../KeyMap/StatIcon'
import { iconInlineProps } from '../SVGIcons'
import type { AmpReactionKey } from '../Types/consts'
import ColorText from './ColoredText'
import SqBadge from './SqBadge'

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
export default function AmpReactionModeText({
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
  const base = ampReactionMap[reaction][trigger] as
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
      {`+`}
      <SqBadge sx={sqBadgeStyle} color={trigger as 'cryo' | 'pyro' | 'hydro'}>
        {<ElementIcon ele={trigger} iconProps={iconInlineProps} />}
      </SqBadge>
    </Box>
  )
}
