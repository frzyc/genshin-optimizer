import {
  CardThemed,
  ColorText,
  InfoTooltipInline,
} from '@genshin-optimizer/common/ui'
import type { Team } from '@genshin-optimizer/gi/db'
import type { TeamCharacterContextObj } from '@genshin-optimizer/gi/db-ui'
import { TeamCharacterContext, useTeam } from '@genshin-optimizer/gi/db-ui'
import { resonanceSheets } from '@genshin-optimizer/gi/sheets'
import type { dataContextObj } from '@genshin-optimizer/gi/ui'
import { DataContext, DocumentDisplay } from '@genshin-optimizer/gi/ui'
import { CardContent, CardHeader, Divider, Typography } from '@mui/material'
import { useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export function ResonanceDisplay({
  teamId,
  team,
  dataContextValue,
}: {
  teamId: string
  team: Team
  dataContextValue?: dataContextObj
}) {
  const { t } = useTranslation('page_character')

  const { loadoutData } = useTeam(teamId)!
  const teamCount = loadoutData.reduce((a, t) => a + (t ? 1 : 0), 0)

  // This context is only used by the ResonanceDisplay, which needs to attach conditional values to team data.
  const teamCharContextObj = useMemo(
    () =>
      ({
        teamId,
        team,
        teamCharId: '', // can be left blank since its only modifying team conditional
        teamChar: {},
      }) as TeamCharacterContextObj,
    [team, teamId]
  )

  return (
    <CardThemed bgt="light">
      <CardHeader
        title={
          <span>
            {t('tabTeambuff.team_reso')}{' '}
            <strong>
              <ColorText color={teamCount >= 4 ? 'success' : 'warning'}>
                ({teamCount}/4)
              </ColorText>
            </strong>{' '}
            <InfoTooltipInline
              title={<Typography>{t('tabTeambuff.resonance_tip')}</Typography>}
            />
          </span>
        }
        titleTypographyProps={{ variant: 'h6' }}
      />

      {dataContextValue && (
        <>
          <Divider />
          <CardContent
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <DataContext.Provider value={dataContextValue}>
              <TeamCharacterContext.Provider value={teamCharContextObj}>
                <Content />
              </TeamCharacterContext.Provider>
            </DataContext.Provider>
          </CardContent>
        </>
      )}
    </CardThemed>
  )
}
function Content() {
  const { data } = useContext(DataContext)
  const hasReso = resonanceSheets.some((res) => res.canShow(data))
  return (
    <>
      {resonanceSheets.map((res, i) => {
        const show = res.canShow(data)
        if (!show && hasReso) return null
        return (
          <CardThemed key={i} sx={{ opacity: show ? 1 : 0.5 }}>
            <CardHeader
              title={
                <span>
                  {res.name}{' '}
                  <InfoTooltipInline
                    title={<Typography>{res.desc}</Typography>}
                  />
                </span>
              }
              action={res.icon}
              titleTypographyProps={{ variant: 'subtitle2' }}
            />
            {res.canShow(data) && <Divider />}
            {res.canShow(data) && (
              <DocumentDisplay sections={res.sections} teamBuffOnly hideDesc />
            )}
          </CardThemed>
        )
      })}
    </>
  )
}
