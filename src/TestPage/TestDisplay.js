import { Container } from "react-bootstrap";
import CharacterDisplayCard from "../Character/CharacterDisplayCard";
import { DatabaseInitAndVerify } from '../DatabaseUtil';
import '../StatDependency'
export default function TestDisplay(props) {
  DatabaseInitAndVerify()
  return <Container>
    <CharacterDisplayCard editable characterId={"character_2"} />
  </Container>
}
