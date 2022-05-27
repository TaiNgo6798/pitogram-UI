module.exports = {
  env: {
    node: true,
    browser: true,
    es6: true,
  },
  extends: ['eslint:recommended', 'plugin:react/recommended'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    parser: 'babel-eslint',
    ecmaFeatures: {
      modules: true,
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
    allowImportExportEverywhere: true,
  },
  plugins: ['react'],
  rules: {
    'react/prop-types': [1, { ignore: ['ignore'] }],
    'indent': ['error', 'tab'],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'never'],
    'no-mixed-spaces-and-tabs': 'off',
    'no-useless-escape': 0,
    'react/display-name': 'off',
    "no-multiple-empty-lines": [2, {"max": 1, "maxEOF": 0}]
  },
}
