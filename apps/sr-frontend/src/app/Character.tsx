import { CardThemed, DropdownButton } from '@genshin-optimizer/common/ui'
import { deepClone, layeredAssignment } from '@genshin-optimizer/common/util'
import type { SetCondCallback } from '@genshin-optimizer/pando/ui'
import { DocumentDisplay } from '@genshin-optimizer/pando/ui'
import { allEidolonKeys, type AscensionKey } from '@genshin-optimizer/sr/consts'
import type { ICachedSroCharacter } from '@genshin-optimizer/sr/db'
import { convert, selfTag } from '@genshin-optimizer/sr/formula'
import { uiSheets } from '@genshin-optimizer/sr/formula-ui'
import {
  AbilityDropdown,
  BuildDisplay,
  useCalcContext,
  useCharacter,
  useCharacterContext,
  useDatabaseContext,
} from '@genshin-optimizer/sr/ui'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  CardContent,
  Container,
  Divider,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useCallback } from 'react'

export default function CharacterEditor() {
  const { characterKey } = useCharacterContext()
  const character = useCharacter(characterKey)
  const { database } = useDatabaseContext()

  const updateCharacter = (character: Partial<ICachedSroCharacter>) => {
    characterKey && database.chars.set(characterKey, character)
  }

  const { calc } = useCalcContext()
  const member0 = convert(selfTag, { member: 'member0', et: 'self' })

  const setCond = useCallback<SetCondCallback>(
    (src, name, value) => {
      const conditional = deepClone(character?.conditional)
      layeredAssignment(conditional, [src, name], value)
      database.chars.set(characterKey, { conditional })
    },
    [character?.conditional, characterKey, database.chars]
  )

  return (
    <Container>
      <CardThemed bgt="dark">
        <CardContent>
          <Stack spacing={2}>
            <Box>{characterKey}</Box>
            <TextField
              type="number"
              label="Level"
              variant="outlined"
              inputProps={{ min: 1, max: 90 }}
              value={character?.level || 0}
              onChange={(e) =>
                updateCharacter({ level: parseInt(e.target.value) })
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
                updateCharacter({
                  ascension: parseInt(e.target.value) as AscensionKey,
                })
              }
              disabled={!character}
            />
            <Grid container>
              <Grid item>
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
                      onClick={() => updateCharacter({ eidolon })}
                    >
                      Eidolon Lv. {eidolon}
                    </MenuItem>
                  ))}
                </DropdownButton>
              </Grid>
            </Grid>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                Traces
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={1}>
                  <Typography variant="h6">Abilites</Typography>
                  <Divider />
                  <Grid container gap={1}>
                    <Grid item>
                      <AbilityDropdown
                        characterKey={characterKey}
                        abilityKey="basic"
                      />
                    </Grid>
                    <Grid item>
                      <AbilityDropdown
                        characterKey={characterKey}
                        abilityKey="skill"
                      />
                    </Grid>
                    <Grid item>
                      <AbilityDropdown
                        characterKey={characterKey}
                        abilityKey="ult"
                      />
                    </Grid>
                    <Grid item>
                      <AbilityDropdown
                        characterKey={characterKey}
                        abilityKey="talent"
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
                              updateCharacter({
                                bonusAbilities: {
                                  ...character?.bonusAbilities,
                                  [bonusAbility]: !enabled,
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
                            {bonusAbility}
                          </Button>
                        </Grid>
                      )
                    )}
                  </Grid>
                  <Typography variant="h6">Stat Boosts</Typography>
                  <Divider />
                  <Grid container gap={1}>
                    {Object.entries(character?.statBoosts ?? {}).map(
                      ([statBoost, enabled]) => (
                        <Grid item key={statBoost}>
                          <Button
                            color={enabled ? 'success' : 'primary'}
                            onClick={() => {
                              updateCharacter({
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
                            {statBoost}
                          </Button>
                        </Grid>
                      )
                    )}
                  </Grid>
                </Stack>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                Relics
              </AccordionSummary>
              <AccordionDetails>
                <BuildDisplay build={character?.equippedRelics} />
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                Basic stats for all chars
              </AccordionSummary>
              <AccordionDetails>
                {(
                  [
                    ['ATK', 'atk'],
                    ['DEF', 'def'],
                    ['HP', 'hp'],
                    ['SPD', 'spd'],
                  ] as const
                ).map(([txt, skey]) => (
                  <Typography key={skey}>
                    {txt}: {calc?.compute(member0.final[skey]).val}
                  </Typography>
                ))}
              </AccordionDetails>
            </Accordion>
          </Stack>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              All target values, if sheet is created
            </AccordionSummary>
            <AccordionDetails>
              <Stack>
                {calc
                  ?.listFormulas(member0.listing.formulas)
                  .map((read, index) => {
                    const computed = calc.compute(read)
                    const name = read.tag.name || read.tag.q
                    return (
                      <Box key={`${name}${index}`}>
                        <Typography>
                          {name}: {computed.val}
                        </Typography>
                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            meta for {name}
                          </AccordionSummary>
                          <AccordionDetails>
                            <Typography component="pre">
                              {JSON.stringify(computed.meta, undefined, 2)}
                            </Typography>{' '}
                          </AccordionDetails>
                        </Accordion>
                      </Box>
                    )
                  })}
              </Stack>
            </AccordionDetails>
          </Accordion>
          {characterKey === 'Serval' ? (
            <Box>
              {uiSheets.Serval!.documents.map((doc) => (
                <DocumentDisplay document={doc} setCond={setCond} />
              ))}
            </Box>
          ) : undefined}
        </CardContent>
      </CardThemed>
    </Container>
  )
}
