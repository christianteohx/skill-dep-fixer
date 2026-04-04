const { exec } = require('child_process');

function run(command) {
  return new Promise((resolve) => {
    exec(command, (error, stdout, stderr) => {
      resolve({ ok: !error, stdout, stderr, error });
    });
  });
}

async function checkBinary(name) {
  const result = await run(`which ${name}`);
  return { name, found: result.ok };
}

async function checkBrew(formula) {
  const result = await run(`brew list ${formula}`);
  return { name: formula, found: result.ok };
}

async function checkNpm(pkg) {
  const result = await run(`npm list -g ${pkg}`);
  return { name: pkg, found: result.ok };
}

async function checkPip(pkg) {
  let result = await run(`pip show ${pkg}`);
  if (!result.ok) {
    result = await run(`pip3 show ${pkg}`);
  }
  return { name: pkg, found: result.ok };
}

module.exports = {
  checkBinary,
  checkBrew,
  checkNpm,
  checkPip,
};
