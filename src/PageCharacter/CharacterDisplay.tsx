import { Box, Skeleton } from '@mui/material';
import React, { lazy } from 'react';
import { Redirect, useHistory, useParams } from 'react-router';
import CloseButton from '../Components/CloseButton';
import { allCharacterKeys, CharacterKey } from '../Types/consts';
const CharacterDisplayCard = lazy(() => import('./CharacterDisplayCard'))
const validTabs = ["overview", "talent", "equip", "buffs", "build"]
export default function CharacterDisplay() {
  const history = useHistory()
  let { characterKey, tab } = useParams<{ characterKey?: CharacterKey, tab?: string }>();
  const invalidKey = !allCharacterKeys.includes(characterKey as any ?? "")
  if (invalidKey)
    return <Redirect to="/character" />
  if (!validTabs.includes(tab as any ?? "")) {
    return <Redirect to={`/character/${characterKey}/overview`} />
  }
  return <Box my={1} display="flex" flexDirection="column" gap={1}>
    {characterKey && <React.Suspense fallback={<Skeleton variant="rectangular" width="100%" height={1000} />}>
      <CharacterDisplayCard characterKey={characterKey} tabName={tab} onClose={() => history.push("/character")}
        footer={<CharDisplayFooter onClose={() => history.push("/character")} characterKey={characterKey} />}
      />
    </React.Suspense>}
  </Box>
}
function CharDisplayFooter({ onClose, characterKey }) {
  return <Box display="flex" gap={1} justifyContent="space-between">
    <Box />
    {/* <Button component={Link} to={{
        pathname: "/build",
        characterKey
      } as any}
        startIcon={<FontAwesomeIcon icon={faCalculator} />}
      >Generate Builds</Button> */}

    <CloseButton large onClick={onClose} />

  </Box>
}
