import { Container } from "react-bootstrap";
import CharacterDisplayCard from "../Character/CharacterDisplayCard";
import { DatabaseInitAndVerify } from '../Database/DatabaseUtil';
import '../StatDependency'
export default function TestDisplay() {
  DatabaseInitAndVerify()
  return <Container>
    <CharacterDisplayCard editable characterKey="amber" tabName="talent" />
  </Container>
}
