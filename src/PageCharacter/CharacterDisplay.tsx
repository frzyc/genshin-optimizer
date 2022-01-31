import { faCalculator, faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Button, Grid, Skeleton } from '@mui/material';
import React, { lazy } from 'react';
import { Redirect, useHistory, useParams } from 'react-router';
import { Link } from 'react-router-dom';
import CloseButton from '../Components/CloseButton';
import InfoComponent from '../Components/InfoComponent';
import { allCharacterKeys, CharacterKey } from '../Types/consts';
const InfoDisplay = React.lazy(() => import('./InfoDisplay'));
const CharacterDisplayCard = lazy(() => import('./CharacterDisplayCard'))
export default function CharacterDisplay() {
  const history = useHistory()
  let { characterKey } = useParams<{ characterKey?: CharacterKey }>();
  const invalidKey = !allCharacterKeys.includes(characterKey as any ?? "")
  if (invalidKey)
    return <Redirect to="/character" />
  return <Box my={1} display="flex" flexDirection="column" gap={1}>
    <InfoComponent
      pageKey="characterPage"
      modalTitle="Character Page Guide"
      text={["Every character will be tested with in-game numbers for maximum accuracy.",
        "You can see the details of the calculations of every number.",
        "You need to manually enable auto infusion for characters like Choungyun or Noelle.",
        "You can change character constellations in both \"Character\" tab and in \"Talents\" tab.",
        "Modified character Stats are bolded."]}
    >
      <InfoDisplay />
    </InfoComponent>
    {characterKey && <React.Suspense fallback={<Skeleton variant="rectangular" width="100%" height={1000} />}>
      <CharacterDisplayCard characterKey={characterKey} onClose={() => history.push("/character")}
        footer={<CharDisplayFooter onClose={() => history.push("/character")} characterKey={characterKey} />}
      />
    </React.Suspense>}
  </Box>
}
function CharDisplayFooter({ onClose, characterKey }) {
  return <Grid container spacing={1}>
    <Grid item>
      <Button component={Link} to={{
        pathname: "/build",
        characterKey
      } as any}
        startIcon={<FontAwesomeIcon icon={faCalculator} />}
      >Generate Builds</Button>
    </Grid>
    <Grid item flexGrow={1}>
      <Button color="info" component={Link} to={{ pathname: "/flex", characterKey } as any}
        startIcon={<FontAwesomeIcon icon={faLink} />}
      >Share Character</Button>
    </Grid>
    <Grid item xs="auto">
      <CloseButton large onClick={onClose} />
    </Grid>
  </Grid>
}
