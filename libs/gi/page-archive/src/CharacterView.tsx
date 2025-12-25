import {
  CardThemed,
  ModalWrapper,
} from '@genshin-optimizer/common/ui'
import { range } from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { maxConstellationCount } from '@genshin-optimizer/gi/consts'
import type { ICachedCharacter } from '@genshin-optimizer/gi/db'
import { useDBMeta } from '@genshin-optimizer/gi/db-ui'
import type { TalentSheetElementKey } from '@genshin-optimizer/gi/sheets'
import { getCharSheet } from '@genshin-optimizer/gi/sheets'
import {
  CharIconSide,
  CharacterName,
  DocumentDisplay,
} from '@genshin-optimizer/gi/ui'
import CloseIcon from '@mui/icons-material/Close'
import {
  Box,
  CardContent,
  CardHeader,
  Grid,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
const talentSpacing = {
  xs: 12,
  sm: 6,
  md: 4,
}

export function CharacterView({
  show,
  character,
  onClose,
}: {
  show: boolean
  character: ICachedCharacter
  onClose?: () => void
}) {
  const { t } = useTranslation('sheet_gen')
  const theme = useTheme()
  const grlg = useMediaQuery(theme.breakpoints.up('lg'))

  const { key: characterKey, constellation, ascension } = character
  const { gender } = useDBMeta()
  const characterSheet = getCharSheet(characterKey, gender)

  const skillBurstList = [
    ['auto', t('talents.auto')],
    ['skill', t('talents.skill')],
    ['burst', t('talents.burst')],
  ] as [TalentSheetElementKey, string][]
  const passivesList: [
    tKey: TalentSheetElementKey,
    tText: string,
    asc: number,
  ][] = [
    ['passive1', t('unlockPassive1'), 1],
    ['passive2', t('unlockPassive2'), 4],
    ['passive3', t('unlockPassive3'), 0],
  ]

  const constellationCards = useMemo(
    () =>
      range(1, maxConstellationCount).map((i) => (
        <SkillDisplayCard
          characterKey={characterKey}
          talentKey={`constellation${i}` as TalentSheetElementKey}
          subtitle={t('constellationLvl', { level: i })}
        />
      )),
    [t, characterKey]
  )
  return (
    <ModalWrapper
      open={show}
      onClose={onClose}
      containerProps={{ maxWidth: 'xl' }}
    >
      <CardThemed>
        <CardHeader
          title={
            <Box>
              <CharIconSide characterKey={characterKey} sideMargin />
              <Box sx={{ pl: 1 }} component="span">
                <CharacterName characterKey={characterKey} gender={gender} />
              </Box>
            </Box>
          }
          action={
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          }
        />
        <CardContent>
          <Grid container spacing={1}>
            {/* constellations for 4column */}
            {grlg && (
              <Grid
                item
                xs={12}
                md={12}
                lg={3}
                sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
              >
                {/* <ConstellationDropdown /> */}
                {constellationCards.map((c, i) => (
                  <Box
                    key={i}
                    sx={{ opacity: constellation >= i + 1 ? 1 : 0.5 }}
                  >
                    {c}
                  </Box>
                ))}
              </Grid>
            )}
            <Grid item xs={12} md={12} lg={9} container spacing={1}>
              {/* auto, skill, burst */}
              {skillBurstList.map(([tKey, tText]) => (
                <Grid item key={tKey} {...talentSpacing}>
                  <SkillDisplayCard
                    characterKey={characterKey}
                    talentKey={tKey}
                    subtitle={tText}
                  />
                </Grid>
              ))}
              {!!characterSheet.getTalentOfKey('sprint') && (
                <Grid item {...talentSpacing}>
                  <SkillDisplayCard
                    characterKey={characterKey}
                    talentKey="sprint"
                    subtitle={t('talents.altSprint')}
                  />
                </Grid>
              )}
              {!!characterSheet.getTalentOfKey('passive') && (
                <Grid item {...talentSpacing}>
                  <SkillDisplayCard
                    characterKey={characterKey}
                    talentKey="passive"
                    subtitle="Passive"
                  />
                </Grid>
              )}
              {/* passives */}
              {passivesList.map(([tKey, tText, asc]) => {
                const enabled = ascension >= asc
                if (!characterSheet.getTalentOfKey(tKey)) return null
                return (
                  <Grid
                    item
                    key={tKey}
                    style={{ opacity: enabled ? 1 : 0.5 }}
                    {...talentSpacing}
                  >
                    <SkillDisplayCard
                      characterKey={characterKey}
                      talentKey={tKey}
                      subtitle={tText}
                    />
                  </Grid>
                )
              })}
            </Grid>
            {/* constellations for < 4 columns */}
            {!grlg && (
              <Grid item xs={12} md={12} lg={3} container spacing={1}>
                {/* <Grid item xs={12}>
                  <ConstellationDropdown />
                </Grid> */}
                {constellationCards.map((c, i) => (
                  <Grid
                    item
                    key={i}
                    sx={{ opacity: constellation >= i + 1 ? 1 : 0.5 }}
                    {...talentSpacing}
                  >
                    {c}
                  </Grid>
                ))}
              </Grid>
            )}
          </Grid>
        </CardContent>
      </CardThemed>
    </ModalWrapper>
  )
}

function SkillDisplayCard({
  characterKey,
  talentKey,
  subtitle,
}: {
  characterKey: CharacterKey
  talentKey: TalentSheetElementKey
  subtitle: string
}) {
  const { gender } = useDBMeta()
  const characterSheet = getCharSheet(characterKey, gender)
  const talentSheet = characterSheet.getTalentOfKey(talentKey)

  return (
    <CardThemed bgt="light" sx={{ height: '100%' }}>
      <CardContent>
        <Grid container sx={{ flexWrap: 'nowrap' }}>
          <Grid item>
            <Box
              component="img"
              src={talentSheet?.img}
              sx={{ width: 60, height: 'auto' }}
            />
          </Grid>
          <Grid item flexGrow={1} sx={{ pl: 1 }}>
            <Typography variant="h6">{talentSheet?.name}</Typography>
            <Typography variant="subtitle1">{subtitle}</Typography>
          </Grid>
        </Grid>
        {talentSheet?.sections ? (
          <DocumentDisplay sections={talentSheet.sections} hideDesc />
        ) : null}
      </CardContent>
    </CardThemed>
  )
}
