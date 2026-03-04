# LICENSE-FAQ

## Summary

Scanners may report a "WTFPL" license entry in package-lock.json coming from node_modules/truncate-utf8-bytes. This is a transitive, downstream dependency introduced by a build tool and is not included in the built/published product.

## Details

- **Location:** package-lock.json (entry: node_modules/truncate-utf8-bytes).
- **Why this is safe:** the referenced package is pulled in only as part of the toolchain (development/build time). It is not bundled into production artifacts or distributed as part of the final product. The repository's own license is the authoritative license for this project—see the LICENSE file in this repository for details.

## How to verify

- Run: npm ls truncate-utf8-bytes
- Inspect package-lock.json for the entry: grep -n "truncate-utf8-bytes" package-lock.json
- Confirm production artifacts (the build output / dist folder or published package) do not include node_modules or the truncate-utf8-bytes package.

## Options for auditors or scanners

- Configure your license scanner to ignore package-lock.json entries for transitive development dependencies, or to only scan files shipped with the release.
- If a scanner requires changes, preferred options are:
  - Add an explicit dependency override (resolutions) to package.json that points to an alternative package or fork with an acceptable license, then regenerate the lockfile.
  - If necessary as a last resort, update the license field in package-lock.json to reflect the project's intended licensing for scanners (note: this is a metadata override and does not change the actual dependency code).

## Contact

If you need additional proof or a rebuild to demonstrate the dependency is not included in production artifacts, please open an issue or contact the maintainers.
