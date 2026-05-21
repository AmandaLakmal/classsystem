# Security Policy — ZeroState LMS

## KeyGuard Pre-Commit Credential Scanner

This repository ships a Python-based **credential scanner** that runs as a
Git pre-commit hook to prevent secrets (API keys, database passwords, JWT
secrets, AWS credentials, high-entropy strings, etc.) from ever reaching
version control.

---

### How It Works

Before every `git commit`, the script:

1. Inspects **staged files only** (`git diff --cached`).
2. Runs **pattern-matching** against a curated list of known secret signatures
   (AWS keys, Spring datasource credentials, JWT secrets, GitHub PATs, etc.).
3. Performs **Shannon entropy analysis** to catch random-looking tokens that
   aren't matched by a pattern (e.g. custom API keys, session tokens).
4. **Blocks the commit** if any finding is detected, printing a detailed report.

---

### Installation

#### Linux / macOS (one-liner)

```bash
cp scripts/pre-commit-scanner.py .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

Or use a symlink so updates to the script are picked up automatically:

```bash
ln -sf ../../scripts/pre-commit-scanner.py .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

#### Windows (PowerShell)

Create a wrapper script at `.git/hooks/pre-commit` (no extension):

```sh
#!/bin/sh
python scripts/pre-commit-scanner.py
```

Save the file **without** any extension, then Git will execute it via `sh`
(which ships with Git for Windows).

Alternatively, use the PowerShell wrapper:

```powershell
# Save as .git/hooks/pre-commit (no extension)
python "$PSScriptRoot\..\..\scripts\pre-commit-scanner.py"
```

---

### Bypassing for False Positives

If the scanner blocks a commit that you have verified is safe:

```bash
git commit --no-verify -m "your message"
```

> ⚠️ **Only use `--no-verify` when you are 100% certain the flagged content
> is not a real secret.** Every bypass should be documented in the PR
> description.

---

### What Is Scanned

| Category | Example Pattern |
|---|---|
| AWS Access Key IDs | `AKIA...` |
| Spring datasource password | `spring.datasource.password=` |
| Spring datasource URL | `spring.datasource.url=jdbc:...` |
| JWT / App secrets | `jwt.secret=`, `app.secret=` |
| Private key blocks | `-----BEGIN RSA PRIVATE KEY-----` |
| GitHub Personal Access Tokens | `ghp_...` |
| GitLab Personal Access Tokens | `glpat-...` |
| Hardcoded Authorization headers | `Authorization: Bearer <long token>` |
| Generic API keys | `apiKey=`, `api_key=` |
| Generic tokens | `token=<32+ char value>` |
| High-entropy strings | Shannon entropy > 4.5 on 20+ char strings |

---

### Files Excluded from Scanning

- Binary files (images, fonts, PDFs, JARs, class files)
- Lock files (`package-lock.json`, `yarn.lock`)
- Map files (`.map`)
- The scanner script itself

---

### Reporting Vulnerabilities

If you discover a real secret that has already been committed, please:

1. **Invalidate / rotate the credential immediately.**
2. Open a private security advisory on GitHub (or contact the maintainer).
3. Purge the secret from Git history using `git filter-repo` or BFG.

Do **not** open a public issue for credential exposures.
