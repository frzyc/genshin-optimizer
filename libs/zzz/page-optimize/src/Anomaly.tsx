import {
  type Document,
  DocumentDisplay,
} from '@genshin-optimizer/game-opt/sheet-ui'
import { buffs, conditionals } from '@genshin-optimizer/zzz/formula'
import { TagDisplay } from '@genshin-optimizer/zzz/formula-ui'
import { Box } from '@mui/system'

export function AnomalySection() {
  return (
    <Box>
      {anomalyDocs.map((doc, index) => (
        <DocumentDisplay key={index} document={doc} />
      ))}
    </Box>
  )
}

const anomalyDocs: Document[] = [
  {
    type: 'conditional',
    conditional: {
      label: 'Frostbite',
      metadata: conditionals.anomaly.frostbite,
      fields: [
        {
          title: <TagDisplay tag={buffs.anomaly.frostbite_crit_dmg_.tag} />,
          fieldRef: buffs.anomaly.frostbite_crit_dmg_.tag,
        },
      ],
    },
  },
]
