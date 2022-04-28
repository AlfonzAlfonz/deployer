# Deployer

Simple utility for deploying (primarily Node.js) applications from git repository.

## Getting started

Add deploy script to your repository:

```shell
# deploy.sh

yarn 
yarn build
```

Create `deployer.json` config file in server directory:

```json
{
  "repo": "git@github.com:AlfonzAlfonz/deployer.git",
  "deploy": "bash deploy.sh"
}
```

Run deployer to create a new release:

```
npx @alfonz/deployer
```

Deployer by default creates a `./releases` directory with release folders and creates symlink to `./current` after successful deploy.

## Config options

| Name      | Default Value | Description                                   |
|-----------|---------------|-----------------------------------------------|
| repo      |               | Repo uri **(required)**                       |
| releases  | './releases'  | Folder containing release folders             |
| current   | './current'   | Symlink to current release                    |
| branch    |               | Branch name                                   |
| build     |               | Build command                                 |
| onSuccess |               | Command which is ran after successful release |
| maxCount  | 3             | Max count of releases in releases folder      |

# Example config
```json
{
  "releases": "./releases",
  "current": "./current",
  "repo": "git@github.com:AlfonzAlfonz/deployer.git",
  "branch": "main",
  "deploy": "bash deploy.sh",
  "limit": 3
}
```