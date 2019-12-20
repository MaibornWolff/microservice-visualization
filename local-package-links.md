# symlink a local dependency from package B to package A:

- cd into package A which is the package you want to use in package B
- run `yarn link`
- cd into the package B where you want to use package A
- run `yarn link A`
