#!/usr/bin/env node

const { parseArgs } = require('util');
const { exec } = require('child_process');
const { parseSkills } = require('./src/parsers');
const { checkBinary } = require('./src/checkers');
const { textReport, jsonReport, discordReport, summarize } = require('./src/reporter');

function usage() {
  return [
    'Usage: skill-dep-fixer [options]',
    '',
    'Options:',
    '  --dry-run       Show what would be installed',
    '  --fix           Install missing dependencies',
    '  --skill <name>  Check only one skill',
    '  --json          Output JSON report',
    '  --report        Output Discord-formatted report',
    '  --help          Show this help text',
  ].join('\n');
}

function run(command) {
  return new Promise((resolve) => {
    exec(command, (error, stdout, stderr) => {
      resolve({ ok: !error, stdout, stderr, error });
    });
  });
}

function installCommand(entry) {
  if (entry.kind === 'brew' && entry.formula) return `brew install ${entry.formula}`;
  if (entry.kind === 'npm' && entry.id) return `npm install -g ${entry.id}`;
  if (entry.kind === 'pip' && entry.id) return `pip3 install ${entry.id}`;
  return null;
}

async function analyzeSkill(skill, opts) {
  const checks = [];

  for (const bin of skill.requires.bins || []) {
    const result = await checkBinary(bin);
    checks.push({ type: 'bin', name: bin, label: `bin:${bin}`, found: result.found });
  }

  for (const directive of skill.install || []) {
    for (const bin of directive.bins || []) {
      const existing = checks.find((c) => c.type === 'bin' && c.name === bin);
      if (!existing) {
        const result = await checkBinary(bin);
        checks.push({ type: 'bin', name: bin, label: `bin:${bin}`, found: result.found, via: directive });
      }
    }
  }

  const missing = checks.filter((c) => !c.found);
  const actions = [];
  let error = null;

  if (missing.length > 0) {
    for (const directive of skill.install || []) {
      const bins = directive.bins || [];
      const needed = bins.some((bin) => missing.some((m) => m.name === bin));
      if (!needed) continue;

      const command = installCommand(directive);
      if (!command) continue;

      if (opts.fix) {
        const installResult = await run(command);
        actions.push({ command, ok: installResult.ok });
        if (!installResult.ok && !error) {
          error = (installResult.stderr || installResult.stdout || installResult.error?.message || '').trim();
        }
      } else {
        actions.push({ command, ok: null, dryRun: true });
      }
    }
  }

  let status = 'ok';
  if (missing.length > 0 && !opts.fix) status = 'skipped';
  if (missing.length > 0 && opts.fix) {
    status = actions.length > 0 && actions.every((a) => a.ok) ? 'fixed' : 'failed';
    if (actions.length === 0) status = 'failed';
  }

  return {
    name: skill.skillName,
    path: skill.skillPath,
    status,
    missing,
    actions,
    error,
  };
}

async function runCli(argv = process.argv.slice(2)) {
  const { values } = parseArgs({
    args: argv,
    options: {
      'dry-run': { type: 'boolean', default: false },
      fix: { type: 'boolean', default: false },
      skill: { type: 'string' },
      json: { type: 'boolean', default: false },
      report: { type: 'boolean', default: false },
      help: { type: 'boolean', default: false },
    },
    allowPositionals: false,
  });

  if (values.help) {
    process.stdout.write(`${usage()}\n`);
    return 0;
  }

  const opts = {
    fix: Boolean(values.fix),
  };

  const allSkills = parseSkills();
  const selectedSkills = values.skill
    ? allSkills.filter((s) => s.skillName === values.skill)
    : allSkills;

  if (values.skill && selectedSkills.length === 0) {
    process.stderr.write(`Skill not found: ${values.skill}\n`);
    return 1;
  }

  const skills = [];
  for (const skill of selectedSkills) {
    skills.push(await analyzeSkill(skill, opts));
  }

  const results = { skills };
  results.summary = summarize(results);

  if (values.json) {
    process.stdout.write(`${JSON.stringify(jsonReport(results), null, 2)}\n`);
  } else if (values.report) {
    process.stdout.write(`${discordReport(results)}\n`);
  } else {
    process.stdout.write(`${textReport(results)}\n`);
    if (values['dry-run']) {
      const commands = skills.flatMap((s) => s.actions).map((a) => a.command);
      if (commands.length > 0) {
        process.stdout.write('\nPlanned install commands:\n');
        for (const command of commands) process.stdout.write(`- ${command}\n`);
      }
    }
  }

  return results.summary.failed > 0 ? 1 : 0;
}

if (require.main === module) {
  runCli().then((code) => {
    process.exitCode = code;
  });
}

module.exports = {
  usage,
  runCli,
};
