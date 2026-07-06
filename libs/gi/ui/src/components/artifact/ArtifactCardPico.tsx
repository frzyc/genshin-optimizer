import { CardThemed } from '@genshin-optimizer/common/ui'
import { artifactAsset, imgAssets } from '@genshin-optimizer/gi/assets'
import type { ArtifactSlotKey } from '@genshin-optimizer/gi/consts'
import type { ICachedArtifact } from '@genshin-optimizer/gi/db'
import { StatIcon } from '@genshin-optimizer/gi/svgicons'
import { Box, Typography } from '@mui/material'
import { ArtifactTooltip } from './ArtifactTooltip'

export function ArtifactCardPico({
  artifactObj: art,
  slotKey: key,
}: {
  artifactObj: ICachedArtifact | undefined
  slotKey: ArtifactSlotKey
}) {
  // Blank artifact slot icon
  if (!art)
    return (
      <CardThemed
        sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      >
        <Box sx={{ width: '100%', pb: '100%', position: 'relative' }}>
          <Box
            sx={{
              position: 'absolute',
              width: '70%',
              height: '70%',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: 0.7,
            }}
            component="img"
            src={imgAssets.slot[key]}
          />
        </Box>
      </CardThemed>
    )

  // Actual artifact icon + info
  const { mainStatKey, rarity, level } = art

  return (
    <ArtifactTooltip art={art}>
      <CardThemed
        sx={{ display: 'flex', flexDirection: 'column', position: 'relative' }}
      >
        <Box
          component="img"
          className={`grad-${rarity}star`}
          src={artifactAsset(art.setKey, art.slotKey)}
          maxWidth="100%"
          maxHeight="100%"
        />
        <Typography
          sx={{
            position: 'absolute',
            fontSize: '0.75rem',
            lineHeight: 1,
            opacity: 0.85,
            pointerEvents: 'none',
            p: 0.25,
          }}
        >
          <strong>+{level}</strong>
        </Typography>
        <Typography
          sx={{
            position: 'absolute',
            fontSize: '0.75rem',
            lineHeight: 1,
            pointerEvents: 'none',
            bottom: 0,
            right: 0,
            p: 0.25,
          }}
        >
          <StatIcon statKey={mainStatKey} iconProps={{ fontSize: 'inherit' }} />
        </Typography>
      </CardThemed>
    </ArtifactTooltip>
  )
}
