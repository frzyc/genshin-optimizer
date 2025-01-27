import {
  CardThemed,
  DropdownButton,
  InfoTooltip,
  NumberInputLazy,
} from '@genshin-optimizer/common/ui'
import { getUnitStr } from '@genshin-optimizer/common/util'
import type { DiscSetKey, StatKey } from '@genshin-optimizer/zzz/consts'
import {
  allAttributeDamageKeys,
  allDiscSetKeys,
  statKeyTextMap,
} from '@genshin-optimizer/zzz/consts'
import type { Constraints } from '@genshin-optimizer/zzz/db'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import {
  Box,
  Button,
  ButtonGroup,
  CardContent,
  Divider,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
const constraintKeys: StatKey[] = [
  'hp',
  'def',
  'atk',
  'crit_',
  'crit_dmg_',
  'anomProf',
  'pen',
  ...allAttributeDamageKeys,
]
export function StatFilterCard({
  constraints,
  setConstraints,
  disabled = false,
}: {
  constraints: Constraints
  setConstraints: (constraints: Constraints) => void
  disabled?: boolean
}) {
  const { t } = useTranslation('page_character_optimize')

  return (
    <Box>
      <CardThemed bgt="light">
        <CardContent
          sx={{
            display: 'flex',
            gap: 1,
            justifyContent: 'space-between',
            flexDirection: 'column',
          }}
        >
          <Box display="flex" justifyContent="space-between">
            <Typography sx={{ fontWeight: 'bold' }}>
              {t('constraintFilter.title')}
            </Typography>
            <InfoTooltip
              title={<Typography>{t('constraintFilter.tooltip')}</Typography>}
            />
          </Box>
        </CardContent>
        <Divider />
        <CardContent>
          <Stack spacing={1}>
            {Object.entries(constraints)
              // filter out 4p set constraints
              .filter(([key]) => !allDiscSetKeys.includes(key as DiscSetKey))
              .map(([key, { value, isMax }]) => (
                <Box display={'flex'} key={key} gap={1}>
                  <NumberInputLazy
                    value={value}
                    onChange={(v) =>
                      setConstraints({
                        ...constraints,
                        [key]: { value: v, isMax },
                      })
                    }
                    inputProps={{ sx: { textAlign: 'right' } }}
                    InputProps={{
                      startAdornment: key,
                      endAdornment: getUnitStr(key),
                    }}
                  />
                  <ButtonGroup size="small">
                    <Button
                      onClick={() =>
                        setConstraints({
                          ...constraints,
                          [key]: { value, isMax: !isMax },
                        })
                      }
                    >
                      {isMax ? 'MAX' : 'MIN'}
                    </Button>
                    <Button
                      onClick={() => {
                        const { [key]: _, ...rest } = constraints
                        setConstraints({ ...rest })
                      }}
                    >
                      <DeleteForeverIcon />
                    </Button>
                  </ButtonGroup>
                </Box>
              ))}
            <DropdownButton disabled={disabled} title="Add new Constraint">
              {constraintKeys
                .filter((k) => !Object.keys(constraints).includes(k))
                .map((key) => (
                  <MenuItem
                    key={key}
                    onClick={() =>
                      setConstraints({
                        ...constraints,
                        [key]: { value: 0, isMax: false },
                      })
                    }
                  >
                    {statKeyTextMap[key] ?? key}
                  </MenuItem>
                ))}
            </DropdownButton>
          </Stack>
        </CardContent>
      </CardThemed>
    </Box>
  )
}
