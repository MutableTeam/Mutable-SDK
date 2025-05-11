import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import typescript from "@rollup/plugin-typescript"
import { terser } from "rollup-plugin-terser"
import dts from "rollup-plugin-dts"

const packageJson = require("./package.json")

export default [
  // CommonJS (for Node) and ES module (for bundlers) build
  {
    input: "src/index.ts",
    output: [
      {
        file: packageJson.main,
        format: "cjs",
        sourcemap: true,
      },
      {
        file: packageJson.module,
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [
      typescript({
        tsconfig: "./tsconfig.json",
        declaration: true,
        declarationDir: "dist",
      }),
      resolve(),
      commonjs(),
      terser(),
    ],
    external: [...Object.keys(packageJson.dependencies || {})],
  },
  // UMD build (for CDNs and direct browser usage)
  {
    input: "src/index.ts",
    output: {
      name: "MutableSDK",
      file: "dist/index.umd.js",
      format: "umd",
      sourcemap: true,
      globals: {
        // Specify global variable names for external dependencies
        // e.g., 'react': 'React'
      },
    },
    plugins: [
      typescript({
        tsconfig: "./tsconfig.json",
      }),
      resolve(),
      commonjs(),
      terser(),
    ],
    external: [], // Include all dependencies in the UMD build
  },
  // TypeScript declaration file
  {
    input: "dist/index.d.ts",
    output: [{ file: "dist/index.d.ts", format: "es" }],
    plugins: [dts()],
  },
]
