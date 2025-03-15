import { ImgIcon } from '@genshin-optimizer/common/ui'
import {
  characterAsset,
  characterKeyToGenderedKey,
} from '@genshin-optimizer/sr/assets'
import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import { useTeam } from '@genshin-optimizer/sr/db-ui'
import PersonIcon from '@mui/icons-material/Person'
import { Tab, Tabs, Typography, useMediaQuery, useTheme } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

export function TeamCharacterSelector({
  teamId,
  charKey,
}: {
  teamId: string
  charKey?: CharacterKey | undefined
}) {
  const { t } = useTranslation('page_team')
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const team = useTeam(teamId)
  if (!team) return null

  return (
    <Tabs
      variant="fullWidth"
      value={charKey ?? 0}
      orientation={isMobile ? 'vertical' : 'horizontal'}
      sx={() => {
        return {
          borderBottom: '1px rgb(200,200,200,0.3) solid',
          '& .MuiTab-root:hover': {
            transition: 'background-color 0.25s ease',
            backgroundColor: 'rgba(255,255,255,0.1)',
          },
          '& .Mui-selected': {
            color: 'white !important',
          },
          '& .MuiTabs-indicator': {
            height: '4px',
            backgroundColor: 'rgb(200,200,200,0.5)', //team settings
          },
          minHeight: '1em',
        }
      }}
    >
      {team.teamMetadata.map((teammateDatum, ind) => {
        const characterKey = teammateDatum?.characterKey
        return (
          <Tab
            icon={
              characterKey ? (
                <ImgIcon
                  size={1.5}
                  src={characterAsset(
                    characterKeyToGenderedKey(characterKey),
                    'icon',
                  )}
                />
              ) : (
                <PersonIcon />
              )
            }
            iconPosition="start"
            value={characterKey ?? ind}
            key={ind}
            disabled={!teammateDatum}
            label={
              characterKey ? (
                <Typography>{t(`charNames_gen:${characterKey}`)}</Typography>
              ) : (
                `Character ${ind + 1}` // TODO: Translation
              )
            }
            onClick={() =>
              // conserve the current tab when switching to another character
              characterKey && navigate(`/teams/${teamId}/${characterKey}`)
            }
            sx={{ p: 1, minHeight: '1em' }}
          />
        )
      })}
    </Tabs>
  )
}
