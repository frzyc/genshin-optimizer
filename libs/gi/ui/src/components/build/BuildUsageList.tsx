import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { useDBMeta } from '@genshin-optimizer/gi/db-ui'
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material'
import { CharacterName, CharIconSide } from '../character'

/**
 * Lists builds as "<character icon> <character name>: <build name>",
 * e.g. to show which builds use an artifact or a weapon.
 */
export function BuildUsageList({
  builds,
}: {
  builds: { characterKey: CharacterKey; name: string }[]
}) {
  const { gender } = useDBMeta()
  return (
    <List>
      {builds.map(({ characterKey, name }, index) => (
        <ListItem key={index}>
          <ListItemIcon>
            <CharIconSide characterKey={characterKey} />
          </ListItemIcon>
          <ListItemText
            disableTypography={true}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            primary={
              <>
                <CharacterName characterKey={characterKey} gender={gender} />
                {`: ${name}`}
              </>
            }
          />
        </ListItem>
      ))}
    </List>
  )
}
