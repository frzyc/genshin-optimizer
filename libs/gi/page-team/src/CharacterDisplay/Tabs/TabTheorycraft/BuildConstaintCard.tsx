import {
  CardThemed,
  CustomNumberInput,
  CustomNumberInputButtonGroupWrapper,
  DropdownButton,
} from '@genshin-optimizer/common/ui'
import { getUnitStr } from '@genshin-optimizer/common/util'
import type { MinTotalStatKey } from '@genshin-optimizer/gi/db'
import { minTotalStatKeys } from '@genshin-optimizer/gi/db'
import { StatIcon } from '@genshin-optimizer/gi/svgicons'
import { ArtifactStatWithUnit } from '@genshin-optimizer/gi/ui'
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
import { useTranslation } from 'react-i18next'
import { BuildTcContext } from '../../../BuildTcContext'

export function BuildConstaintCard({ disabled }: { disabled: boolean }) {
  const { t } = useTranslation('page_character')
  const {
    buildTc: {
      optimization: { minTotal },
    },
    setBuildTc,
  } = useContext(BuildTcContext)

  return (
    <CardThemed bgt="light">
      <CardHeader
        titleTypographyProps={{ variant: 'body1', sx: { fontWeight: 'bold' } }}
        title={t`tabTheorycraft.constraint.title`}
      />
      <Divider />
      <Box sx={{ p: 1 }}>
        <Stack spacing={1}>
          {Object.entries(minTotal).map(([k, v]) => (
            <Selector key={k} statKey={k} value={v} disabled={disabled} />
          ))}
          <DropdownButton
            disabled={disabled}
            title={t`tabTheorycraft.constraint.add`}
          >
            {minTotalStatKeys.map((k) => (
              <MenuItem
                key={k}
                disabled={Object.keys(minTotal).includes(k)}
                onClick={() =>
                  setBuildTc((charTC) => {
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
    </CardThemed>
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
  const { setBuildTc } = useContext(BuildTcContext)
  const unit = statKey ? getUnitStr(statKey) : ' '
  return (
    <ButtonGroup size="small">
      <CustomNumberInputButtonGroupWrapper sx={{ flexBasis: 30, flexGrow: 1 }}>
        <CustomNumberInput
          float={unit === '%'}
          value={statKey ? value : undefined}
          onChange={(value) =>
            statKey &&
            setBuildTc((charTC) => {
              charTC.optimization.minTotal[statKey] = value
            })
          }
          endAdornment={
            <Box width="1em" component="span">
              {unit}
            </Box>
          }
          startAdornment={
            <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
              {statKey && (
                <StatIcon
                  statKey={statKey}
                  iconProps={{
                    fontSize: 'inherit',
                    sx: {
                      verticalAlign: '-10%',
                      mr: 1,
                    },
                  }}
                />
              )}
              {statKey && <ArtifactStatWithUnit statKey={statKey} />}
            </Box>
          }
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
            setBuildTc((charTC) => {
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
