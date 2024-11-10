import type { DropdownButtonProps } from '@genshin-optimizer/common/ui'
import { DropdownButton, SqBadge } from '@genshin-optimizer/common/ui'
import type { LoadoutDatum } from '@genshin-optimizer/gi/db'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import { Box, MenuItem } from '@mui/material'
import { useTranslation } from 'react-i18next'

export default function BuildDropdown({
  teamId,
  loadoutDatum,
  dropdownBtnProps = {},
}: {
  teamId: string
  loadoutDatum: LoadoutDatum
  dropdownBtnProps?: Omit<DropdownButtonProps, 'children' | 'title'>
}) {
  const { t } = useTranslation('build')
  const database = useDatabase()
  const { teamCharId, buildType, buildId, buildTcId } = loadoutDatum
  const teamChar = database.teamChars.get(teamCharId)!
  const { buildIds, buildTcIds } = teamChar
  const onChangeLoadoutDatum = (l: Partial<LoadoutDatum>) =>
    database.teams.setLoadoutDatum(teamId, teamCharId, l)

  return (
    <DropdownButton
      startIcon={<CheckroomIcon />}
      title={
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <span>{database.teams.getActiveBuildName(loadoutDatum)}</span>
          {buildType === 'tc' && (
            <SqBadge color="success">{t('buildDropdown.tcBadge')}</SqBadge>
          )}
        </Box>
      }
      {...dropdownBtnProps}
    >
      <MenuItem
        disabled={buildType === 'equipped'}
        onClick={() => onChangeLoadoutDatum({ buildType: 'equipped' })}
        sx={{ display: 'flex', gap: 1 }}
      >
        {t('buildDropdown.equipped')}
      </MenuItem>
      {buildIds.map((bId) => {
        const { name } = database.builds.get(bId)!
        return (
          <MenuItem
            key={bId}
            disabled={buildType === 'real' && bId === buildId}
            onClick={() =>
              onChangeLoadoutDatum({ buildType: 'real', buildId: bId })
            }
            sx={{ display: 'flex', gap: 1 }}
          >
            {name}
          </MenuItem>
        )
      })}

      {buildTcIds.map((btcId) => {
        const { name } = database.buildTcs.get(btcId)!
        return (
          <MenuItem
            key={btcId}
            disabled={buildType === 'tc' && btcId === buildTcId}
            onClick={() =>
              onChangeLoadoutDatum({ buildType: 'tc', buildTcId: btcId })
            }
            sx={{ display: 'flex', gap: 1 }}
          >
            <span>{name}</span>
            <SqBadge color="success">{t('buildDropdown.tcBadge')}</SqBadge>
          </MenuItem>
        )
      })}
    </DropdownButton>
  )
}
