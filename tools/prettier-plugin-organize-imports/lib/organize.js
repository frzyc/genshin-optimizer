const { sep, posix, dirname } = require('node:path');
const ts = require('typescript');

/**
 * Organize the given code's imports.
 *
 * @param {string} code
 * @param {import('prettier').ParserOptions} options
 */
module.exports.organize = (code, { filepath = 'file.ts', organizeImportsSkipDestructiveCodeActions, parser }) => {
	if (sep !== posix.sep) {
		filepath = filepath.split(sep).join(posix.sep);
	}
	const languageService = getLanguageService(parser, filepath, code);
	const fileChanges = languageService.organizeImports(
		{ type: 'file', fileName: filepath, skipDestructiveCodeActions: organizeImportsSkipDestructiveCodeActions },
		{},
		{},
	)[0];

	return fileChanges ? applyTextChanges(code, fileChanges.textChanges) : code;
};

/**
 * Get the correct language service for the given parser.
 *
 * @param {import('prettier').ParserOptions['parser']} parser
 * @param {string} filepath
 * @param {string} code
 *
 * @returns {ts.LanguageService}
 */
const getLanguageService = (parser, filepath, code) => {
	return ts.createLanguageService(getTypeScriptLanguageServiceHost(filepath, code));
};

/**
 * Create the most basic TS language service host for the given file to make import sorting work.
 *
 * @param {string} path path to file
 * @param {string} content file's content
 *
 * @returns {ts.LanguageServiceHost}
 */
function getTypeScriptLanguageServiceHost(path, content) {
	const tsconfig = ts.findConfigFile(path, ts.sys.fileExists);
	const compilerOptions = getCompilerOptions(tsconfig);
	return {
		directoryExists: ts.sys.directoryExists,
		fileExists: ts.sys.fileExists,
		getDefaultLibFileName: ts.getDefaultLibFileName,
		getDirectories: ts.sys.getDirectories,
		readDirectory: ts.sys.readDirectory,
		readFile: ts.sys.readFile,
		getCurrentDirectory: () => ts.sys.getCurrentDirectory(),
		getCompilationSettings: () => compilerOptions,
		getNewLine: () => ts.sys.newLine,
		getScriptFileNames: () => [path],
		getScriptVersion: () => '0',
		getScriptSnapshot: (filePath) => {
			if (filePath === path) {
				return ts.ScriptSnapshot.fromString(content);
			}
		},
	};
}

/**
 * Get the compiler options from the path to a tsconfig.
 *
 * @param {string | undefined} tsconfig path to tsconfig
 */
function getCompilerOptions(tsconfig) {
	const compilerOptions = tsconfig
		? ts.parseJsonConfigFileContent(ts.readConfigFile(tsconfig, ts.sys.readFile).config, ts.sys, dirname(tsconfig))
				.options
		: ts.getDefaultCompilerOptions();
	compilerOptions.allowJs = true; // for automatic JS support
	return compilerOptions;
}

/**
 * Apply the given set of text changes to the input.
 *
 * @param {string} input
 * @param {readonly ts.TextChange[]} changes
 */
const applyTextChanges = (input, changes) =>
	changes.reduceRight((text, change) => {
		const head = text.slice(0, change.span.start);
		const tail = text.slice(change.span.start + change.span.length);

		return `${head}${change.newText}${tail}`;
	}, input);
