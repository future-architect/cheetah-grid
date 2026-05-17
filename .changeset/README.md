# Changesets

Add a changeset with `pnpm changeset` for package changes that should be released.

The release workflow runs `pnpm run version`, which applies Changesets version updates and then refreshes README/docs package version references.
