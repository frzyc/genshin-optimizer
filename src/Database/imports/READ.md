# Import Procedure

The current import procedure are separated into 4 steps:

1. Parsing (mona.ts, good.ts): parse the file of any format into old internal representation specific to the original file format
2. Migration (migrate.ts): migrate the old internal representation to the new internal representation
3. Merging (merge.ts): combine the data in the new representation and merge it with the current data in the database
4. Validation (validate.ts): validate the new data and find the nearest representable if they are invalid/ill-formed

Any updates to the import logic must adhere to comments tagged with `MIGRATION STEP:`
