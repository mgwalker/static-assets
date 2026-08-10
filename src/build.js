import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import fs from "node:fs/promises";
import path from "node:path";
import postcss from "postcss";
import * as sass from "sass";
import pkg from "../package.json" with { type: "json" };

const scssEntrypoints = [{ input: "src/main.scss", output: "docs/main.css" }];

export const buildScss = async ({ mode = "production" } = {}) => {
  const version = pkg.version.split(".")[0];

  const indexVersions = [];
  for await (const entrypoint of scssEntrypoints) {
    const files = await fs.readdir(path.dirname(entrypoint.output));
    const versions = files
      .filter((filename) => /\.v\d+\./.test(filename))
      .map((filename) => +filename.match(/\.v(\d+)\./)[1])
      .sort((a, b) => a - b)
      .map((v) => `${v}`);

    entrypoint.indexVersion = versions.pop();
  }

  for await (const { indexVersion, input, output } of scssEntrypoints) {
    const compiled = sass.compile(input, {});

    const postcssPlugins = [autoprefixer];
    if (mode === "production") {
      postcssPlugins.push(cssnano);
    }

    const { css } = await postcss(postcssPlugins).process(compiled.css, {
      from: undefined,
    });

    await fs.mkdir(path.dirname(output), { recursive: true });

    await fs.writeFile(output.replace(".css", `.v${version}.css`), css);
    if (version === indexVersion) {
      await fs.writeFile(output, css);
    }
  }
};

if (import.meta.main) {
  buildScss();
}
