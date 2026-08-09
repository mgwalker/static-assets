import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import fs from "node:fs/promises";
import path from "node:path";
import postcss from "postcss";
import * as sass from "sass";

const scssEntrypoints = [{ input: "src/main.scss", output: "docs/main.css" }];

export const buildScss = async ({ mode = "production" } = {}) => {
  const start = performance.now();

  for await (const { input, output } of scssEntrypoints) {
    const compiled = sass.compile(input, {});

    const postcssPlugins = [autoprefixer];
    if (mode === "production") {
      postcssPlugins.push(cssnano);
    }

    const { css } = await postcss(postcssPlugins).process(compiled.css, {
      from: undefined,
    });

    await fs.mkdir(path.dirname(output), { recursive: true });
    await fs.writeFile(output, css);
  }

  const stop = performance.now();
  const elapsed = Math.round((stop - start) * 100) / 100;
  console.log(`built stylesheets in ${elapsed} ms`);
};

if (import.meta.main) {
  buildScss();
}
