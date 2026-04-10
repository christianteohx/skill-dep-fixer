---
name: skill-dep-fixer
description: Generate a Node.js CLI tool that scans OpenClaw skill SKILL.md files and auto-fixes missing dependencies (npm, pip, brew, system binaries). Trigger phrases: "fix skill dependencies", "skill-dep-fixer", "check skill dependencies", "skills are broken", "openclaw doctor".
homepage: https://github.com/christianteohx/skill-dep-fixer
user-invocable: true
metadata:
  {
    "openclaw":
      {
        "emoji": "🔧",
        "requires": { "bins": ["node"] }
      }
  }
---

# skill-dep-fixer Skill

Generate a Node.js CLI tool that scans installed OpenClaw skills, detects missing dependencies, and optionally auto-fixes them.

## When to invoke

Trigger when the user says or asks for:
- "fix skill dependencies"
- "skill-dep-fixer"
- "check skill dependencies"
- "skills are broken"
- "openclaw doctor"
- "skill has missing deps"

## Instructions

When triggered, generate a complete Node.js CLI project that:

### Core requirements
- Node.js 18+
- No external runtime dependencies (pure JavaScript/Node.js stdlib where possible)
- One-file entry point (`skill-dep-fixer.js`) with optional `src/` submodules
- Proper CLI argument parsing (manual or `minimist`-light)
- Colored terminal output using ANSI codes

### Commands to implement

| Command | Description |
|---------|-------------|
| `skill-dep-fixer --dry-run` | Scan and report (no changes) |
| `skill-dep-fixer --fix` | Install missing dependencies |
| `skill-dep-fixer --skill <name>` | Check a specific skill |
| `skill-dep-fixer --json` | JSON output |
| `skill-dep-fixer --report` | Discord-formatted compact report |
| `skill-dep-fixer --help` | Show usage |

### What to scan

Parse `SKILL.md` frontmatter from skills in:
- `~/.openclaw/skills/*/SKILL.md`
- `~/.openclaw/workspace/skills/*/SKILL.md`

Look for the `metadata.openclaw.install` array:

```yaml
metadata:
  openclaw:
    install:
      - id: chalk
        kind: npm
        bins: []
        label: "Install chalk"
      - id: gh
        kind: brew
        bins: ["gh"]
        label: "Install GitHub CLI"
      - id: python3
        kind: pip
        bins: ["python3"]
        label: "Install Python"
```

### Detection & fix logic

| Kind | Detection | Fix command |
|------|-----------|-------------|
| `brew` | `brew list <pkg>` | `brew install <pkg>` |
| `npm` | `npm list -g <pkg>` | `npm install -g <pkg>` |
| `pip` | `pip show <pkg>` | `pip install <pkg>` |
| `bins` (system) | `which <bin>` | Not auto-fixable — report only |

### Output format

Text table:
```
✅ github          — all deps satisfied
❌ summarize       — missing: summarize (brew) → installed ✅
⚠️  some-skill    — missing: some-binary (not auto-fixable)
```

Exit codes: `0` = all fixed/satisfied, `1` = some failed.

## Output

After generating, tell the user:
1. How to run: `node skill-dep-fixer.js --help`
2. How to install globally: `npm install -g skill-dep-fixer`
3. How to test: `skill-dep-fixer --dry-run`
