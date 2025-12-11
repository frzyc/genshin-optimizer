import {
  CardThemed,
  ColorText,
  InfoTooltipInline,
} from '@genshin-optimizer/common/ui'
import type { Team } from '@genshin-optimizer/gi/db'
import type { TeamCharacterContextObj } from '@genshin-optimizer/gi/db-ui'
import { TeamCharacterContext, useTeam } from '@genshin-optimizer/gi/db-ui'
import type { IResonance } from '@genshin-optimizer/gi/sheets'
import {
  hexereiSheet,
  moonsignSheet,
  resonanceSheets,
} from '@genshin-optimizer/gi/sheets'
import type { dataContextObj } from '@genshin-optimizer/gi/ui'
import { DataContext, DocumentDisplay } from '@genshin-optimizer/gi/ui'
import { tally } from '@genshin-optimizer/gi/wr'
import {
  CardContent,
  CardHeader,
  Divider,
  Stack,
  Typography,
} from '@mui/material'
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
    dataContextValue && (
      <DataContext.Provider value={dataContextValue}>
        <TeamCharacterContext.Provider value={teamCharContextObj}>
          <Stack gap={1}>
            <ElementalResonance teamId={teamId} />
            <Moonsign />
            <Hexerei />
          </Stack>
        </TeamCharacterContext.Provider>
      </DataContext.Provider>
    )
  )
}

function ElementalResonance({
  teamId,
}: {
  teamId: string
}) {
  const { t } = useTranslation('page_character')

  const { loadoutData } = useTeam(teamId)!
  const teamCount = loadoutData.reduce((a, t) => a + (t ? 1 : 0), 0)

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

      <>
        <Divider />
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <TeamResonanceDisplay resonances={resonanceSheets} />
        </CardContent>
      </>
    </CardThemed>
  )
}

function Moonsign() {
  const { t } = useTranslation('sheet_gen')

  const { data } = useContext(DataContext)
  const moonsignCount = data.get(tally.moonsign).value

  return (
    <CardThemed bgt="light">
      <CardHeader
        title={
          <span>
            {t('moonsign')}{' '}
            <strong>
              <ColorText color={moonsignCount >= 2 ? 'success' : 'warning'}>
                ({moonsignCount}/2)
              </ColorText>
            </strong>
          </span>
        }
        titleTypographyProps={{ variant: 'h6' }}
      />

      <>
        <Divider />
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <TeamResonanceDisplay resonances={[moonsignSheet]} />
        </CardContent>
      </>
    </CardThemed>
  )
}

function Hexerei() {
  const { t } = useTranslation('sheet_gen')

  const { data } = useContext(DataContext)
  const hexereiCount = data.get(tally.hexerei).value

  return (
    <CardThemed bgt="light">
      <CardHeader
        title={
          <span>
            {t('hexerei')}{' '}
            <strong>
              <ColorText color={hexereiCount >= 2 ? 'success' : 'warning'}>
                ({hexereiCount}/2)
              </ColorText>
            </strong>
          </span>
        }
        titleTypographyProps={{ variant: 'h6' }}
      />

      <>
        <Divider />
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <TeamResonanceDisplay resonances={[hexereiSheet]} />
        </CardContent>
      </>
    </CardThemed>
  )
}

function TeamResonanceDisplay({ resonances }: { resonances: IResonance[] }) {
  const { data } = useContext(DataContext)
  const hasReso = resonances.some((res) => res.canShow(data))
  return (
    <>
      {resonances.map((res, i) => {
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
              <DocumentDisplay sections={res.sections} teamBuffOnly />
            )}
          </CardThemed>
        )
      })}
    </>
  )
}
