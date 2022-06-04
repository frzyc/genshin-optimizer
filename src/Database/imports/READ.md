# Data Stages

During an import procedure, the data is categorized into three stages:

1. Raw data: unchecked data, represented by `any`,
2. Parsed data: raw data that is checked against to type specifications, represented by `IArtifact`, `ICharacter`, and `IWeapon`, and
3. Validated data: parsed Data that is checked against other higher-order specifications, represented by `ICachedArtifact`, `ICachedCharacter`, and `ICachedWeapon`.

Note that parsed and validated data are version-specific, and so are accompanied by the version number where there are ambiguities.

# Import Procedure

The current import procedure are separated into 4 steps:

1. Parsing (mona.ts, good.ts): parse raw data into parsed data with the version specified in the import, removing entries that are non-recoverable,
2. Migration (migrate.ts): convert the parsed data from Step 1 to the new parsed data of the current version,
3. Merging (merge.ts): combine the data from Step 2 with the current database, resulting in a parsed data (of the current version), and
4. Validation (validate.ts): validate the parsed data from Step 3, turning it into validated data, and find the nearest representable data if they are invalid/ill-formed

Any updates to the import logic must follow the comments tagged with `MIGRATION STEP:`
