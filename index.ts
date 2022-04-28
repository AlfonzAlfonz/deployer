#!/usr/bin/env node
import { fs, path, cd, $, chalk, quiet } from "zx";

const start = Date.now();
const cwd = process.cwd();

interface Config {
  releases: string;
  current: string;
  repo: string;
  branch?: string;

  build?: string;
  afterSuccess?: string;

  maxCount: number;
}

const emptyConfig: Partial<Config> = {
  releases: "./releases",
  current: "./current",
  maxCount: 3
};
const configPath = path.resolve(cwd, "deployer.json");
const { releases, current, repo, build, branch, maxCount, afterSuccess } = {
  ...emptyConfig,
  ...await fs.readJSON(configPath, { throws: false }).catch(e => {
    console.error(chalk.red("Config file not found"));
    process.exit(1);
  }) as Config
};

const releasesDir = path.resolve(cwd, releases);

const date = new Date();
const now = Date.now();

const day = 1000 * 60 * 60 * 24;

const id = `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}-${`${date.getDate()}`.padStart(2, "0")}-${now - Math.floor(now / day) * day}-${`${Math.round(Math.random() * 256)}`.padStart(3, "0")}`;
const releaseDir = path.resolve(cwd, releasesDir, id);

console.info(chalk.green("\n[Starting new release]"));
console.info(`config: ${configPath}`);
console.info(`id: ${id}`);
console.info(`repo: ${repo}`);
branch && console.info(`branch: ${branch}`);
console.info();

await fs.mkdir(releaseDir, { recursive: true });

let success = false;

try {
  cd(releaseDir);

  console.info(chalk.green("\n[Starting git clone]"));

  await $`git clone --depth 1 ${branch ? ["-b", `${branch}`] : ""} ${repo} .`;

  console.info(chalk.green("\n[Running build script]"));

  build && await $([build] as any);

  console.info(chalk.green("\n[Creating symlink]"));
  await fs.rm(path.resolve(cwd, current), { recursive: true, force: true });
  await fs.symlink(releaseDir, path.resolve(cwd, current));

  success = true;
} catch (e) {
  console.error(chalk.black(chalk.bgRed("\nBuild failed\n")));
  console.info(e);
  fs.rm(releaseDir, { recursive: true, force: true });
}

console.info(chalk.green("\n[Removing old releases]"));

await fs.readdir(releasesDir)
  .then(x => x
    .sort()
    .slice(0, x.length <= maxCount ? 0 : maxCount - 2)
    .forEach(r => {
      fs.rm(path.resolve(releasesDir, r), { recursive: true, force: true });
    })
  );

if (success) {
  console.info(chalk.green("\n[Running afterSuccess script]"));
  afterSuccess && await $([afterSuccess] as any);
}

console.info(`\nDone in ${((Date.now() - start) / 1000).toFixed(2)}s. `);
