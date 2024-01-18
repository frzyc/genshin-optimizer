import { StatIcon } from '@genshin-optimizer/gi-svgicons'
import {
  CustomNumberInput,
  CustomNumberInputButtonGroupWrapper,
  DropdownButton,
} from '@genshin-optimizer/ui-common'
import { unit } from '@genshin-optimizer/util'
import ClearIcon from '@mui/icons-material/Clear'
import {
  Box,
  Button,
  ButtonGroup,
  CardHeader,
  Divider,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Stack,
} from '@mui/material'
import { useContext } from 'react'
import { ArtifactStatWithUnit } from '../../../../Components/Artifact/ArtifactStatKeyDisplay'
import CardLight from '../../../../Components/Card/CardLight'
import type { MinTotalStatKey } from '../../../../Database/DataManagers/CharacterTCData'
import { minTotalStatKeys } from '../../../../Database/DataManagers/CharacterTCData'
import { CharTCContext } from './CharTCContext'

export function BuildConstaintCard({ disabled }: { disabled: boolean }) {
  const {
    charTC: {
      optimization: { minTotal },
    },
    setCharTC,
  } = useContext(CharTCContext)

  return (
    <CardLight>
      <CardHeader title="Stat Constraints" />
      <Divider />
      <Box sx={{ p: 1 }}>
        <Stack spacing={1}>
          {Object.entries(minTotal).map(([k, v]) => (
            <Selector key={k} statKey={k} value={v} disabled={disabled} />
          ))}
          <DropdownButton disabled={disabled} title={'Add a Stat Constraint'}>
            {minTotalStatKeys.map((k) => (
              <MenuItem
                key={k}
                disabled={Object.keys(minTotal).includes(k)}
                onClick={() =>
                  setCharTC((charTC) => {
                    charTC.optimization.minTotal[k] = 0
                  })
                }
              >
                <ListItemIcon>
                  <StatIcon statKey={k} />
                </ListItemIcon>
                <ListItemText>
                  <ArtifactStatWithUnit statKey={k} />
                </ListItemText>
              </MenuItem>
            ))}
          </DropdownButton>
        </Stack>
      </Box>
    </CardLight>
  )
}

function Selector({
  statKey,
  value,
  disabled,
}: {
  statKey?: MinTotalStatKey
  value?: number
  disabled: boolean
}) {
  const { setCharTC } = useContext(CharTCContext)
  const unitStr = unit(statKey)
  return (
    <ButtonGroup size="small">
      <DropdownButton
        disabled={disabled}
        color="success"
        startIcon={statKey ? <StatIcon statKey={statKey} /> : undefined}
        title={
          statKey ? (
            <ArtifactStatWithUnit statKey={statKey} />
          ) : (
            'Select a Stat Constraint'
          )
        }
      >
        {minTotalStatKeys.map((k) => (
          <MenuItem
            key={k}
            selected={statKey === k}
            disabled={statKey === k}
            onClick={() =>
              setCharTC((charTC) => {
                charTC.optimization.minTotal[statKey] = 0
              })
            }
          >
            <ListItemIcon>
              <StatIcon statKey={k} />
            </ListItemIcon>
            <ListItemText>
              <ArtifactStatWithUnit statKey={k} />
            </ListItemText>
          </MenuItem>
        ))}
      </DropdownButton>
      <CustomNumberInputButtonGroupWrapper sx={{ flexBasis: 30, flexGrow: 1 }}>
        <CustomNumberInput
          float={unitStr === '%'}
          placeholder={`Stat Constraint`}
          value={statKey ? value : undefined}
          onChange={(value) =>
            statKey &&
            setCharTC((charTC) => {
              charTC.optimization.minTotal[statKey] = value
            })
          }
          endAdornment={unitStr || <Box width="1em" component="span" />}
          disabled={!statKey || disabled}
          sx={{
            px: 1,
          }}
          inputProps={{
            sx: { textAlign: 'right' },
          }}
        />
      </CustomNumberInputButtonGroupWrapper>
      {!!statKey && (
        <Button
          color="error"
          disabled={disabled}
          size="small"
          onClick={() =>
            setCharTC((charTC) => {
              delete charTC.optimization.minTotal[statKey]
            })
          }
        >
          <ClearIcon />
        </Button>
      )}
    </ButtonGroup>
  )
}
