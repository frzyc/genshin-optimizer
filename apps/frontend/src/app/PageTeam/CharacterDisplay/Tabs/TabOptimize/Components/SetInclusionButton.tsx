import type {
  ArtSetExclusion,
  ArtSetExclusionKey,
} from '@genshin-optimizer/gi/db'
import { handleArtSetExclusion } from '@genshin-optimizer/gi/db'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material'
import BlockIcon from '@mui/icons-material/Block'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import type { SxProps, Theme } from '@mui/material'
import { Button, ButtonGroup } from '@mui/material'
import { useTranslation } from 'react-i18next'

export default function SetInclusionButton({
  setKey,
  buttonGroupSx,
  setExclusionSet,
  optConfigId,
}: {
  setKey: ArtSetExclusionKey
  buttonGroupSx?: SxProps<Theme>
  setExclusionSet: ArtSetExclusion[keyof ArtSetExclusion]
  optConfigId: string
}) {
  const { t } = useTranslation('sheet')
  const exclude2 = setExclusionSet?.includes(2)
  const exclude4 = setExclusionSet?.includes(4)
  const database = useDatabase()

  return (
    <ButtonGroup sx={buttonGroupSx} fullWidth>
      <Button
        startIcon={exclude2 ? <CheckBoxOutlineBlank /> : <CheckBox />}
        onClick={() =>
          database.optConfigs.set(optConfigId, ({ artSetExclusion }) => ({
            artSetExclusion: handleArtSetExclusion(artSetExclusion, setKey, 2),
          }))
        }
        color={exclude2 ? 'secondary' : 'success'}
        endIcon={exclude2 ? <BlockIcon /> : <ShowChartIcon />}
      >{t`2set`}</Button>
      <Button
        startIcon={exclude4 ? <CheckBoxOutlineBlank /> : <CheckBox />}
        onClick={() =>
          database.optConfigs.set(optConfigId, ({ artSetExclusion }) => ({
            artSetExclusion: handleArtSetExclusion(artSetExclusion, setKey, 4),
          }))
        }
        color={exclude4 ? 'secondary' : 'success'}
        endIcon={exclude4 ? <BlockIcon /> : <ShowChartIcon />}
      >{t`4set`}</Button>
    </ButtonGroup>
  )
}
