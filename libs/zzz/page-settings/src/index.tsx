import { CardThemed } from '@genshin-optimizer/common/ui'
import { DatabaseCard } from '@genshin-optimizer/zzz/ui'
import { CardContent } from '@mui/material'

export default function PageSettings() {
  return (
    <CardThemed sx={{ my: 1 }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <DatabaseCard />
      </CardContent>
    </CardThemed>
  )
}
