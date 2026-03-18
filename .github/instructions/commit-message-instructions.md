# Copilot Guidelines for Adrian's Portfolio

## Commit Message Rules (ALWAYS FOLLOW)

1. Read the code changes carefully
2. Determine the TYPE of change
3. Identify the SCOPE always if possible (component, feature, area)
4. Write clear, concise description

### Format

`<type>(<scope>): <subject>`

### Types (Must Use)

- `feat:` - New user-visible feature or behavior (adds something the user can see/use)
- `fix:` - Bug fix
- `perf:` - Performance optimization
- `refactor:` - Code restructure with NO new user-visible behavior (moving code, extracting components, renaming, reorganizing)
- `style:` - Formatting/styling (whitespace, semicolons, CSS tweaks)
- `chore:` - Tooling, config, build setup, dependencies, path aliases, CI — anything that supports the project but isn't user-facing
- `docs:` - Documentation
- `test:` - Tests

### feat vs refactor vs chore — Quick Reference

| Change                                      | Type       |
| ------------------------------------------- | ---------- |
| Add new page / component / API endpoint     | `feat`     |
| Extract existing code into a component/util | `refactor` |
| Move files to a different folder            | `refactor` |
| Rename a variable/function for clarity      | `refactor` |
| Add vite alias, tsconfig path, eslint rule  | `chore`    |
| Add/remove/upgrade a dependency             | `chore`    |
| Update build config (vite.config, webpack)  | `chore`    |
| Add CV PDF or static asset to /public       | `chore`    |

### Scope (Component/Area)

Use component/area name in parentheses. Examples:

- `feat(UserAuth):` - User authentication component
- `fix(PaymentAPI):` - Payment endpoint
- `perf(SearchService):` - Search functionality optimization
- `chore(docker):` - Docker / containerization config
- `chore(deps):` - Dependencies

NOTE: Do NOT use file names as scope. Use the name of the feature/component/area instead.

### Subject Line Guidelines

- ✅ Brief summary of changes
- ✅ Start with uppercase first letter
- ✅ The changes should be presented as featured focused (human said) not component / code focused
- ✅ Use imperative mood
- ✅ No period at end
- ✅ Max 72 characters if possible
- ✅ If multiple or complex changes, combine all in one summary and detail in body / description
- ❌ No duplication of scope name in the summery if already in scope

### Description / Body Rules

- ✅ Explain the "why" and "what", not the "how"
- ✅ Imperative mood: "add" not "added"
- ✅ No period at end
- ✅ Use bullet points for multiple changes
- ✅ Keep to each change to 1 sentence if possible and max 72 characters if possible
- ✅ Reference issues/PRs if relevant
- ❌ No code snippets
- ❌ No vague messages like "Update stuff"
