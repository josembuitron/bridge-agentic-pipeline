#!/usr/bin/env node

// BRIDGE Agentic Pipeline CLI
// Minimal surface: doctor (tool detection) + status (project state)
// This is a skeleton -- richer subcommands ship in later releases.

'use strict';

const path = require('path');

const COMMAND = process.argv[2];
const ARGS = process.argv.slice(3);

const USAGE = `Usage: bridge <command> [options]

Commands:
  doctor            Check Node.js, Python, and the BRIDGE CLI tool chain
  status [path]     Report on local project state (defaults to scanning clients/)
                    Add --markdown to emit a markdown table.

Run "bridge <command> --help" for command-specific help.
`;

function fail(message, code = 1) {
  process.stderr.write(message + '\n');
  process.exit(code);
}

async function main() {
  if (!COMMAND || COMMAND === '--help' || COMMAND === '-h' || COMMAND === 'help') {
    process.stdout.write(USAGE);
    process.exit(0);
  }

  switch (COMMAND) {
    case 'doctor': {
      const { runDoctor } = require(path.join(__dirname, 'lib', 'doctor.js'));
      const code = await runDoctor({ argv: ARGS });
      process.exit(code);
    }
    case 'status': {
      const { runStatus } = require(path.join(__dirname, 'lib', 'status.js'));
      const code = await runStatus({ argv: ARGS });
      process.exit(code);
    }
    default:
      fail(`Unknown command: ${COMMAND}\n\n${USAGE}`, 2);
  }
}

main().catch((err) => {
  fail(`bridge: unexpected error: ${err && err.message ? err.message : err}`);
});
