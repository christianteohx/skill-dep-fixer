# skill-dep-fixer

Checks OpenClaw skill dependencies from `SKILL.md` frontmatter and reports missing binaries.
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

Skill                            Status      Missing Dependencies
------------------------------------------------------------------------------------
✅ weather                       ok          none
⚠️ summarize                     skipped     bin:yt-dlp

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
      "missing": []
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
