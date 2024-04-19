# char-cards

This library was generated with [Nx](https://nx.dev).

This is a library for the Character cards used by Genshin Optimizer. The cards needs to be manually added because it comes from their drip marketing on twitter.

## Adding new cards

1. Go to Twitter and search for `from:GenshinImpact <character name>`.
2. Download the character card from the drip marketing, such as https://twitter.com/GenshinImpact/status/1736687861444001829. You might need to rename the extension to `.jpg` or `.jpeg`
3. Resize it with your tool of choice to 350x700. Van uses [PowerToys Image Resizer](https://learn.microsoft.com/en-us/windows/powertoys/image-resizer).
4. Add the card to [./src/](https://github.com/frzyc/genshin-optimizer/tree/master/libs/gi/char-cards/src).
5. Update [./src/index.ts](https://github.com/frzyc/genshin-optimizer/blob/master/libs/gi/char-cards/src/index.ts) with the new card name, keeping it alphabetically sorted.
