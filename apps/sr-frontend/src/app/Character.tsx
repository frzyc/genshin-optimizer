import { CardThemed, DropdownButton } from '@genshin-optimizer/common/ui'
import { allEidolonKeys, type AscensionKey } from '@genshin-optimizer/sr/consts'
import { convert, selfTag } from '@genshin-optimizer/sr/formula'
import {
  AbilityDropdown,
  BuildDisplay,
  useCalcContext,
  useCharacter,
  useCharacterContext,
  useCharacterReducer,
} from '@genshin-optimizer/sr/ui'
import { CheckBox, CheckBoxOutlineBlank, ExpandMore } from '@mui/icons-material'
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

export default function Character() {
  const { characterKey } = useCharacterContext()
  const character = useCharacter(characterKey)
  const charReducer = useCharacterReducer(characterKey)

  const { calc } = useCalcContext()
  const member0 = convert(selfTag, { member: 'member0', et: 'self' })

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
              onChange={(e) => charReducer({ level: parseInt(e.target.value) })}
            />
            <TextField
              type="number"
              label="Ascension"
              variant="outlined"
              inputProps={{ min: 0, max: 6 }}
              value={character?.ascension || 0}
              onChange={(e) =>
                charReducer({
                  ascension: parseInt(e.target.value) as AscensionKey,
                })
              }
            />
            <Grid container>
              <Grid item>
                <DropdownButton
                  title={`Eidolon Lv. ${character?.eidolon}`}
                  fullWidth={false}
                  disabled={!character?.ascension}
                >
                  {allEidolonKeys.map((eidolon) => (
                    <MenuItem
                      key={eidolon}
                      selected={character?.eidolon === eidolon}
                      disabled={character?.eidolon === eidolon}
                      onClick={() => charReducer({ eidolon })}
                    >
                      Eidolon Lv. {eidolon}
                    </MenuItem>
                  ))}
                </DropdownButton>
              </Grid>
            </Grid>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
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
                            color="primary"
                            onClick={() => {
                              charReducer({
                                bonusAbilities: {
                                  ...character?.bonusAbilities,
                                  [bonusAbility]: !enabled,
                                },
                              })
                            }}
                            startIcon={
                              enabled ? <CheckBox /> : <CheckBoxOutlineBlank />
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
                            color="primary"
                            onClick={() => {
                              charReducer({
                                statBoosts: {
                                  ...character?.statBoosts,
                                  [statBoost]: !enabled,
                                },
                              })
                            }}
                            startIcon={
                              enabled ? <CheckBox /> : <CheckBoxOutlineBlank />
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
              <AccordionSummary expandIcon={<ExpandMore />}>
                Relics
              </AccordionSummary>
              <AccordionDetails>
                <BuildDisplay build={character?.equippedRelics} />
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
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
            <AccordionSummary expandIcon={<ExpandMore />}>
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
                          <AccordionSummary expandIcon={<ExpandMore />}>
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
        </CardContent>
      </CardThemed>
    </Container>
  )
}
