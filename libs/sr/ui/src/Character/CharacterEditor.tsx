import {
  CardThemed,
  DropdownButton,
  ImgIcon,
  ModalWrapper,
} from '@genshin-optimizer/common/ui'
import { getUnitStr, toPercent } from '@genshin-optimizer/common/util'
import {
  characterAsset,
  characterKeyToGenderedKey,
} from '@genshin-optimizer/sr/assets'
import type { AscensionKey, CharacterKey } from '@genshin-optimizer/sr/consts'
import { allEidolonKeys } from '@genshin-optimizer/sr/consts'
import { useCharacter, useDatabaseContext } from '@genshin-optimizer/sr/db-ui'
import { getCharStatBoostStat } from '@genshin-optimizer/sr/stats'
import { StatIcon } from '@genshin-optimizer/sr/svgicons'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import {
  Box,
  Button,
  CardContent,
  Divider,
  Grid,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { Suspense } from 'react'
import { AbilityDropdown } from './AbilityDropdown'
import { CharacterName } from './CharacterTrans'

export function CharacterEditor({
  characterKey,
  onClose,
}: {
  characterKey: CharacterKey | undefined
  onClose: () => void
}) {
  return (
    <ModalWrapper open={!!characterKey} onClose={onClose}>
      <Suspense
        fallback={<Skeleton variant="rectangular" width="100%" height={1000} />}
      >
        {characterKey && <CharacterEditorContent characterKey={characterKey} />}
      </Suspense>
    </ModalWrapper>
  )
}

function CharacterEditorContent({
  characterKey,
}: {
  characterKey: CharacterKey
}) {
  const character = useCharacter(characterKey)
  const genderedKey = characterKeyToGenderedKey(characterKey)
  const { database } = useDatabaseContext()
  return (
    <CardThemed>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="h3">
          <CharacterName genderedKey={genderedKey} />
        </Typography>
        <TextField
          type="number"
          label="Level"
          variant="outlined"
          inputProps={{ min: 1, max: 90 }}
          value={character?.level || 0}
          onChange={(e) =>
            database.chars.set(characterKey, {
              level: parseInt(e.target.value),
            })
          }
          disabled={!character}
        />
        <TextField
          type="number"
          label="Ascension"
          variant="outlined"
          inputProps={{ min: 0, max: 6 }}
          value={character?.ascension || 0}
          onChange={(e) =>
            database.chars.set(characterKey, {
              ascension: parseInt(e.target.value) as AscensionKey,
            })
          }
          disabled={!character}
        />
        <DropdownButton
          title={`Eidolon Lv. ${character?.eidolon ?? 0}`}
          fullWidth={false}
          disabled={!character}
        >
          {allEidolonKeys.map((eidolon) => (
            <MenuItem
              key={eidolon}
              selected={character?.eidolon === eidolon}
              disabled={character?.eidolon === eidolon}
              onClick={() => database.chars.set(characterKey, { eidolon })}
            >
              Eidolon Lv. {eidolon}
            </MenuItem>
          ))}
        </DropdownButton>
        <Stack spacing={1}>
          <Typography variant="h6">Abilites</Typography>
          <Divider />
          <Grid container gap={1}>
            <Grid item>
              <AbilityDropdown
                characterKey={characterKey}
                abilityKey="basic"
                dropDownButtonProps={{
                  startIcon: (
                    <ImgIcon
                      size={1.5}
                      sideMargin
                      src={characterAsset(genderedKey, 'basic_0')}
                    />
                  ),
                }}
              />
            </Grid>
            <Grid item>
              <AbilityDropdown
                characterKey={characterKey}
                abilityKey="skill"
                dropDownButtonProps={{
                  startIcon: (
                    <ImgIcon
                      size={1.5}
                      sideMargin
                      src={characterAsset(genderedKey, 'skill_0')}
                    />
                  ),
                }}
              />
            </Grid>
            <Grid item>
              <AbilityDropdown
                characterKey={characterKey}
                abilityKey="ult"
                dropDownButtonProps={{
                  startIcon: (
                    <ImgIcon
                      size={1.5}
                      sideMargin
                      src={characterAsset(genderedKey, 'ult_0')}
                    />
                  ),
                }}
              />
            </Grid>
            <Grid item>
              <AbilityDropdown
                characterKey={characterKey}
                abilityKey="talent"
                dropDownButtonProps={{
                  startIcon: (
                    <ImgIcon
                      size={1.5}
                      sideMargin
                      src={characterAsset(genderedKey, 'talent_0')}
                    />
                  ),
                }}
              />
            </Grid>
          </Grid>
          <Typography variant="h6">Bonus Abilities</Typography>
          <Divider />
          <Grid container gap={1}>
            {Object.entries(character?.bonusAbilities ?? {}).map(
              ([bonusAbility, enabled]) => (
                <Grid item key={bonusAbility}>
                  <Button
                    color={enabled ? 'success' : 'primary'}
                    onClick={() => {
                      database.chars.set(characterKey, {
                        bonusAbilities: {
                          ...character?.bonusAbilities,
                          [bonusAbility]: !enabled,
                        },
                      })
                    }}
                    startIcon={
                      enabled ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />
                    }
                  >
                    <ImgIcon
                      size={2}
                      src={characterAsset(
                        genderedKey,
                        `bonusAbility${bonusAbility}`,
                      )}
                      sideMargin
                    />
                  </Button>
                </Grid>
              ),
            )}
          </Grid>
          <Typography variant="h6">Stat Boosts</Typography>
          <Divider />
          <Grid container gap={1}>
            {Object.entries(character?.statBoosts ?? {}).map(
              ([statBoost, enabled]) => {
                const { statKey, value } = getCharStatBoostStat(
                  characterKey,
                  statBoost,
                )
                return (
                  <Grid item key={statBoost}>
                    <Button
                      color={enabled ? 'success' : 'primary'}
                      onClick={() => {
                        database.chars.set(characterKey, {
                          statBoosts: {
                            ...character?.statBoosts,
                            [statBoost]: !enabled,
                          },
                        })
                      }}
                      startIcon={
                        enabled ? (
                          <CheckBoxIcon />
                        ) : (
                          <CheckBoxOutlineBlankIcon />
                        )
                      }
                    >
                      <StatIcon
                        statKey={statKey}
                        iconProps={{ sx: { ml: -1, mr: 0.5 } }}
                      />
                      <Box>
                        {toPercent(value, statKey)}
                        {getUnitStr(statKey)}
                      </Box>
                    </Button>
                  </Grid>
                )
              },
            )}
          </Grid>
        </Stack>
      </CardContent>
    </CardThemed>
  )
}
