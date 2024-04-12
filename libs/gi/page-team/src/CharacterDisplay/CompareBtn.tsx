import { DropdownButton, SqBadge } from '@genshin-optimizer/common/ui'
import { TeamCharacterContext, useDatabase } from '@genshin-optimizer/gi/db-ui'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import type { ButtonGroupProps } from '@mui/material'
import { Button, ButtonGroup, MenuItem } from '@mui/material'
import { useContext } from 'react'

/**
 * The UI component that modifies the compare data in a TeamChar.
 * This is used in conjuction with useCompareData hook to supply a compareData to the compare UI.
 */

// TODO: Translation
export default function CompareBtn({
  buttonGroupProps = {},
}: {
  buttonGroupProps?: ButtonGroupProps
}) {
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
          TC
        </SqBadge>
      </span>
    ) : (
      'Equipped'
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
        Compare
      </Button>
      <DropdownButton
        title={
          <>
            {selectedLabel}{' '}
            {current && (
              <SqBadge color="info" sx={{ ml: 1 }}>
                Current
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
          Equipped{' '}
          {buildType === 'equipped' && (
            <SqBadge color="info" sx={{ ml: 1 }}>
              Current
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
                Current
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
              TC
            </SqBadge>
            {buildType === 'tc' && bTcId === buildTcId && (
              <SqBadge color="info" sx={{ ml: 1 }}>
                Current
              </SqBadge>
            )}
          </MenuItem>
        ))}
      </DropdownButton>
    </ButtonGroup>
  )
}
