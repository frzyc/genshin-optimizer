# zzz-dm

This library was generated with [Nx](https://nx.dev).

## Update Datamine

To update the datamine to a new commit, run `yarn run update-dm`. This will update all game datamines.

## [DEPRECATED] Getting data from Hakush.in

NOTE: Hakush.in has been taken down, so this no longer works

Download all the English JSONs from `https://api.hakush.in/zzz/`
`nx get-hakushin zzz-dm`

## Creating deobf DM mappings
The datamine for ZZZ is obfuscated, so property names are not widely known, and the names change every version update of the DM. We have created a pipeline that will take known reverse mappings of values -> properties and create partially human-readable versions of the datamine configs.

1. Run `nx generate @genshin-optimizer/zzz/dm:generate-all-deobf-template --verbose` to generate missing deobf templates `src/dm/deobf/FileCfg` based on values provided in `src/consts.ts`.
1. Once the templates have been generated, you can reference between the files themselves, the output of the command, and your own best judgment to figure out what value corresponds to a given property and what you should name it.
1. Once the mapping has been created, you can re-map the datamine files to readable versions with `nx run zzz-dm:deobf --verbose`
1. These are also stored in `genshin-optimizer/ZenlessDataDeobf` (private repo, for people without access, you can run the previous steps to recreate the files)
