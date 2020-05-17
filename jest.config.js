const { compilerOptions } = require("./tsconfig");
const moduleFileExtensions = ["ts", "tsx", "js"];

module.exports = {
  moduleFileExtensions,

  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },

  globals: {
    "ts-jest": {
      tsConfig: {
        ...compilerOptions,

        /* Settings to overwrite */
      },
    },
  },

  testMatch: moduleFileExtensions.map((ex) => `**/test/**/*.spec.${ex}`),
};
