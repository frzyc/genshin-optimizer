import {
  type Document,
  DocumentDisplay,
} from '@genshin-optimizer/game-opt/sheet-ui'
import { anomalyMeta } from '@genshin-optimizer/zzz/formula'
import { TagDisplay } from '@genshin-optimizer/zzz/formula-ui'
import { Box } from '@mui/system'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export function AnomalySection() {
  const { t } = useTranslation('page_optimize')

  const anomalyDocs: Document[] = useMemo(() => [
    {
      type: 'conditional',
      conditional: {
        label: t('frostbite'),
        metadata: anomalyMeta.conditionals.frostbite,
        fields: [
          {
            title: <TagDisplay tag={anomalyMeta.buffs.frostbite_crit_dmg_.tag} />,
            fieldRef: anomalyMeta.buffs.frostbite_crit_dmg_.tag,
          },
        ],
      },
    },
    {
      type: 'conditional',
      conditional: {
        label: t('anomalyTimePassed'),
        metadata: anomalyMeta.conditionals.anomTimePassed,
      },
    },
  ], [t])

  return (
    <Box>
      {anomalyDocs.map((doc, index) => (
        <DocumentDisplay key={index} document={doc} />
      ))}
    </Box>
  )
}
