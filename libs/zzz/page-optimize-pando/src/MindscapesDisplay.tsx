import { range } from '@genshin-optimizer/common/util'
import type { ICachedCharacter } from '@genshin-optimizer/zzz/db'
import { Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

export function MindscapesDisplay({
  character,
}: {
  character: ICachedCharacter
}) {
  const { t } = useTranslation('page_characters')
  const { mindscape } = character
  return (
    <Box component={'div'} sx={{ display: 'flex', flexWrap: 'wrap' }}>
      {range(1, 6).map((index) => (
        <Box
          component={'div'}
          sx={(theme) => ({
            border:
              index <= mindscape
                ? `4px solid ${theme.palette.mindscapeHighlight.main}`
                : `4px solid ${theme.palette.contentZzz.main}`,
            pb: '16px',
            pt: '4px',
            px: '42px',
            borderRadius: '12px',
            flex: 1,
            marginRight: index % 2 !== 0 ? '8px' : '0',
            marginLeft: index % 2 === 0 ? '8px' : '0',
            marginBottom: index <= 4 ? '16px' : '0',
          })}
        >
          <Typography
            variant="h5"
            sx={(theme) => ({
              textAlign: 'center',
              color:
                index <= mindscape
                  ? `${theme.palette.mindscapeHighlight.main}`
                  : `${theme.palette.contentZzz.main}`,
              fontWeight: 900,
            })}
          >
            {t('mindscape', { level: index })}
          </Typography>
          <Typography
            variant="subtitle2"
            sx={(theme) => ({
              textAlign: 'center',
              lineHeight: '0.1',
              color:
                index <= mindscape
                  ? `${theme.palette.mindscapeHighlight.main}`
                  : `${theme.palette.contentZzz.main}`,
              fontWeight: 900,
              textTransform: 'uppercase',
            })}
          >
            {t('mindscapeTitle')}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}
