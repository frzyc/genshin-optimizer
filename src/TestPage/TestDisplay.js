import { Container } from "react-bootstrap";
import CharacterDisplayCard from "../Character/CharacterDisplayCard";
import { DatabaseInitAndVerify } from '../DatabaseUtil';
import '../StatDependency'
export default function TestDisplay() {
  DatabaseInitAndVerify()
  return <Container>
    <CharacterDisplayCard editable characterKey="noelle" />
  </Container>
}
