import { CardThemed, SqBadge } from '@genshin-optimizer/common/ui'
import { notEmpty } from '@genshin-optimizer/common/util'
import { TeamCharacterContext, useDatabase } from '@genshin-optimizer/gi/db-ui'
import { ArtifactCardPico, CharIconSide } from '@genshin-optimizer/gi/ui'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import InfoIcon from '@mui/icons-material/Info'
import {
  Box,
  Button,
  Chip,
  Grid,
  Skeleton,
  Tooltip,
  Typography,
} from '@mui/material'
import type { ReactNode } from 'react'
import { Suspense, memo, useContext } from 'react'
import { useTranslation } from 'react-i18next'
export const UseTeammateArt = memo(function UseTeammateArt({
  totalTally,
  useTeammateBuild,
  disabled = false,
}: {
  totalTally: ReactNode
  useTeammateBuild: boolean
  disabled?: boolean
}) {
  const { t } = useTranslation('page_character_optimize')
  const database = useDatabase()
  const {
    teamCharId,
    teamChar: { optConfigId },
    team: { loadoutData },
  } = useContext(TeamCharacterContext)
  return (
    <Tooltip
      arrow
      title={
        <Box>
          <Suspense
            fallback={
              <Skeleton variant="rectangular" width={400} height={400} />
            }
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              {loadoutData
                .filter(notEmpty)
                .filter(
                  (loadoutDatum) => loadoutDatum.teamCharId !== teamCharId
                )
                .map((loadoutDatum) => {
                  const characterKey = database.teamChars.get(
                    loadoutDatum?.teamCharId
                  )?.key
                  const artifacts =
                    loadoutDatum.buildType === 'tc'
                      ? undefined
                      : database.teams.getLoadoutArtifacts(loadoutDatum)
                  return (
                    <CardThemed
                      sx={{
                        p: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                      }}
                      key={loadoutDatum.teamCharId}
                    >
                      <Box display="flex" alignItems="center" gap={1}>
                        {characterKey && (
                          <CharIconSide characterKey={characterKey} />
                        )}
                        <Typography>
                          {database.teams.getActiveBuildName(loadoutDatum)}
                        </Typography>
                      </Box>
                      {artifacts ? (
                        <Grid container columns={5} spacing={1}>
                          {Object.entries(artifacts).map(([slotKey, art]) => (
                            <Grid item key={slotKey} xs={1}>
                              <ArtifactCardPico
                                artifactObj={art}
                                slotKey={slotKey}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        <Typography>
                          <SqBadge sx={{ width: '100%' }}>
                            {t('tcBadge')}
                          </SqBadge>
                        </Typography>
                      )}
                    </CardThemed>
                  )
                })}
            </Box>
          </Suspense>
        </Box>
      }
    >
      {/* Box wrappper due to disabled */}
      <Box>
        <Button
          fullWidth
          startIcon={
            useTeammateBuild ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />
          }
          endIcon={<InfoIcon />}
          color={useTeammateBuild ? 'success' : 'secondary'}
          onClick={() => {
            database.optConfigs.set(optConfigId, {
              useTeammateBuild: !useTeammateBuild,
            })
          }}
          disabled={disabled}
        >
          <Box display="flex" gap={1}>
            <span>{t('useTeamArts')}</span>
            <Chip label={totalTally} size="small" />
          </Box>
        </Button>
      </Box>
    </Tooltip>
  )
})
