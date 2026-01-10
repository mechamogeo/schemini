/**
 * Semantic Release configuration for @schemini/core
 * @see https://semantic-release.gitbook.io/semantic-release/usage/configuration
 */
module.exports = {
  extends: 'semantic-release-monorepo',
  branches: ['main'],
  tagFormat: '@schemini/core@${version}',
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'conventionalcommits',
        releaseRules: [
          { type: 'feat', release: 'minor' },
          { type: 'fix', release: 'patch' },
          { type: 'perf', release: 'patch' },
          { type: 'refactor', release: 'patch' },
          { type: 'docs', release: 'patch' },
          { type: 'style', release: 'patch' },
          { type: 'chore', release: false },
          { type: 'ci', release: false },
          { type: 'test', release: false },
          { type: 'build', release: false },
          { breaking: true, release: 'major' },
        ],
      },
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'conventionalcommits',
        presetConfig: {
          types: [
            { type: 'feat', section: 'Features' },
            { type: 'fix', section: 'Bug Fixes' },
            { type: 'perf', section: 'Performance Improvements' },
            { type: 'refactor', section: 'Code Refactoring' },
            { type: 'docs', section: 'Documentation' },
            { type: 'style', section: 'Styles' },
            { type: 'chore', section: 'Chores', hidden: true },
            { type: 'ci', section: 'CI', hidden: true },
            { type: 'test', section: 'Tests', hidden: true },
            { type: 'build', section: 'Build', hidden: true },
          ],
        },
      },
    ],
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md',
      },
    ],
    [
      '@semantic-release/npm',
      {
        npmPublish: true,
      },
    ],
    [
      '@semantic-release/github',
      {
        assets: [],
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: ['CHANGELOG.md', 'package.json'],
        message:
          'chore(release): @schemini/core@${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
  ],
};
