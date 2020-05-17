module.exports = {
  env: {
    browser: true,
    es6: true,
    "jest/globals": true,
  },

  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:prettier/recommended",
    "prettier/@typescript-eslint"
  ],

  settings: {
    react: {
      version: "detect"
    },

    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx']
    },
  },

  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },

  parser: '@typescript-eslint/parser',

  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    sourceType: 'module',
  },

  plugins: [
    "react",
    "jest",
    '@typescript-eslint',
  ],

  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-unused-vars': [2, { args: 'none' }]
      }
    }
  ],

  rules: {
    "prettier/prettier": "error",
    "react/prop-types": "off",
    "import/prefer-default-export": "off"
  },
};
