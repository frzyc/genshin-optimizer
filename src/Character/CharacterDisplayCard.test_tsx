import { render, waitFor } from "@testing-library/react";
import { allCharacterKeys, } from "../Types/consts";
import CharacterDisplayCard from "./CharacterDisplayCard";
import CharacterSheet from "./CharacterSheet";

test('should render without character selected', async () => {
  const { getByText } = render(<CharacterDisplayCard />);
  await waitFor(() => {
    expect(getByText("Select a Character")).toBeInTheDocument();
  })
})
allCharacterKeys.forEach(cKey => {
  //TODO: need to this to work with localization system.
  test.skip('should render with character selected', async () => {
    const charSheet = await CharacterSheet.get(cKey)
    expect(charSheet).toBeInstanceOf(CharacterSheet)
    // expect(charSheet?.hasTalentPage).toBe(true)//TODO: when all talent pages are done
    if (!charSheet) return
    const { getByText, getAllByText, getByTitle } = render(<CharacterDisplayCard characterKey={cKey} />);
    await waitFor(() => {
      expect(getByText(charSheet.name)).toBeInTheDocument();
    })
    //TODO: test talent page
    // userEvent.click(getByText("Talents"))
    // await waitFor(() => {
    //   expect(getByText(t => t.startsWith("Constellation Lv. "))).toBeInTheDocument();
    // })
    // await waitFor(() => {
    //   Object.values(charSheet.talent).forEach(talent => expect(getByTitle(talent.name)).toBeInTheDocument())
    // })
  })
})
