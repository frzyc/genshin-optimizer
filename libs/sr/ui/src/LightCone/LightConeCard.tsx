import { CardThemed } from '@genshin-optimizer/common/ui'
import { CardContent, Stack, Typography } from '@mui/material'
import { useLightCone } from '../Hook'

type LightConeCardProps = {
  lightConeId: string
}
export function LightConeCard({ lightConeId }: LightConeCardProps) {
  const databaseLightCone = useLightCone(lightConeId)
  const lightCone = databaseLightCone
  return (
    <Stack>
      <CardThemed>
        <CardContent>
          {lightCone && (
            <>
              <Typography>Key: {lightCone.key}</Typography>
              <Typography>Level: {lightCone.level}</Typography>
              <Typography>Ascension: {lightCone.ascension}</Typography>
              <Typography>Superimpose: {lightCone.superimpose}</Typography>
              <Typography>Main: 0</Typography>
            </>
          )}
        </CardContent>
      </CardThemed>
    </Stack>
  )
}
