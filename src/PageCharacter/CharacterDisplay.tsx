import { Box, Skeleton } from '@mui/material';
import React, { lazy } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import CloseButton from '../Components/CloseButton';
import { allCharacterKeys, CharacterKey } from '../Types/consts';
const CharacterDisplayCard = lazy(() => import('./CharacterDisplayCard'))
export default function CharacterDisplay() {
  const navigate = useNavigate();
  let { characterKey } = useParams<{ characterKey?: CharacterKey }>();
  const invalidKey = !allCharacterKeys.includes(characterKey as any ?? "")
  if (invalidKey)
    return <Navigate to="/character" />
  return <Box my={1} display="flex" flexDirection="column" gap={1}>
    {characterKey && <React.Suspense fallback={<Skeleton variant="rectangular" width="100%" height={1000} />}>
      <CharacterDisplayCard characterKey={characterKey} onClose={() => navigate("/character")}
        footer={<CharDisplayFooter onClose={() => navigate("/character")} characterKey={characterKey} />}
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
