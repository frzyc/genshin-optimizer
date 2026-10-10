import { LocalStorageUsageCard } from '@genshin-optimizer/common/react-util'
import { CardThemed, useTitle } from '@genshin-optimizer/common/ui'
import { DatabaseCard } from '@genshin-optimizer/gi/ui'
import { Box, CardContent } from '@mui/material'
import { useMemo } from 'react'

export default function PageSettings() {
  useTitle(useMemo(() => 'Settings', []))
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
