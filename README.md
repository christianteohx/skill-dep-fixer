# skill-dep-fixer

Checks OpenClaw skill dependencies from `SKILL.md` frontmatter, reports missing binaries,
and detects installed-vs-declared version mismatches.
Optionally installs missing dependencies declared in `metadata.openclaw.install`.

## Install

Global install:

```bash
npm install -g skill-dep-fixer
```

For local development in this repo:

```bash
npm link
```

## Usage

```bash
skill-dep-fixer --dry-run
```

### Flags

- `--dry-run` show what would be installed (no changes)
- `--fix` install missing dependencies
- `--skill <name>` only check a specific skill
- `--init <name>` create `~/.openclaw/workspace/skills/<name>/SKILL.md`
- `--name <name>` display name used in `# <Skill Name>` when used with `--init`
- `--description <text>` description frontmatter value for `--init` (prompts if omitted)
- `--json` output machine-readable JSON
- `--report` output compact Discord-formatted report
- `--help` show usage

## Examples

```bash
# check all skills, print human-readable table
skill-dep-fixer --dry-run

# check one skill
skill-dep-fixer --skill weather --dry-run

# install missing dependencies
skill-dep-fixer --fix

# JSON for scripts
skill-dep-fixer --json --dry-run

# Discord-ready message
skill-dep-fixer --report --dry-run

# create a new skill template (prompts for missing fields)
skill-dep-fixer --init my-new-skill

# create without prompts
skill-dep-fixer --init my-new-skill --name "My New Skill" --description "Does useful things"
```

## Example output

Text report:

```text
Skill Dependency Report

Skill                            Status      Details
----------------------------------------------------------------------------------------------------
✅ github                         ok          missing: none
   ✅ gh 2.54.0 :: ok
⚠️ some-skill                     mismatch    missing: none
   ⚠️ github 2.53.0 (declared: 2.54.0) :: mismatch

Summary
total=2  fixed=1  failed=0  skipped=1
```

JSON report:

```json
{
  "skills": [
    {
      "name": "weather",
      "status": "ok",
      "missing": [],
      "mismatches": []
    }
  ],
  "summary": {
    "total": 1,
    "fixed": 1,
    "failed": 0,
    "skipped": 0
  }
}
```

## Optional `version` in install directives

If a skill declares a version under `metadata.openclaw.install[]`, `skill-dep-fixer`
compares it against the installed version when available:

```yaml
metadata:
  openclaw:
    install:
      - kind: npm
        id: github
        version: 2.54.0
        bins: [gh]
```

## Install

### Homebrew (macOS)
```bash
brew install christianteohx/tap/skill-dep-fixer
```

### Direct binary (macOS/Linux)
```bash
curl -fsSL https://github.com/christianteohx/skill-dep-fixer/releases/download/v1.0.0/skill-dep-fixer -o ~/bin/skill-dep-fixer
chmod +x ~/bin/skill-dep-fixer
```

### npm
```bash
npm install -g skill-dep-fixer
```
