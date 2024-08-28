import { CardThemed } from '@genshin-optimizer/common/ui'
import {
  lightConeData,
  own,
  srCalculatorWithEntries,
  withMember,
} from '@genshin-optimizer/sr/formula'
import { CardContent, Typography } from '@mui/material'
import { useLightCone } from '../Hook'
type LightConeCardProps = {
  lightConeId: string
}
export function LightConeCard({ lightConeId }: LightConeCardProps) {
  const lightCone = useLightCone(lightConeId)

  const calc = srCalculatorWithEntries(
    withMember('0', ...lightConeData(lightCone))
  )

  if (!lightCone) return null
  return (
    <CardThemed>
      <CardContent>
        <Typography>Key: {lightCone.key}</Typography>
        <Typography>Level: {lightCone.level}</Typography>
        <Typography>Ascension: {lightCone.ascension}</Typography>
        <Typography>Superimpose: {lightCone.superimpose}</Typography>
        <Typography>
          ATK: {calc?.compute(own.base.atk.with('sheet', 'lightCone')).val}
        </Typography>
        <Typography>
          HP: {calc?.compute(own.base.hp.with('sheet', 'lightCone')).val}
        </Typography>
        <Typography>
          DEF: {calc?.compute(own.base.def.with('sheet', 'lightCone')).val}
        </Typography>
      </CardContent>
    </CardThemed>
  )
}
