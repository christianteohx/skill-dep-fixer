const { execSync, spawnSync } = require('child_process');

function run(command) {
  return execSync(command, {
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
    shell: '/bin/bash',
  });
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function checkBrew(name) {
  try {
    run(`brew list ${shellQuote(name)} 2>/dev/null`);
    return { name, found: true };
  } catch {
    return { name, found: false };
  }
}

function checkNpm(name) {
  try {
    const output = run('npm list -g --depth=0');
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const match = output.match(new RegExp(`(?:^|\\n).*${escaped}@(\\S+)`, 'i'));

    if (!match) {
      return { name, found: false };
    }

    return { name, found: true, version: match[1] };
  } catch (error) {
    const stderr = error?.stderr?.toString()?.trim() || error?.message || 'Unknown error';
    return { name, found: false, error: stderr };
  }
}

function checkPip(name) {
  const result = spawnSync('pip', ['show', name], { encoding: 'utf8' });

  if (result.status !== 0) {
    return { name, found: false };
  }

  const versionLine = (result.stdout || '').split('\n').find((line) => line.startsWith('Version:'));
  const version = versionLine ? versionLine.replace('Version:', '').trim() : undefined;

  return version ? { name, found: true, version } : { name, found: true };
}

module.exports = {
  checkBrew,
  checkNpm,
  checkPip,
};
