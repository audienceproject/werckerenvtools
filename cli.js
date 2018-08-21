#!/usr/bin/env node
require("yargs")
  .env("WERCKERENVTOOLS")
  .commandDir("src/cmds")
  .demandCommand()
  .help().argv;
