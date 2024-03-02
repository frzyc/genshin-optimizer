import { DropdownButton, SqBadge } from '@genshin-optimizer/common/ui'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import { Button, ButtonGroup, MenuItem } from '@mui/material'
import { useContext } from 'react'
import { TeamCharacterContext } from '../../Context/TeamCharacterContext'

/**
 * The UI component that modifies the compare data in a TeamChar.
 * This is used in conjuction with useOldData hook to supply a oldData to the compare UI.
 */

// TODO: Translation
export default function CompareBtn() {
  const database = useDatabase()
  const {
    teamCharId,
    teamChar: {
      buildType,
      buildId,
      buildIds,
      buildTcId,
      buildTcIds,
      compare,
      compareType,
      compareBuildId,
      compareBuildTcId,
      buildId: teamCharBuildId,
      buildTcId: teamCharBuildTcId,
    },
  } = useContext(TeamCharacterContext)
  const selectedLabel =
    compareType === 'real' ? (
      database.builds.get(compareBuildId).name
    ) : compareType === 'tc' ? (
      <span>
        {database.buildTcs.get(compareBuildTcId).name}{' '}
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
    <ButtonGroup>
      <Button
        startIcon={compare ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
        color={compare ? 'success' : 'secondary'}
        onClick={() =>
          database.teamChars.set(teamCharId, { compare: !compare })
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
            database.teamChars.set(teamCharId, {
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
        {buildIds.map((buildId) => (
          <MenuItem
            disabled={!database.builds.get(buildId).weaponId}
            key={buildId}
            onClick={() =>
              database.teamChars.set(teamCharId, {
                compareType: 'real',
                compareBuildId: buildId,
              })
            }
          >
            {database.builds.get(buildId).name}{' '}
            {buildType === 'real' && buildId === teamCharBuildId && (
              <SqBadge color="info" sx={{ ml: 1 }}>
                Current
              </SqBadge>
            )}
          </MenuItem>
        ))}
        {buildTcIds.map((buildTcId) => (
          <MenuItem
            key={buildTcId}
            onClick={() =>
              database.teamChars.set(teamCharId, {
                compareType: 'tc',
                compareBuildTcId: buildTcId,
              })
            }
          >
            {database.buildTcs.get(buildTcId).name}{' '}
            <SqBadge color="info" sx={{ ml: 1 }}>
              TC
            </SqBadge>
            {buildType === 'tc' && buildTcId === teamCharBuildTcId && (
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
