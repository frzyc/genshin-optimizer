import { CardThemed, SqBadge } from '@genshin-optimizer/common_ui'
import { allElementWithPhyKeys } from '@genshin-optimizer/gi_consts'
import { artifactAsset } from '@genshin-optimizer/gi_assets'
import type { Artifact } from '@genshin-optimizer/gi_frontend-gql'
import { StatIcon } from '@genshin-optimizer/gi_svgicons'
import { artifactLevelVariant } from '@genshin-optimizer/gi_ui'
import { Box, Typography } from '@mui/material'
import { assetWrapper } from '../util'
import ArtifactTooltip from './ArtifactTooltip'

export function ArtifactCardPico({ artifact }: { artifact: Artifact }) {
  // Actual artifact icon + info
  const { mainStatKey, rarity, level } = artifact
  const element = allElementWithPhyKeys.find((ele) =>
    artifact.mainStatKey.includes(ele)
  )
  const color = element ?? 'secondary'

  return (
    <ArtifactTooltip artifact={artifact}>
      <CardThemed
        sx={{ display: 'flex', flexDirection: 'column', position: 'relative' }}
      >
        <Box
          component="img"
          className={`grad-${rarity}star`}
          src={
            assetWrapper(artifactAsset(artifact.setKey, artifact.slotKey)).src
          }
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
          }}
        >
          <strong>
            <SqBadge sx={{ p: 0.5 }} color={artifactLevelVariant(level)}>
              <strong>+{level}</strong>
            </SqBadge>
          </strong>
        </Typography>
        <Typography
          sx={{
            position: 'absolute',
            fontSize: '0.75rem',
            lineHeight: 1,
            opacity: 0.85,
            pointerEvents: 'none',
            bottom: 0,
            right: 0,
          }}
        >
          <SqBadge color={color} sx={{ p: 0.5 }}>
            <StatIcon
              statKey={mainStatKey}
              iconProps={{ fontSize: 'inherit' }}
            />
          </SqBadge>
        </Typography>
      </CardThemed>
    </ArtifactTooltip>
  )
}
