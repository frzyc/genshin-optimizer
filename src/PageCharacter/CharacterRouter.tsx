import { Route, Switch, useRouteMatch } from "react-router";
import CharacterInventory from "./CharacterInventory";
import CharacterDisplay from "./CharacterDisplay";

export default function CharacterRouter() {
  let match = useRouteMatch();
  return < Switch >
    <Route path={`${match.path}/:characterKey/:tab`}>
      <CharacterDisplay />
    </Route>
    {/* Maybe should remove this entry, but can keep for legacy */}
    <Route path={`${match.path}/:characterKey`}>
      <CharacterDisplay />
    </Route>
    <Route path={match.path}>
      <CharacterInventory />
    </Route>
  </Switch >
}
