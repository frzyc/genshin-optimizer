import { LocalStorageUsageCard } from '@genshin-optimizer/common/react-util'
import { CardThemed } from '@genshin-optimizer/common/ui'
import { DatabaseCard } from '@genshin-optimizer/zzz/ui'
import { Box, CardContent } from '@mui/material'

export default function PageSettings() {
  return (
    <CardThemed sx={{ my: 1 }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box maxWidth="50%">
          <LocalStorageUsageCard />
        </Box>
        <DatabaseCard />
      </CardContent>
    </CardThemed>
  )
}
