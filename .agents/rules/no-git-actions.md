# Git Actions Restriction Rule

- **Do NOT execute git mutating commands**: Under no circumstances should agent tools run `git add`, `git commit`, `git push`, `git checkout`, `git reset`, `git rebase`, `git merge`, `git cherry-pick`, `git stash`, or any other command that modifies the git index, working tree state, commit history, or remote branches without explicit, unambiguous permission from the user.
- **Git Read-Only Allowed**: Read-only commands like `git status`, `git diff`, `git log`, and `git branch` are permitted to inspect state and review changes.
- **Leave Git Staging & Commits to the User**: Any code changes, bug fixes, or optimizations created by the agent must remain as working tree edits. The user retains full control over reviewing, staging (`git add`), committing (`git commit`), and pushing (`git push`) their code.

