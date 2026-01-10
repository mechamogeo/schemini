## @schemini/core-v1.0.0 (2026-01-10)

### Features

* **ci:** migrate from changesets to semantic-release ([b6eb64e](https://github.com/mechamogeo/schemini/commit/b6eb64e77a3b900853347cbfd523c9914531cc5a))

### Bug Fixes

* **deps:** add @vitest/coverage-v8 for test coverage ([6cae37d](https://github.com/mechamogeo/schemini/commit/6cae37dad1b13495dacfd616fb0c838225c3cc84))
* **lint:** set noDelete rule to warn instead of error ([fa45344](https://github.com/mechamogeo/schemini/commit/fa4534420c33700cd19f01f26d4457eb6f84bb21))
* remove scoped registry from publishConfig ([3c87164](https://github.com/mechamogeo/schemini/commit/3c8716499430ee2fff1a7598fcda55bd5054e09e))

### Code Refactoring

* rename to @schemini/core and @schemini/locale ([89735c2](https://github.com/mechamogeo/schemini/commit/89735c2bfe64f830d446633a52bed18ffc6cb157))

### Documentation

* fix README badges and references to @schemini/core ([b84ff82](https://github.com/mechamogeo/schemini/commit/b84ff82e56598031953a9803f76dac08271c0302))
* restructure documentation and add GitHub Packages support ([#2](https://github.com/mechamogeo/schemini/issues/2)) ([74a319a](https://github.com/mechamogeo/schemini/commit/74a319a13105b3c856204d63126a2d00a0b9c989))

# @schemini/core

## 1.0.0

### Minor Changes

- [#2](https://github.com/mechamogeo/schemini/pull/2) [`74a319a`](https://github.com/mechamogeo/schemini/commit/74a319a13105b3c856204d63126a2d00a0b9c989) Thanks [@mechamogeo](https://github.com/mechamogeo)! - feat: restructure documentation and add GitHub Packages support

  - Add schemini logo to assets
  - Simplify READMEs for cleaner npm display
  - Create comprehensive GitHub Wiki documentation
  - Add GitHub Packages registry for dual distribution (npm + GitHub Packages)
  - Update release workflow to publish to both registries

## 0.1.1

### Patch Changes

- [`04840f6`](https://github.com/mechamogeo/schemini/commit/04840f658b4ff2c69650d9383e63c18408202f3d) Thanks [@mechamogeo](https://github.com/mechamogeo)! - Add npm provenance support for verified releases (signed by GitHub Actions)

- [`b84ff82`](https://github.com/mechamogeo/schemini/commit/b84ff82e56598031953a9803f76dac08271c0302) Thanks [@mechamogeo](https://github.com/mechamogeo)! - Fix README badges and update all references from mini-schema to @schemini/core
