/** @type {import('eslint').Linter.Config} */

module.exports = {
  "root": true,
  "ignorePatterns": ["**/*"],
  "plugins": ["@nrwl/nx"],
  "overrides": [
    {
      "files": ["*.ts", "*.tsx", "*.js", "*.jsx"],
      "rules": {
        "@nrwl/nx/enforce-module-boundaries": [
          "error",
          {
            "enforceBuildableLibDependency": true,
            "allow": [],
            "depConstraints": [
              {
                "sourceTag": "*",
                "onlyDependOnLibsWithTags": ["*"]
              }
            ]
          }
        ]
      }
    },
    {
      "files": ["*.ts", "*.tsx"],
      "extends": ["plugin:@nrwl/nx/typescript"],
      "parserOptions": {
        "project": ["apps/*/tsconfig.json", "apps/*/tsconfig.*?.json", "libs/*/tsconfig.*?.json"]
      },
      "rules": {
        "@typescript-eslint/consistent-type-exports": "warn",
        "@typescript-eslint/consistent-type-imports": "warn",
        "@typescript-eslint/explicit-module-boundary-types": ["warn", { "allowArgumentsExplicitlyTypedAsAny": true }],
        "@typescript-eslint/no-duplicate-imports": "warn",
        // "@typescript-eslint/no-unnecessary-condition": "warn", // this will require a lot of fixes to typings

        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-non-null-assertion": "off"
      }
    },
    {
      "files": ["*.js", "*.jsx"],
      "extends": ["plugin:@nrwl/nx/javascript"],
      "rules": {}
    },
    {
      "files": ["*.spec.ts", "*.spec.tsx", "*.spec.js", "*.spec.jsx"],
      "env": {
        "jest": true
      },
      "rules": {}
    },
    {
      "files": ["*"],
      "rules": {
        "comma-dangle": ["warn", "always-multiline"],
        "max-len": ["warn", { "code": 120, "ignorePattern": "^import " }],
        "semi": ["warn", "never", { "beforeStatementContinuationChars": "never" }],
        "linebreak-style": ["warn", (require("os").EOL === "\r\n" ? "windows" : "unix")]
      }
    }
  ]
}
