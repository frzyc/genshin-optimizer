/**
 * Formats text, returns formatted text. This function does not write directly to the provided file path.
 * File path is only used for determining type of parser
 * @param path Full path to file to get formatted, used for formatter to determine parser type
 * @param text Contents to be formatted
 */
export declare function formatText(path: string, text: string): Promise<string>;
export declare function dumpFile(filename: string, obj: unknown, print?: boolean): void;
export declare function dumpPrettyFile(filename: string, obj: unknown): Promise<void>;
/**
 * Generate index file(index.ts) using a object as the directory structure, starting from a path.
 * @param obj That defines the structure, with leaves being strings for filenames.
 * @param path The starting path
 * @returns
 */
export declare function generateIndexFromObj(obj: object, path: string): Promise<void>;
//# sourceMappingURL=util.d.ts.map