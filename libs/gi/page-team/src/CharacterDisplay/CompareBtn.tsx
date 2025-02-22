import { DropdownButton, SqBadge } from '@genshin-optimizer/common/ui'
import { TeamCharacterContext, useDatabase } from '@genshin-optimizer/gi/db-ui'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import type { ButtonGroupProps } from '@mui/material'
import { Button, ButtonGroup, MenuItem } from '@mui/material'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * The UI component that modifies the compare data in a TeamChar.
 * This is used in conjuction with useCompareData hook to supply a compareData to the compare UI.
 */

export default function CompareBtn({
  buttonGroupProps = {},
}: {
  buttonGroupProps?: ButtonGroupProps
}) {
  const { t } = useTranslation('build')
  const database = useDatabase()
  const {
    teamId,
    teamCharId,
    loadoutDatum,
    teamChar: { buildIds, buildTcIds },
  } = useContext(TeamCharacterContext)
  const {
    buildType,
    buildId,
    buildTcId,
    compare,
    compareType,
    compareBuildId,
    compareBuildTcId,
  } = loadoutDatum
  const selectedLabel =
    compareType === 'real' ? (
      database.builds.get(compareBuildId)?.name ?? ''
    ) : compareType === 'tc' ? (
      <span>
        {database.buildTcs.get(compareBuildTcId)?.name ?? ''}{' '}
        <SqBadge color="info" sx={{ ml: 1 }}>
          {t('compareBtn.tcBadge')}
        </SqBadge>
      </span>
    ) : (
      t('compareBtn.equipped')
    )
  const current =
    (compareType === 'equipped' && buildType === 'equipped') ||
    (compareType === 'real' &&
      buildType === 'real' &&
      buildId === compareBuildId) ||
    (compareType === 'tc' &&
      buildType === 'tc' &&
      buildTcId === compareBuildTcId)
  return (
    <ButtonGroup {...buttonGroupProps}>
      <Button
        startIcon={compare ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
        color={compare ? 'success' : 'secondary'}
        onClick={() =>
          database.teams.setLoadoutDatum(teamId, teamCharId, {
            compare: !compare,
          })
        }
      >
        {t('compareBtn.compare')}
      </Button>
      <DropdownButton
        title={
          <>
            {selectedLabel}{' '}
            {current && (
              <SqBadge color="info" sx={{ ml: 1 }}>
                {t('compareBtn.crrBadge')}
              </SqBadge>
            )}
          </>
        }
        disabled={!compare || (!buildIds.length && !buildTcIds.length)}
      >
        <MenuItem
          onClick={() =>
            database.teams.setLoadoutDatum(teamId, teamCharId, {
              compareType: 'equipped',
            })
          }
        >
          {t('compareBtn.equipped')}
          {buildType === 'equipped' && (
            <SqBadge color="info" sx={{ ml: 1 }}>
              {t('compareBtn.crrBadge')}
            </SqBadge>
          )}
        </MenuItem>
        {buildIds.map((bId) => (
          <MenuItem
            disabled={!database.builds.get(bId)?.weaponId}
            key={bId}
            onClick={() =>
              database.teams.setLoadoutDatum(teamId, teamCharId, {
                compareType: 'real',
                compareBuildId: bId,
              })
            }
          >
            {database.builds.get(bId)!.name}{' '}
            {buildType === 'real' && bId === buildId && (
              <SqBadge color="info" sx={{ ml: 1 }}>
                {t('compareBtn.crrBadge')}
              </SqBadge>
            )}
          </MenuItem>
        ))}
        {buildTcIds.map((bTcId) => (
          <MenuItem
            key={bTcId}
            onClick={() =>
              database.teams.setLoadoutDatum(teamId, teamCharId, {
                compareType: 'tc',
                compareBuildTcId: bTcId,
              })
            }
          >
            {database.buildTcs.get(bTcId)?.name ?? ''}{' '}
            <SqBadge color="info" sx={{ ml: 1 }}>
              {t('compareBtn.tcBadge')}
            </SqBadge>
            {buildType === 'tc' && bTcId === buildTcId && (
              <SqBadge color="info" sx={{ ml: 1 }}>
                {t('compareBtn.crrBadge')}
              </SqBadge>
            )}
          </MenuItem>
        ))}
      </DropdownButton>
    </ButtonGroup>
  )
}
