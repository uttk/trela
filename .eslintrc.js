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
    "prettier/@typescript-eslint",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
  ],

  settings: {
    react: {
      version: "detect",
    },

    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },

    "import/resolver": {
      typescript: {
        project: ["./tsconfig.json", "./test/tsconfig.json"],
      },
    },
  },

  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },

  parser: "@typescript-eslint/parser",

  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    sourceType: "module",
  },

  plugins: ["react", "jest", "import", "@typescript-eslint"],

  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      rules: {
        "@typescript-eslint/no-unused-vars": [2, { args: "none" }],
      },
    },
  ],

  rules: {
    "prettier/prettier": "error",
    "react/prop-types": "off",
    "import/prefer-default-export": "off",
    "import/order": [
      "error",
      {
        alphabetize: { order: "asc", caseInsensitive: true },
      },
    ],
  },
};
