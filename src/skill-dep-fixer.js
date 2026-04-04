#!/usr/bin/env node

const path = require('path');
const { parseManifest } = require('./parsers');

let checkers;
let installer;

try {
  checkers = require('./src/checkers');
} catch {
  checkers = require('./checkers');
}

try {
  installer = require('./src/installer');
} catch {
  installer = require('./installer');
}

function parseArgs(argv) {
  return {
    fix: argv.includes('--fix'),
    dryRun: argv.includes('--dry-run'),
    manifest: (() => {
      const i = argv.findIndex((a) => a === '--manifest');
      return i >= 0 ? argv[i + 1] : 'skills-manifest.yml';
    })(),
  };
}

function getDeps(skill) {
  const deps = skill?.dependencies || {};
  return {
    brew: Array.isArray(deps.brew) ? deps.brew : [],
    npm: Array.isArray(deps.npm) ? deps.npm : [],
    pip: Array.isArray(deps.pip) ? deps.pip : [],
  };
}

function checkOne(type, name) {
  if (type === 'brew') return checkers.checkBrew(name);
  if (type === 'npm') return checkers.checkNpm(name);
  if (type === 'pip') return checkers.checkPip(name);
  return { name, found: false, error: `Unsupported dependency type: ${type}` };
}

function installOne(type, name) {
  if (type === 'brew') return installer.installBrew(name);
  if (type === 'npm') return installer.installNpm(name);
  if (type === 'pip') return installer.installPip(name);
  return { name, status: 'skipped', message: `Unsupported dependency type: ${type}` };
}

function processDependency({ type, name, fix, dryRun }) {
  const check = checkOne(type, name);

  if (check.found) {
    return { type, check, action: { name, status: 'skipped', message: 'Already installed' } };
  }

  if (!fix) {
    return { type, check, action: { name, status: 'skipped', message: 'Missing dependency (run with --fix to install)' } };
  }

  if (dryRun) {
    return { type, check, action: { name, status: 'skipped', message: `Would install missing ${type} dependency: ${name}` } };
  }

  return { type, check, action: installOne(type, name) };
}

function run() {
  const args = parseArgs(process.argv.slice(2));
  const skills = parseManifest(args.manifest);

  const results = [];

  for (const skill of skills) {
    const skillName = skill.name || skill.id || 'unknown-skill';
    const deps = getDeps(skill);

    const entries = [];

    for (const name of deps.brew) {
      entries.push(processDependency({ type: 'brew', name, fix: args.fix, dryRun: args.dryRun }));
    }

    for (const name of deps.npm) {
      entries.push(processDependency({ type: 'npm', name, fix: args.fix, dryRun: args.dryRun }));
    }

    for (const name of deps.pip) {
      entries.push(processDependency({ type: 'pip', name, fix: args.fix, dryRun: args.dryRun }));
    }

    results.push({
      skill: skillName,
      path: skill.path ? path.resolve(skill.path) : undefined,
      dependencies: entries,
    });
  }

  process.stdout.write(`${JSON.stringify({
    manifest: args.manifest,
    fix: args.fix,
    dryRun: args.dryRun,
    skillCount: skills.length,
    results,
  }, null, 2)}\n`);
}

if (require.main === module) {
  run();
}

module.exports = { run };
