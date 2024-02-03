import { CardThemed } from '@genshin-optimizer/common/ui'
import { imgAssets } from '@genshin-optimizer/gi/assets'
import type { ArtifactSlotKey } from '@genshin-optimizer/gi/consts'
import { Box } from '@mui/material'
import { assetWrapper } from '../util'

export function ArtifactCardPicoBlank({
  slotKey,
}: {
  slotKey: ArtifactSlotKey
}) {
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
          src={assetWrapper(imgAssets.slot[slotKey]).src}
        />
      </Box>
    </CardThemed>
  )
}
