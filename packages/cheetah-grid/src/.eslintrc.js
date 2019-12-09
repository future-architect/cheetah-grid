'use strict'

module.exports = {
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      "parser": "@typescript-eslint/parser",
      parserOptions: {
          loggerFn: false,
          project: "tsconfig.json",
      },
      "plugins": ["@typescript-eslint","prettier"],
      "extends": [
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "prettier",
        "prettier/@typescript-eslint"
      ],
      rules: {
        "@typescript-eslint/no-use-before-define": "off",
        "prettier/prettier": "error",
        "no-useless-constructor": "off",
        "@typescript-eslint/no-unused-vars": [
          'error',
          {'vars': 'all', 'args': 'none'}
        ],
        "no-unused-expressions": "off"
      }
    }
  ]
}