const { pathsToModuleNameMapper } = require("ts-jest/utils");
const { compilerOptions } = require("./test/tsconfig.json");

const moduleFileExtensions = ["ts", "tsx", "js"];

// eslint-disable-next-line no-undef
module.exports = {
  preset: "ts-jest",

  moduleFileExtensions,

  globals: {
    "ts-jest": {
      tsConfig: "./test/tsconfig.json",
    },
  },

  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: "<rootDir>/",
  }),

  testMatch: moduleFileExtensions.map((ex) => `**/test/**/*.spec.${ex}`),
};
