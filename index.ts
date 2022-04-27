#!/usr/bin/env node
import { fs, path, cd, $, chalk, quiet } from "zx";

const start = Date.now();

const cwd = process.cwd();

interface Config {
  releases: string;
  current: string;
  repo: string;
  branch?: string;
  deploy: string;
  limit: number;
}

const emptyConfig: Partial<Config> = {
  releases: "./releases",
  current: "./current",
  limit: 3
};
const configPath = path.resolve(cwd, "deploy-man.json");
const { releases, current, repo, deploy, branch, limit } = {
  ...emptyConfig,
  ...await fs.readJSON(path.resolve(cwd, "deploy-man.json"), { throws: false }).catch(e => {
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
console.info(`config: ${fs.existsSync(configPath) ? configPath : "not found"}`);
console.info(`id: ${id}`);
console.info(`repo: ${repo}`);
branch && console.info(`branch: ${branch}`);
console.info();

await fs.mkdir(releaseDir, { recursive: true });

try {
  cd(releaseDir);

  console.info(chalk.green("\n[Starting git clone]"));

  await $`git clone --depth 1 ${branch ? ["-b", `${branch}`] : ""} ${repo} .`;

  console.info(chalk.green("\n[Running deploy script]"));

  await $([deploy] as any);

  console.info(chalk.green("\n[Creating symlink]"));
  await fs.rm(path.resolve(cwd, current), { recursive: true, force: true });
  await fs.symlink(releaseDir, path.resolve(cwd, current));
} catch (e) {
  console.error(chalk.black(chalk.bgRed("\nBuild failed\n")));
  console.info(e);
  fs.rm(releaseDir, { recursive: true, force: true });
}

console.info(chalk.green("\n[Removing old releases]"));

await fs.readdir(releasesDir)
  .then(x => x
    .sort()
    .slice(0, x.length <= limit ? 0 : limit - 2)
    .forEach(r => {
      fs.rm(path.resolve(releasesDir, r), { recursive: true, force: true });
    })
  );

console.info(`\nDone in ${((Date.now() - start) / 1000).toFixed(2)}s. `);
