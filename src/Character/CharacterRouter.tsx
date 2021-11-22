import { Route, Switch, useRouteMatch } from "react-router";
import CharacterInventory from "./CharacterInventory";
import CharacterDisplay from "./CharacterDisplay";

export default function CharacterRouter() {
  let match = useRouteMatch();
  return < Switch >
    <Route path={`${match.path}/:characterKey`}>
      <CharacterDisplay />
    </Route>
    <Route path={match.path}>
      <CharacterInventory />
    </Route>
  </Switch >
}