#!/usr/bin/env python3
"""
ZeroState LMS — Git Pre-Commit Credential Scanner
==================================================
Prevents accidental exposure of secrets by scanning all staged files
before a commit is finalised.

Detects:
  • High-entropy strings (likely API keys, passwords, tokens)
  • AWS Access Key IDs  (AKIA...)
  • Hardcoded application.properties secrets
    (spring.datasource.password, jwt.secret, etc.)
  • Generic patterns: private keys, bearer tokens, basic-auth creds

Usage:
  1. Copy / symlink this file to .git/hooks/pre-commit
  2. Make it executable:  chmod +x .git/hooks/pre-commit
  3. On Windows, see SECURITY.md for a wrapper batch file.

Exit 0 → commit proceeds   |   Exit 1 → commit is blocked
"""

import sys
import re
import math
import subprocess
from pathlib import Path

# ── Configuration ────────────────────────────────────────────────────────────

# Files to always skip (binary / generated / lockfiles)
SKIP_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".woff", ".woff2",
    ".ttf", ".eot", ".pdf", ".zip", ".jar", ".class",
    ".lock", ".map",
}

# Files to always skip by name
SKIP_FILENAMES = {
    "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
    "pre-commit-scanner.py",  # don't scan ourselves
}

# Minimum length for entropy analysis
MIN_ENTROPY_STRING_LENGTH = 20
# Shannon entropy threshold — strings above this are flagged
HIGH_ENTROPY_THRESHOLD = 4.5

# ── Secret patterns ──────────────────────────────────────────────────────────

PATTERNS = [
    # AWS
    (r"AKIA[0-9A-Z]{16}", "AWS Access Key ID"),
    (r"(?i)aws[_\-\.]?secret[_\-\.]?access[_\-\.]?key\s*[=:]\s*\S+", "AWS Secret Key assignment"),

    # Private keys / certificates
    (r"-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----", "Private key block"),
    (r"-----BEGIN CERTIFICATE-----", "Certificate block"),

    # JWT / generic secrets in properties files
    (r"(?i)(jwt[._-]?secret|app[._-]?secret|secret[._-]?key)\s*[=:]\s*\S{8,}", "JWT / App secret"),

    # Spring datasource credentials
    (r"(?i)spring\.datasource\.password\s*=\s*\S+", "Spring datasource password"),
    (r"(?i)spring\.datasource\.username\s*=\s*\S+", "Spring datasource username (verify intent)"),
    (r"(?i)spring\.datasource\.url\s*=\s*jdbc:\S+", "Spring datasource URL (may contain credentials)"),

    # Generic password assignments
    (r"(?i)(password|passwd|pwd)\s*[=:]\s*['\"]?\S{6,}['\"]?", "Hardcoded password"),

    # Bearer / Basic auth tokens in source code
    (r"(?i)Authorization\s*:\s*(Bearer|Basic)\s+[A-Za-z0-9+/=_\-\.]{20,}", "Hardcoded Authorization header"),

    # Generic API key patterns
    (r"(?i)(api[_\-]?key|apikey)\s*[=:]\s*['\"]?\w{16,}['\"]?", "Hardcoded API key"),

    # GitHub / GitLab personal access tokens
    (r"ghp_[A-Za-z0-9]{36}", "GitHub Personal Access Token"),
    (r"glpat-[A-Za-z0-9\-_]{20}", "GitLab Personal Access Token"),

    # Generic high-value tokens
    (r"(?i)token\s*[=:]\s*['\"]?[A-Za-z0-9+/=_\-\.]{32,}['\"]?", "Hardcoded token"),
]

# ── Helper functions ─────────────────────────────────────────────────────────

def get_staged_files() -> list[str]:
    """Return a list of staged file paths (added / modified only)."""
    result = subprocess.run(
        ["git", "diff", "--cached", "--name-only", "--diff-filter=ACM"],
        capture_output=True, text=True
    )
    return [f.strip() for f in result.stdout.splitlines() if f.strip()]


def get_staged_content(filepath: str) -> str | None:
    """Return the staged (index) content of a file as a string."""
    result = subprocess.run(
        ["git", "show", f":{filepath}"],
        capture_output=True
    )
    if result.returncode != 0:
        return None
    try:
        return result.stdout.decode("utf-8", errors="replace")
    except Exception:
        return None


def shannon_entropy(s: str) -> float:
    """Calculate Shannon entropy of a string."""
    if not s:
        return 0.0
    freq = {}
    for c in s:
        freq[c] = freq.get(c, 0) + 1
    length = len(s)
    return -sum((count / length) * math.log2(count / length) for count in freq.values())


def high_entropy_strings(content: str, threshold: float = HIGH_ENTROPY_THRESHOLD) -> list[str]:
    """Extract tokens that look like random high-entropy secrets."""
    # Match quoted strings and long unquoted alphanumeric blobs
    candidates = re.findall(
        r"""['"][A-Za-z0-9+/=_\-\.]{%d,}['"]|[A-Za-z0-9+/=_\-\.]{%d,}""" % (
            MIN_ENTROPY_STRING_LENGTH, MIN_ENTROPY_STRING_LENGTH
        ),
        content
    )
    flagged = []
    for token in candidates:
        clean = token.strip("'\"")
        if shannon_entropy(clean) > threshold:
            flagged.append(clean[:60] + ("…" if len(clean) > 60 else ""))
    return flagged


def should_skip(filepath: str) -> bool:
    path = Path(filepath)
    if path.suffix.lower() in SKIP_EXTENSIONS:
        return True
    if path.name in SKIP_FILENAMES:
        return True
    return False


# ── Main scan logic ──────────────────────────────────────────────────────────

def scan():
    staged = get_staged_files()
    if not staged:
        print("[KeyGuard] No staged files to scan.")
        sys.exit(0)

    violations: list[tuple[str, int, str, str]] = []  # (file, line, reason, snippet)

    for filepath in staged:
        if should_skip(filepath):
            continue

        content = get_staged_content(filepath)
        if content is None:
            continue

        lines = content.splitlines()

        for lineno, line in enumerate(lines, start=1):
            # 1. Pattern-based detection
            for pattern, label in PATTERNS:
                if re.search(pattern, line):
                    snippet = line.strip()[:80]
                    violations.append((filepath, lineno, label, snippet))

        # 2. High-entropy scan (whole file, reported at line 0)
        flagged_tokens = high_entropy_strings(content)
        for token in flagged_tokens:
            violations.append((filepath, 0, "High-entropy string (possible secret)", token))

    if not violations:
        print("[KeyGuard] ✅  No secrets detected. Commit proceeding.")
        sys.exit(0)

    # ── Block the commit ─────────────────────────────────────────────────────
    print("\n" + "═" * 70)
    print("  🔴  KeyGuard Credential Scanner — COMMIT BLOCKED")
    print("═" * 70)
    print(f"\n  {len(violations)} potential secret(s) found in staged changes:\n")

    for filepath, lineno, reason, snippet in violations:
        location = f"{filepath}:{lineno}" if lineno else filepath
        print(f"  ⚠  [{reason}]")
        print(f"     File   : {location}")
        print(f"     Snippet: {snippet}")
        print()

    print("═" * 70)
    print("  Review the findings above.")
    print("  If these are false positives, you can bypass with:")
    print("    git commit --no-verify")
    print("  (Use --no-verify only when you are 100% certain it is safe.)")
    print("═" * 70 + "\n")
    sys.exit(1)


if __name__ == "__main__":
    scan()
