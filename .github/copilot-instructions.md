# Copilot Guidelines for Transeki Desktop

## Commit Message Rules (ALWAYS FOLLOW)

1. Read the code changes carefully
2. Determine the TYPE of change
3. Identify the SCOPE if applicable
4. Write clear, concise description

### Format

<type>(<scope>): <subject>

### Types (Must Use)

- `feat:` - New feature
- `fix:` - Bug fix
- `perf:` - Performance optimization
- `refactor:` - Code restructure
- `style:` - Formatting/styling
- `chore:` - Maintenance/config
- `docs:` - Documentation
- `test:` - Tests

### Scope (Optional but Recommended)

Use component/area name in parentheses. Examples:

- `feat(MangaPanel):` - MangaPanel component
- `fix(SearchBar):` - SearchBar component
- `perf(MangaContainer):` - MangaContainer
- `chore(package.json):` - Dependencies

### Subject Line Guidelines

- ✅ Brief summary of changes
- ✅ The changes should be presented as featured focused (human said) not component / code focused
- ✅ Use imperative mood
- ✅ No period at end
- ✅ Max 50 chars
- ✅ If multiple or complex changes, combine all in one summary and detail in body / description
- ❌ No duplication of scope name in the summery if already in scope

### Description / Body Rules

- ✅ Explain the "why" and "what", not the "how"
- ✅ Imperative mood: "add" not "added"
- ✅ No period at end
- ✅ Keep to one line if possible
- ✅ Use bullet points for multiple changes
- ✅ Reference issues/PRs if relevant
- ❌ No code snippets
- ❌ No vague messages like "Update stuff"
