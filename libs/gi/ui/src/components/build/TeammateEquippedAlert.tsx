import type {
  ArtifactSlotKey,
  CharacterKey,
} from '@genshin-optimizer/gi/consts'
import { useDBMeta } from '@genshin-optimizer/gi/db-ui'
import { Alert, Typography } from '@mui/material'
import { Trans, useTranslation } from 'react-i18next'
import { ArtifactSlotName } from '../artifact'
import { CharacterName } from '../character'

export function TeammateEquippedAlert({
  weaponUsedInTeamCharKey,
  artUsedInTeamCharKeys,
}: {
  weaponUsedInTeamCharKey: CharacterKey | undefined
  artUsedInTeamCharKeys: Record<ArtifactSlotKey, CharacterKey | undefined>
}) {
  const { gender } = useDBMeta()
  const { t } = useTranslation('page_character')
  return (
    (weaponUsedInTeamCharKey ||
      Object.values(artUsedInTeamCharKeys).some((ck) => ck)) && (
      <Alert variant="outlined" severity="warning">
        {weaponUsedInTeamCharKey && (
          <Typography>
            <Trans t={t} i18nKey="teammateUsing.weapon">
              Teammate
              <CharacterName
                characterKey={weaponUsedInTeamCharKey}
                gender={gender}
              />
              is using this weapon.
            </Trans>
          </Typography>
        )}
        {Object.entries(artUsedInTeamCharKeys).map(
          ([slotKey, ck]) =>
            ck && (
              <Typography>
                <Trans t={t} i18nKey="teammateUsing.artifact">
                  Teammate
                  <CharacterName characterKey={ck} gender={gender} />
                  is using this <ArtifactSlotName slotKey={slotKey} />.
                </Trans>
              </Typography>
            ),
        )}
      </Alert>
    )
  )
}
