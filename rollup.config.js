import typescript from "rollup-plugin-typescript2";

export default [
  // CommonJS
  {
    input: "src/index.ts",

    output: {
      dir: "lib",
      format: "cjs",
    },

    plugins: [typescript({ useTsconfigDeclarationDir: true })],
  },
];
