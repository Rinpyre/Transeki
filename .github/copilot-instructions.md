# Copilot Guidelines for Transeki Desktop

## Commit Message Rules (ALWAYS FOLLOW)

For commit messages rules, please refer to the [Commit Message Guidelines](./instructions/commit-message-instructions.md) file. This file contains detailed instructions on how to format commit messages according to the conventional commit format, which is essential for maintaining a clear and consistent commit history.

## Pull Request Standards

### Title Format

- Use conventional commit format: `type(scope): brief description`
- Types: feat, fix, perf, refactor, style, chore, docs, test
- Scope: Specific component, feature, or area (not folder name)
- Examples:
  - ❌ feat(components): Update stuff
  - ✅ feat(MangaPanel): Add manga detail view with component reorganization
  - ✅ fix(SearchBar): Handle empty queries correctly

### Description Structure

Use the following format for comprehensive PRs:

```
## Overview
[High-level summary of the PR and its purpose]

## Changes

### [Category 1 - e.g., New Features, Bug Fixes, etc.]
- **[Feature/Component Name]**: [Brief description with key details]
  - [Sub-detail]
  - [Sub-detail]

### [Category 2 - e.g., Architecture, Refactoring, etc.]
- [Change 1]
- [Change 2]

## Notes
- [Important caveats, disabled features, TODOs]
- [What was tested]
- [Any concerns or follow-ups]

## Checklist
- [x] [Requirement met]
- [ ] [Requirement for follow-up PR]
```

### Description Guidelines

- **Overview**: 1-2 sentences explaining purpose and scope
- **Changes**: Organize by category (New Features, Architecture, Integration, etc.) not by file
- **Detail level**: Include key implementation details and design decisions
- **Format**: Use bold headers, bullet points, and sub-details for readability
- **Notes**: Include disabled features, TODOs, testing done, concerns
- **Checklist**: Optional but recommended for complex PRs

Do NOT include:

- File counts or line number stats (GitHub shows this)
- Code snippets or diffs (PR already shows these)
- Redundant commit messages (PR title should summarize)

### Scope Guidelines

- Scope should identify the **specific component or feature**, not the folder
- If multiple components/features are changed, use the main one as scope and detail others in description
- Examples: `MangaPanel`, `SearchBar`, `architecture`, `config`
- Not: `components`, `utils`, `routes` (too generic)

### Reviewer & Assignment

- Assign to `FireBoy00` for notification
- Request review from team member(s)
- Note: Author approval does not count toward merge requirements
  > **Important:** As of now, this is a solo project, so, all PRs will be assigned to `FireBoy00` and reviewed by `FireBoy00`. In the future, when more contributors join, we will update this guideline to reflect the new review process.

### PR Size & Scope

- One feature = one PR (keep related changes together)
- Aim for <500 lines changed for easier review
- If feature is massive, consider breaking into sequential PRs

### GitHub CLI Tips for PR Body Formatting

When using `gh pr create` or `gh pr edit` with markdown content containing backticks:

- ❌ **DO NOT** escape backticks with `\`` in the `--body` flag - the CLI will remove or mangle them
- ❌ **DO NOT** use `--body` flag for content with backticks - shell escaping causes issues
- ✅ **DO** use `--body-file` to pass PR body from a temporary markdown file instead
  - Create temp file with markdown content using `Out-File` or similar
  - Pass to `gh pr edit/create` with `--body-file pr_body.md`
  - Delete temp file after command completes
  - This preserves backticks and all markdown formatting perfectly

Example:

```powershell
@'
## Overview
Uses `getAppDataPath()` function for paths
'@ | Out-File -FilePath pr_body.md -Encoding UTF8
gh pr edit 2 --body-file pr_body.md
rm pr_body.md
```
