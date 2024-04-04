import { CardThemed } from '@genshin-optimizer/common/ui'
import {
  convert,
  lightConeData,
  selfTag,
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

  const member0 = convert(selfTag, { member: 'member0', et: 'self' })
  const calc = srCalculatorWithEntries(
    withMember('member0', ...lightConeData(lightCone))
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
          ATK: {calc?.compute(member0.base.atk.src('lightCone')).val}
        </Typography>
        <Typography>
          HP: {calc?.compute(member0.base.hp.src('lightCone')).val}
        </Typography>
        <Typography>
          DEF: {calc?.compute(member0.base.def.src('lightCone')).val}
        </Typography>
      </CardContent>
    </CardThemed>
  )
}
