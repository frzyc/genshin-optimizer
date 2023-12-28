# silly-wisher-names

This library was generated with [Nx](https://nx.dev).

## Building

Run `nx build silly-wisher-names` to build the library.

## Updating the translation file

Extract the `I2Languages.asset` from the Silly Wisher APK and run
`parse_i2languages.py` (located in the `Translated` directory) on it. This will
generate a new `CharMemNames.csv` file.

You may also need to update the character key mapping table in the executor
script.
