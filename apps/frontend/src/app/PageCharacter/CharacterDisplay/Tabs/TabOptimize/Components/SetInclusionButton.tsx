import type { ArtSetExclusionKey } from '@genshin-optimizer/gi/db'
import { handleArtSetExclusion } from '@genshin-optimizer/gi/db'
import { CheckBox, CheckBoxOutlineBlank } from '@mui/icons-material'
import BlockIcon from '@mui/icons-material/Block'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import type { SxProps, Theme } from '@mui/material'
import { Button, ButtonGroup } from '@mui/material'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { CharacterContext } from '../../../../../Context/CharacterContext'
import useBuildSetting from '../useBuildSetting'

export default function SetInclusionButton({
  setKey,
  buttonGroupSx,
}: {
  setKey: ArtSetExclusionKey
  buttonGroupSx?: SxProps<Theme>
}) {
  const { t } = useTranslation('sheet')
  const {
    character: { key: characterKey },
  } = useContext(CharacterContext)
  const {
    buildSetting: { artSetExclusion },
    buildSettingDispatch,
  } = useBuildSetting(characterKey)
  const setExclusionSet = artSetExclusion?.[setKey] ?? []
  const exclude2 = setExclusionSet.includes(2)
  const exclude4 = setExclusionSet.includes(4)

  return (
    <ButtonGroup sx={buttonGroupSx} fullWidth>
      <Button
        startIcon={exclude2 ? <CheckBoxOutlineBlank /> : <CheckBox />}
        onClick={() =>
          buildSettingDispatch({
            artSetExclusion: handleArtSetExclusion(artSetExclusion, setKey, 2),
          })
        }
        color={exclude2 ? 'secondary' : 'success'}
        endIcon={exclude2 ? <BlockIcon /> : <ShowChartIcon />}
      >{t`2set`}</Button>
      <Button
        startIcon={exclude4 ? <CheckBoxOutlineBlank /> : <CheckBox />}
        onClick={() =>
          buildSettingDispatch({
            artSetExclusion: handleArtSetExclusion(artSetExclusion, setKey, 4),
          })
        }
        color={exclude4 ? 'secondary' : 'success'}
        endIcon={exclude4 ? <BlockIcon /> : <ShowChartIcon />}
      >{t`4set`}</Button>
    </ButtonGroup>
  )
}
