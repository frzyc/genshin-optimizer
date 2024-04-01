import { CardThemed } from '@genshin-optimizer/common/ui'
import { convert, selfTag } from '@genshin-optimizer/sr/formula'
import { CardContent, Typography } from '@mui/material'
import { useCalcContext } from '../Context'
import { useLightCone } from '../Hook'

type LightConeCardProps = {
  lightConeId: string
}
export function LightConeCard({ lightConeId }: LightConeCardProps) {
  const lightCone = useLightCone(lightConeId)
  const { calc } = useCalcContext()
  const member0 = convert(selfTag, { member: 'member0', et: 'self' })

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
