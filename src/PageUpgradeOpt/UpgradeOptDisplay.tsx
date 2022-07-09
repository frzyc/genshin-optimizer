import {
  Alert,
  Box,
  CardContent,
  Divider,
  Link,
  Typography,
} from '@mui/material';
import { useCallback, useContext, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import CardDark from '../Components/Card/CardDark';
import CardLight from '../Components/Card/CardLight';
import CharacterDropdownButton from './stopBreakingMe';
import { DatabaseContext } from '../Database/Database';
import { initialCharacter } from '../ReactHooks/useCharSelectionCallback';
import { CharacterKey } from '../Types/consts';
import { useNavigate } from "react-router";
import CharacterSheet from "../Data/Characters/CharacterSheet";
import { defaultInitialWeapon } from "../Util/WeaponUtil";

function HackyGetAroun() {
  const { database } = useContext(DatabaseContext)
  const navigate = useNavigate()
  // Used to maintain the previous tab, if there is one
  const cb = useCallback(
    async (characterKey: CharacterKey) => {
      const character = database.chars.get(characterKey)
      // Create a new character + weapon, with linking if char isnt in db.
      if (!character) {
        throw Error('ummm idk what t odo here')

        // const newChar = initialCharacter(characterKey)
        // database.chars.set(newChar)
        // const characterSheet = await CharacterSheet.get(characterKey)
        // if (!characterSheet) return
        // const weapon = defaultInitialWeapon(characterSheet.weaponTypeKey)
        // const weaponId = database.createWeapon(weapon)
        // database.setWeaponLocation(weaponId, characterKey)

        // If we are navigating to a new character,
        // redirect to Overview, regardless of previous tab.
        // Trying to enforce a certain UI flow when building new characters
      }
      navigate(`/characters/${characterKey}/upgradeOpt`)
    },
    [navigate, database],
  )
  return cb
}

export default function UpgradeOptDisplay() {
  const { database } = useContext(DatabaseContext)
  const characterKey = ''

  const noCharacter = useMemo(() => !database.chars.keys.length, [database])
  const noArtifact = useMemo(() => !database.arts.keys.length, [database])

  const onClickTeammate = HackyGetAroun()
  const selectCharacter = useCallback((cKey = "") => {
    onClickTeammate(cKey as CharacterKey)
  }, [onClickTeammate])

  return <Box display="flex" flexDirection="column" gap={1} sx={{ my: 1 }}>

    {noCharacter && <Alert severity="error" variant="filled"> Opps! It looks like you haven't added a character to GO yet! You should go to the <Link component={RouterLink} to="/character">Characters</Link> page and add some!</Alert>}
    {noArtifact && <Alert severity="warning" variant="filled"> Opps! It looks like you haven't added any artifacts to GO yet! You should go to the <Link component={RouterLink} to="/artifact">Artifacts</Link> page and add some!</Alert>}
    {/* Build Generator Editor */}
    {<CardDark>
      <CardContent sx={{ py: 1 }}>
        <Typography variant="h6">Build Generator</Typography>
      </CardContent>
      <Divider />
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <CardLight>
          <CardContent>
            <CharacterDropdownButton fullWidth value={characterKey} onChange={selectCharacter} />
          </CardContent>
        </CardLight>
      </CardContent>
    </CardDark>}
  </Box>
}
